"use client"


import {
    QueryClient,
    useMutation,
    useQuery,
    useQueryClient,
    UseQueryOptions,
    UseQueryResult
} from "@tanstack/react-query";
import {LoginArg, LoginResponse} from "@/types/auth";
import {ApiRequestError, createBrowserInstance} from "@/lib/axios";
import {clearAuthCookies, setAuthCookies} from "@/lib/cookies";
import {useCallback, useEffect} from "react";
import {COOKIE_NAMES} from "@/constants/cookies";
import Cookies from "js-cookie";
import {UserType} from "@/types/user";
import {usePathname} from "next/navigation";
import {parseCookieUser} from "@/lib/jwt";
import {getQueryString} from "@/queries/url";
// ✅ Fixed: was importing `Query` from @tanstack/react-query, which shadowed
// this app's own `Query` filter-params type and silently broke getQueryString().
// TanStack's `Query` (cache-entry metadata) was never actually needed here.
import {Query} from "@/interface/query";

const QUERY_KEYS = {
    auth: ["USER", "BY-TOKEN"] as const,
    login: ["LOGIN"] as const,
} as const;

interface UseGetAuthOptions<TCache, TError, TData>
    extends UseQueryOptions<TCache, TError, TData> {
    redirectToLogin?: boolean;
    query?: Query;
}

async function loginRequest(variables: LoginArg): Promise<LoginResponse> {
    const axios = createBrowserInstance(false);
    return axios.post<LoginResponse>("/auth/login", variables);
}

function handleLoginSuccess(data: LoginResponse, queryClient: QueryClient): void {
    setAuthCookies(data);
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth });
}

export function useLogin() {
    const queryClient = useQueryClient();
    return useMutation<LoginResponse, ApiRequestError, LoginArg>({
        mutationKey: QUERY_KEYS.login,
        mutationFn: loginRequest,
        onSuccess: (data) => handleLoginSuccess(data, queryClient),
    });
}

export function useLogout(currentPath?: string) {
    const queryClient = useQueryClient();
    return useCallback(
        (callback?: () => void) => {
            // ✅ Fixed: no more early-return guard on accessToken presence.
            // That guard blocked force-logout in exactly the scenario that
            // matters most — access token already cleared (e.g. by an axios
            // interceptor after a failed refresh) but the app still needs to
            // fully tear down the session and redirect.

            // ✅ Fixed: refresh_token is httpOnly, so js-cookie can never see
            // or clear it client-side. Without this call, "logout" was purely
            // cosmetic — the refresh token stayed valid server-side and could
            // still mint new access tokens. Fire-and-forget: don't block the
            // redirect if the BE call fails (e.g. already offline).
            const axios = createBrowserInstance(false);
            void axios.post("/auth/logout").catch(() => {});

            localStorage.clear();
            clearAuthCookies();
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth });
            void queryClient.clear();

            const redirectTarget =
                currentPath ??
                encodeURIComponent(window.location.pathname + window.location.search);

            window.location.href = `/login?prev=${redirectTarget}`;
            callback?.();
        },
        [queryClient, currentPath]
    );
}

/**
 * Returns the currently logged-in user.
 *
 * Strategy:
 *  1. Read the tms_user cookie (set at login, updated on token rotation).
 *  2. If cookie is missing/corrupt, fall back to GET /user with access token.
 *  3. On an *auth* error (not network/5xx) and redirectToLogin=true, call logout().
 */
export function useGetAuth<TData = UserType>(
    options?: Partial<UseGetAuthOptions<UserType, ApiRequestError, TData>>
): UseQueryResult<TData, ApiRequestError> {
    const { redirectToLogin = true, query, ...restOptions } = options ?? {};
    const pathname = usePathname();
    const logout = useLogout(pathname);

    const result = useQuery<UserType, ApiRequestError, TData>({
        queryKey: QUERY_KEYS.auth,
        queryFn: async () => {
            // Fast path: decode from cookie (no network round-trip)
            const cookieUser = parseCookieUser(Cookies.get(COOKIE_NAMES.user));
            if (cookieUser) {
                // Cast CookieUser to UserProps (they share the same shape from BE)
                return cookieUser as unknown as UserType;
            }

            // Fallback: fetch from BE (e.g., cookie was manually cleared)
            const axios = createBrowserInstance();
            const qs = query ? `?${getQueryString(query)}` : "";
            return axios.get<UserType>(`/user${qs}`);
        },
        // Don't retry on auth errors — they go straight to logout
        retry: (failureCount, error) => {
            if (error.isAuthError) return false;
            return failureCount < 2;
        },
        ...restOptions,
    });

    useEffect(() => {
        // ✅ Fixed: was `result.isError` alone, which is also true after
        // network/5xx errors exhaust their retries — that forced a logout
        // on connectivity issues even though the session itself was fine.
        if (redirectToLogin && result.isError && result.error?.isAuthError) {
            logout();
        }
    }, [result.isError, result.error, redirectToLogin, logout]);

    return result as UseQueryResult<TData, ApiRequestError>;
}