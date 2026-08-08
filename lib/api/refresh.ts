import axios from "axios";
import { rotateAccessToken } from "@/lib/cookies";
import type { RefreshResponse } from "@/types/auth";
import {apiHost} from "@/config/axios";

// ─── Silent Refresh (token rotation) ─────────────────────────────────────────
//
// The refresh token lives in an HttpOnly cookie — invisible to JS by design.
// It's never read here; it's sent automatically by the browser
// (withCredentials: true) when we hit the same-origin /auth/refresh endpoint.
// The backend reads it straight off the request cookie header and, if it
// rotates the refresh token, applies the new one via Set-Cookie — the browser
// handles that for us too.
//
// Mutex + queue: only ONE refresh call is in-flight at a time. Concurrent 401s
// all await the same in-flight promise instead of each firing their own
// refresh request.
//
// This state is module-scoped, which is only safe in the browser (one tab =
// one user). Callers MUST gate use of `refreshAccessToken` behind an
// `isBrowser` check — on the server this module is shared across concurrent
// requests from different users.
//

let isRefreshing = false;
let queue: Array<{
    resolve: (token: string) => void;
    reject: (err: unknown) => void;
}> = [];

function flushQueue(error: unknown, token: string | null) {
    queue.forEach(({ resolve, reject }) => {
        if (token) resolve(token);
        else reject(error);
    });
    queue = [];
}

async function callRefreshEndpoint(): Promise<string> {
    const res = await axios.post<RefreshResponse>(
        `${apiHost}auth/refresh`,
        {},
        {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
        }
    );

    const { access_token } = res.data;
    rotateAccessToken(access_token);
    return access_token;
}

/**
 * Get a fresh access token. If a refresh is already in flight, piggybacks on
 * it instead of firing a duplicate request. Browser-only — caller's
 * responsibility to check `isBrowser` first.
 */
export async function refreshAccessToken(): Promise<string> {
    if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
            queue.push({ resolve, reject });
        });
    }

    // Must be set before the first `await` below — function bodies run
    // synchronously up to that point, so this still closes the mutex window
    // for any concurrent caller that invokes refreshAccessToken() in the
    // same tick (e.g. several requests 401-ing together).
    isRefreshing = true;

    try {
        const token = await callRefreshEndpoint();
        flushQueue(null, token);
        return token;
    } catch (err) {
        flushQueue(err, null);
        throw err;
    } finally {
        isRefreshing = false;
    }
}