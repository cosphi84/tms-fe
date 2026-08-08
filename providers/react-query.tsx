"use client";
import {
    QueryCache,
    QueryClient,
    QueryClientProvider,
    MutationCache,
    type Query,
    type QueryKey,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { type PropsWithChildren, useState } from "react";
import { type ApiRequestError } from "@/lib/axios";
import { toast, Toaster } from "sonner";
import { SessionExpiredListener } from "@/components/session-expired-listener";

// ─── Helpers ────────────────────────────────────────────────────────────────

function isApiRequestError(error: unknown): error is ApiRequestError {
    return (
        error !== null &&
        typeof error === "object" &&
        "message" in error &&
        "isNetworkError" in error &&
        "isServerError" in error &&
        "timestamp" in error
    );
}

function toApiRequestError(error: unknown): ApiRequestError | null {
    return isApiRequestError(error) ? error : null;
}

function showErrorToast(message: string, onRetry?: () => void) {
    toast.error(message, {
        description: "Silakan coba lagi atau hubungi administrator jika masalah berlanjut.",
        ...(onRetry && {
            action: { label: "Coba Lagi", onClick: onRetry },
        }),
    });
}

// ─── Error Handlers ─────────────────────────────────────────────────────────

function handleQueryError<TQueryFnData, TError, TData, TKey extends QueryKey>(
    error: unknown,
    query: Query<TQueryFnData, TError, TData, TKey>
) {
    const apiError = toApiRequestError(error);
    if (!apiError) {
        toast.error("Error", { description: "Terjadi kesalahan yang tidak terduga", duration: 5000 });
        return;
    }

    // 401 = token invalid/expired — already handled by the axios interceptor
    // (silent refresh, then SessionExpiredListener on final failure). Nothing
    // for this layer to say.
    if (apiError.status === 401) return;

    // 403 = authenticated but Casbin denies the action. This IS new
    // information for the user — silence here would just look like the app
    // did nothing.
    if (apiError.status === 403) {
        showErrorToast(apiError.message ?? "Anda tidak memiliki izin untuk mengakses data ini");
        return;
    }

    //errorLogger.logApiError(apiError, { component: "ReactQuery", action: "query_error" });

    // Retry only this query, not the whole page — query.fetch() re-runs the
    // exact queryFn that failed, no SPA state is thrown away.
    showErrorToast(
        apiError.message ?? "Terjadi kesalahan saat memuat data",
        () => { void query.fetch(); }
    );
}

function handleMutationError(error: unknown) {
    const apiError = toApiRequestError(error);
    if (!apiError) {
        toast.error("Error", { description: "Terjadi kesalahan yang tidak terduga", duration: 5000 });
        return;
    }

    if (apiError.status === 401) return;

    if (apiError.status === 403) {
        showErrorToast(apiError.message ?? "Anda tidak memiliki izin untuk melakukan aksi ini");
        return;
    }

    //errorLogger.logApiError(apiError, { component: "ReactQuery", action: "mutation_error" });

    // Note: mutation retry is context-dependent (form state, etc.) — caller
    // should handle it, so no retry action here.
    showErrorToast(apiError.message ?? "Terjadi kesalahan saat menyimpan data");
}

// ─── Retry Policy ────────────────────────────────────────────────────────────

function isClientError(error: unknown): boolean {
    if (error && typeof error === "object" && "status" in error) {
        const status = (error as { status?: number }).status;
        return typeof status === "number" && status >= 400 && status < 500;
    }
    return false;
}

// ─── Factory (avoids SSR singleton leak) ────────────────────────────────────

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                refetchOnMount: false,
                refetchOnReconnect: false,
                refetchInterval: false,
                refetchIntervalInBackground: false,
                gcTime: 1000 * 60 * 15,
                retry: (failureCount, error) => !isClientError(error) && failureCount < 3,
                retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
            },
            mutations: {
                retry: (failureCount, error) => !isClientError(error) && failureCount < 1,
                retryDelay: 1_000,
            },
        },
        queryCache: new QueryCache({ onError: handleQueryError }),
        mutationCache: new MutationCache({ onError: handleMutationError }),
    });
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function ReactQueryProvider({ children }: PropsWithChildren) {
    // Lazy initializer — runs once on mount, never re-runs
    // State value (not .current) is safe to read during render
    const [client] = useState(() => makeQueryClient());

    return (
        <QueryClientProvider client={client}>
            <SessionExpiredListener />
            {children}
            {process.env.NODE_ENV === "development" && (
                <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" position="bottom" />
            )}
            <Toaster />
        </QueryClientProvider>
    );
}