import {UserType} from "@/types/user";

export type LoginArg = {
    email: string;
    password: string;
};

/**
 * Shape returned by POST /auth from Go backend.
 * access_token  → stored in tlms_access_token cookie (15 min)
 * refresh_token → stored in tlms_refresh_token cookie (7 days)
 * user          → stored in tlms_user cookie (base64 encoded)
 */
export type LoginResponse = {
    access_token: string;
    refresh_token: string;
    user: UserType;
};

/** Shape returned by POST /auth/refresh */
export type RefreshResponse = {
    access_token: string;
    refresh_token: string;
};