import CookieBrowser from "js-cookie";
import { createInstance } from "@/lib/api/create-instance";
import {COOKIE_NAMES} from "@/constants/cookies";

export { axiosMultiPartConfig } from "@/config/axios";
export { getErrorMessage, buildApiRequestError } from "@/lib/api/errors";
export type { ApiRequestError, Instance } from "@/interface/axios";

/**
 * Browser-side instance.
 * Always reads the latest access token from cookie — handles rotated tokens
 * transparently. Pass withToken=false for unauthenticated requests (e.g. login).
 */
export function createBrowserInstance(withToken = true) {
    const token = withToken
        ? CookieBrowser.get(COOKIE_NAMES.accessToken)
        : undefined;
    return createInstance(token);
}

/**
 * Node/SSR instance. Pass the access token explicitly, forwarded from the
 * incoming request's cookie header (e.g. via next/headers `cookies()`).
 * Do not rely on js-cookie here — there is no `document` on the server.
 */
export function createNodeInstance(token?: string) {
    return createInstance(token);
}
