import type { AxiosRequestConfig } from "axios";

export const apiHost = process.env["NEXT_PUBLIC_TLMS_BACKEND_API"];

// Single source of truth for "are we running in the browser".
// Used to gate anything that touches document/window/js-cookie, since this
// module tree is also imported by SSR / Node instances (createNodeInstance).
export const isBrowser = typeof window !== "undefined";

export const axiosMultiPartConfig: AxiosRequestConfig = {
    headers: { "Content-Type": "multipart/form-data" },
};
