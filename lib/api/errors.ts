import type { AxiosError } from "axios";
import type { ApiRequestError } from "@/interface/axios";

export function getErrorMessage(
    error: AxiosError<{ message: string; statusCode: number; fields?: string[] }>
): Pick<ApiRequestError, "url" | "message" | "status"> {
    if (error.response) {
        const { status, statusText, data } = error.response;
        return {
            url: error.config?.url,
            message: data?.message || statusText || "Error",
            status: status ?? statusText ?? null,
        };
    }
    if (error.request) {
        return {
            url: error.config?.url,
            message: "Network error — no response received",
            status: null,
        };
    }
    return {
        url: error.config?.url,
        message: error.message || "Error",
        status: null,
    };
}

export function buildApiRequestError(
    error: AxiosError<{ message: string; statusCode: number }>
): ApiRequestError {
    const base = getErrorMessage(error);
    const httpStatus = error.response?.status ?? 0;

    return {
        ...base,
        response: {
            data: { statusCode: httpStatus, message: base.message },
            status: httpStatus,
            statusText: error.response?.statusText ?? "Unknown Error",
        },
        isNetworkError: !error.response,
        isServerError: httpStatus >= 500,
        isClientError: httpStatus >= 400 && httpStatus < 500,
        isAuthError: httpStatus === 401 || httpStatus === 403,
        timestamp: new Date().toISOString(),
    };
}
