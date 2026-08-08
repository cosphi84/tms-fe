import {NullableInt64} from "@/types/nullableIn";

export type OfficeType =  {
    id: number;
    parent_id: NullableInt64;
    code: string;
    name: string;
    type: string;
    depth: number;
    rgt: number;
    lft: number;
    children_count: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}
