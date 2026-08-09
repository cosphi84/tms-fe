import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { nodeParseJwt, isTokenExpired } from "@/lib/jwt";

const publicPathnames = ["/login"];

// ─── Cookie names (must stay in sync with auth-helper.ts) ────────────────────
const COOKIE = {
    access: "tms_access_token",
    refresh: "tms_refresh_token",
    user: "tms_user",
} as const;

// ─── Proactive refresh (server-side, inside middleware) ───────────────────────
//
// We call the BE from inside the middleware when the access token is missing
// or has < 60s left. This happens BEFORE the response reaches the browser,
// so there is zero UI flicker — the new token is attached to the response
// cookie before any client sees a 401.
//

// ✅ Fixed: normalize so we never end up with "...backend.comauth/refresh"
// depending on whether the env var has a trailing slash or not.
const apiHost = (process.env["NEXT_PUBLIC_TLMS_BACKEND_API"] ?? "").replace(/\/+$/, "");

async function tryRefreshFromMiddleware(
    refreshToken: string
): Promise<{ access_token: string; refresh_token: string } | null> {
    if (!apiHost) return null;
    try {
        const res = await fetch(`${apiHost}/auth/refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // ✅ Fixed: refresh_token is httpOnly and BE-issued, so the
                // Go handler almost certainly reads it via c.Cookie(...),
                // the same way a real browser request would send it
                // automatically. This fetch() runs server-side in
                // middleware though, so nothing is attached automatically —
                // we have to forward it as a raw Cookie header ourselves.
                // ⚠️ NEEDS CONFIRMATION: the cookie name BE actually issues
                // via Set-Cookie on /auth/login — assumed here to be the
                // same "tms_refresh_token" this file already uses. If BE
                // uses a different name (e.g. plain "refresh_token"), this
                // still won't validate — swap COOKIE.refresh accordingly.
                Cookie: `${COOKIE.refresh}=${refreshToken}`,
            },
            // Edge-safe: no keep-alive, short timeout
            signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) return null;
        return res.json() as Promise<{ access_token: string; refresh_token: string }>;
    } catch {
        return null;
    }
}

// ─── Cookie helpers ───────────────────────────────────────────────────────────

function setTokenCookies(
    response: NextResponse,
    accessToken: string,
    refreshToken: string
) {
    const isProduction = process.env.NODE_ENV === "production";

    // Access token is intentionally NOT httpOnly: it's returned in the
    // /auth/login JSON body (not Set-Cookie) specifically so client JS can
    // read it and attach it as `Authorization: Bearer` in the axios
    // interceptor. Storing it in a readable cookie here just mirrors that.
    response.cookies.set(COOKIE.access, accessToken, {
        maxAge: 15 * 60, // 15 minutes
        sameSite: "lax",
        secure: isProduction,
        path: "/",
    });
    // ✅ Fixed: was missing httpOnly: true. Without it, NextResponse.cookies
    // defaults to a JS-readable cookie — meaning after the FIRST silent
    // refresh, the refresh token would flip from "httpOnly, BE-issued" to
    // "readable via document.cookie", undoing the whole point of making it
    // httpOnly in the first place.
    response.cookies.set(COOKIE.refresh, refreshToken, {
        maxAge: 7 * 24 * 60 * 60, // 7 days
        sameSite: "lax",
        secure: isProduction,
        httpOnly: true,
        path: "/",
    });
}

function clearTokenCookies(response: NextResponse) {
    response.cookies.delete(COOKIE.access);
    response.cookies.delete(COOKIE.refresh);
    response.cookies.delete(COOKIE.user);
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl;

    const buildCurrentPath = () =>
        encodeURI(`${pathname}${searchParams.toString() ? `?${searchParams}` : ""}`);

    // ✅ Fixed: dropped the unused `response?: NextResponse` param — every
    // call site passed nothing, so the conditional clear inside here never
    // ran. Callers that need cookies cleared do it explicitly on the
    // returned response instead (see below), which is what was actually
    // happening in practice anyway — this just removes the misleading dead
    // code path.
    const loginRedirect = () =>
        NextResponse.redirect(new URL(`/login?prev=${buildCurrentPath()}`, request.url));

    const accessCookie = request.cookies.get(COOKIE.access);
    const refreshCookie = request.cookies.get(COOKIE.refresh);

    const decodedAccess = accessCookie?.value
        ? nodeParseJwt(accessCookie.value)
        : null;

    // ── Is access token valid and has > 60s left? ────────────────────────────
    const accessValid =
        decodedAccess &&
        !isTokenExpired(decodedAccess, 60); // 60s buffer for proactive refresh

    // ── Authenticated user hitting /login → send home ────────────────────────
    if (accessValid && pathname === "/login") {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // ── Public paths — let through ───────────────────────────────────────────
    if (publicPathnames.includes(pathname)) {
        return NextResponse.next();
    }

    // ── Access token still good → allow ─────────────────────────────────────
    if (accessValid) {
        return NextResponse.next();
    }

    // ── Access token missing/expired → try silent refresh ───────────────────
    if (refreshCookie?.value) {
        const decodedRefresh = nodeParseJwt(refreshCookie.value);
        const refreshValid = decodedRefresh && !isTokenExpired(decodedRefresh);

        if (refreshValid) {
            const tokens = await tryRefreshFromMiddleware(refreshCookie.value);

            if (tokens) {
                // ✅ Fixed: also patch the *incoming request's* cookies, not
                // just the outgoing response. Without this, the current
                // request (e.g. an RSC render happening right now) still
                // sees the stale/expired access cookie — only the *next*
                // navigation would pick up the refreshed token. See:
                // https://nextjs.org/docs/app/building-your-application/routing/middleware#using-cookies
                request.cookies.set(COOKIE.access, tokens.access_token);
                request.cookies.set(COOKIE.refresh, tokens.refresh_token);

                const response = NextResponse.next({ request });
                setTokenCookies(response, tokens.access_token, tokens.refresh_token);
                return response;
            }
        }

        // Refresh token also expired / refresh failed
        const res = loginRedirect();
        clearTokenCookies(res);
        return res;
    }

    // ── No tokens at all → redirect to login ────────────────────────────────
    return loginRedirect();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.[a-zA-Z0-9]+$).*)",
    ],
};