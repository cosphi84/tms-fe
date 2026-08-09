import {OfficeType} from "@/types/offices";

export type UserType = {
    id: number;
    email: string;
    username: string;
    image: string;
    office_id: number;
    is_active: boolean;
    failed_login_attempts: number;
    last_login_at: string;
    last_login_from: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    office: OfficeType;
}

export type LoginUserResponse = {
    id: number;
    username: string;
    email: string;
    office_id: number;
    is_active: boolean;
    failed_login_attempts: number;
    last_login_at: string;
    last_login_from: string;
}