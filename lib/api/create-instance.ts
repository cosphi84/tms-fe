import axios, { AxiosRequestConfig } from "axios";
import { apiHost } from "@/config/axios";
import { attachRequestInterceptor, attachResponseInterceptor } from "./interceptors";

export function createInstance(token?: string) {
    const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

    const instance = axios.create({
        baseURL: apiHost,
        withCredentials: true, // required so the HttpOnly refresh cookie is sent same-origin
        headers: {
            "Content-Type": "application/json",
            ...authHeader,
        },
    });

    attachRequestInterceptor(instance, token);
    attachResponseInterceptor(instance);

    // Note: the response interceptor above does `return response.data`, so at
    // runtime every call here resolves to T directly, not AxiosResponse<T>.
    // Axios's own generics can't express that (they type against the
    // pre-interceptor shape, and that shape has changed across axios
    // versions — see the AxiosResponseResult error). So we cast explicitly
    // at this boundary instead of fighting axios's generics: `as unknown as
    // Promise<T>` is the honest way to say "trust the interceptor, not the
    // library's static type."
    return {
        get: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
            instance.get(url, config) as unknown as Promise<T>,

        post: <T = unknown>(url: string, data: unknown = {}, config?: AxiosRequestConfig): Promise<T> =>
            instance.post(url, data, config) as unknown as Promise<T>,

        put: <T = unknown>(url: string, data: unknown = {}, config?: AxiosRequestConfig): Promise<T> =>
            instance.put(url, data, config) as unknown as Promise<T>,

        patch: <T = unknown>(url: string, data: unknown = {}, config?: AxiosRequestConfig): Promise<T> =>
            instance.patch(url, data, config) as unknown as Promise<T>,

        delete: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
            instance.delete(url, config) as unknown as Promise<T>,

        download: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
            instance.request({
                ...config,
                method: "GET",
                url,
                headers: { "Content-Type": "application/json", ...authHeader },
                responseType: "arraybuffer",
            }) as unknown as Promise<T>,

        request: instance.request.bind(instance),
        apiHost,
    };
}