import type { createInstance } from "@/lib/api/create-instance";

// Extend Axios config to support request metadata and retry flag
declare module "axios" {
    interface InternalAxiosRequestConfig {
        metadata?: { startTime: number };
        _retry?: boolean;
    }
}

export interface ApiRequestError {
    url: string | undefined;
    message: string;
    status: number | string | null;
    response: {
        data: { statusCode: number; message: string };
        status: number;
        statusText: string;
    };
    isNetworkError: boolean;
    isServerError: boolean;
    isClientError: boolean;
    isAuthError: boolean;
    timestamp: string;
}

export type Instance = ReturnType<typeof createInstance>;
