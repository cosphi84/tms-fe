import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { v4 as uuid4 } from "uuid";
import CookieBrowser from "js-cookie";
import { COOKIE_NAMES } from "@/constants/cookies";
import { clearAuthCookies } from "@/lib/cookies";
import { buildApiRequestError } from "./errors";
import { refreshAccessToken } from "./refresh";
import {isBrowser} from "@/config/axios";

/**
 * Attaches request timing metadata, a per-request trace ID, and the latest
 * access token (re-read from cookie every request, so a token rotated by a
 * silent refresh is picked up immediately without recreating the instance).
 */
export function attachRequestInterceptor(instance: AxiosInstance, fallbackToken?: string) {
    instance.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
            config.metadata = { startTime: Date.now() };
            config.headers["X-Request-ID"] = uuid4();

            // Guarded: js-cookie reads document.cookie, which doesn't exist server-side.
            const latestToken = isBrowser
                ? CookieBrowser.get(COOKIE_NAMES.accessToken) ?? fallbackToken
                : fallbackToken;
            if (latestToken) {
                config.headers["Authorization"] = `Bearer ${latestToken}`;
            }

            if (process.env.NODE_ENV === "development") {
                console.log("→ API Request:", {
                    method: config.method?.toUpperCase(),
                    url: `${config.baseURL}${config.url}`,
                });
            }

            return config;
        },
        (error) => {
            console.error("Request setup error:", error);
            return Promise.reject(error);
        }
    );
}

/**
 * Unwraps response.data on success, and on 401 runs the silent-refresh flow
 * (browser only) before retrying the original request once. SSR 401s are
 * passed through as normal errors — no queue, no window redirect available,
 * so the caller (server component / route handler) decides what to do.
 */
export function attachResponseInterceptor(instance: AxiosInstance) {
    instance.interceptors.response.use(
        (response) => {
            if (process.env.NODE_ENV === "development") {
                const duration = response.config.metadata
                    ? Date.now() - response.config.metadata.startTime
                    : -1;
                console.log(`← ${response.status} ${response.config.url} (${duration}ms)`);
            }
            return response.data;
        },
        async (error: AxiosError<{ message: string; statusCode: number }>) => {
            const originalConfig = error.config;

            if (
                isBrowser &&
                error.response?.status === 401 &&
                originalConfig &&
                !originalConfig._retry
            ) {
                originalConfig._retry = true;

                try {
                    const newToken = await refreshAccessToken();
                    originalConfig.headers["Authorization"] = `Bearer ${newToken}`;
                    return instance(originalConfig);
                } catch (refreshError) {
                    clearAuthCookies();
                    const prev = encodeURIComponent(
                        window.location.pathname + window.location.search
                    );
                    window.location.href = `/login?prev=${prev}`;
                    return Promise.reject(
                        buildApiRequestError(
                            refreshError as AxiosError<{ message: string; statusCode: number }>
                        )
                    );
                }
            }

            const apiError = buildApiRequestError(error);

            console.error("← API Error:", {
                url: apiError.url,
                status: apiError.status,
                message: apiError.message,
                duration: error.config?.metadata
                    ? Date.now() - error.config.metadata.startTime
                    : -1,
            });

            return Promise.reject(apiError);
        }
    );
}