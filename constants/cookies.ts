import {isProduction} from "@/config/app";
import Cookies from "js-cookie";

// No `refreshToken` entry here on purpose. That cookie is HttpOnly and owned
// entirely by the backend (Set-Cookie on login/refresh, cleared on logout).
// document.cookie — and js-cookie, which is a thin wrapper over it — cannot
// read, write, or delete an HttpOnly cookie, so it has no place in a
// client-side cookie table.
export const COOKIE_NAMES = {
    accessToken: "tms_access_token",
    refresh: "tms_refresh_token",
    user: "tms_user",
} as const;

/** Access token: 15 minutes (matches BE expiry) */
export const ACCESS_TOKEN_OPTIONS: Cookies.CookieAttributes = {
    expires: new Date(Date.now() + 15 * 60 * 1000),
    sameSite: "lax",
    secure: isProduction,
};

/** User profile cookie: 7 days (mirrors refresh token lifetime on the BE) */
export const USER_COOKIE_OPTIONS: Cookies.CookieAttributes = {
    expires: 7,
    sameSite: "lax",
    secure: isProduction,
};