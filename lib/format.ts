import {isValidElement, ReactNode} from "react";

export function isValueExists(
    item?: string | number | null | ReactNode | unknown
): boolean {
    if (typeof item === "string") return item.trim() !== "" && item !== "null";
    if (typeof item === "number") return isFinite(item); // ✅ 0 and negatives are valid numbers
    if (Array.isArray(item))      return item.length > 0;
    if (item && typeof item === "object") return Object.keys(item).length > 0;
    return isValidElement(item);
}
