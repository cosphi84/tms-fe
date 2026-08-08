import {LoginResponse} from "@/types/auth";
import Cookies from "js-cookie";
import {ACCESS_TOKEN_OPTIONS, COOKIE_NAMES, USER_COOKIE_OPTIONS} from "@/constants/cookies";

/**
 * Persist auth state after login. Only writes what JS is actually allowed to
 * write — access token + user profile. The refresh token cookie is set by the
 * backend via Set-Cookie (HttpOnly) on the same login response; there is
 * nothing for the client to do for it.
 */
export function setAuthCookies(data: Pick<LoginResponse, "access_token" | "user">): void {
    Cookies.set(COOKIE_NAMES.accessToken, data.access_token, {
        ...ACCESS_TOKEN_OPTIONS,
        expires: new Date(Date.now() + 15 * 60 * 1000),
    });
    Cookies.set(
        COOKIE_NAMES.user,
        btoa(encodeURIComponent(JSON.stringify(data.user))),
        USER_COOKIE_OPTIONS
    );
}

/**
 * Called after a silent refresh. Only the access token needs updating
 * client-side — the backend rotates the HttpOnly refresh cookie itself via
 * Set-Cookie on the /auth/refresh response.
 */
export function rotateAccessToken(accessToken: string): void {
    Cookies.set(COOKIE_NAMES.accessToken, accessToken, {
        ...ACCESS_TOKEN_OPTIONS,
        expires: new Date(Date.now() + 15 * 60 * 1000),
    });
}

/**
 * Clears the cookies JS can actually touch. The HttpOnly refresh cookie
 * cannot be cleared from here — call the /auth/logout endpoint (which should
 * respond with Set-Cookie Max-Age=0 for it) before or alongside this.
 */
export function clearAuthCookies(): void {
    Cookies.remove(COOKIE_NAMES.accessToken);
    Cookies.remove(COOKIE_NAMES.user);
}

export function getAccessToken(): string | undefined {
    return Cookies.get(COOKIE_NAMES.accessToken);
}

// getRefreshToken() intentionally removed. An HttpOnly cookie can never be
// read via document.cookie, so this always returned undefined — any caller
// branching on its result was silently getting the wrong answer.