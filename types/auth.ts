import {OfficeType} from "@/types/offices";
import {LoginUserResponse} from "@/types/user";

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
    user : LoginUserResponse
};

/** Shape returned by POST /auth/refresh */
export type RefreshResponse = {
    access_token: string;
    refresh_token: string;
};

/**
 * Lightweight user shape stored in tlms_user cookie.
 * Sourced directly from LoginResponse.user.
 */
export type CookieUser = {
    id: number;
    email: string;
    name: string;
    image: string;
    office_id: number;
    office: OfficeType;
};

export const defaultCookieUser: CookieUser = {
    id: 0,
    email: "",
    name: "",
    image: "",
    office_id: 0,
    office: {
        id: 0,
        parent_id: { Int64: 0, Valid: false },
        code: "",
        name: "",
        type: "",
        depth: 0,
        rgt: 0,
        lft: 0,
        children_count: 0,
        created_at: "",
        updated_at: "",
        deleted_at: null,
    },
};
