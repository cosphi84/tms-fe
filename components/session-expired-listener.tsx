"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onSessionExpired } from "@/lib/auth-events";

/**
 * Bridges the axios interceptor's session-expired signal to real navigation.
 * The interceptor itself can't call useRouter() (it isn't a component), so it
 * emits via lib/auth-events instead — this is the one place that turns that
 * signal into router.push(), with a router that's actually mounted in tree.
 *
 * Mount this once near the app root, e.g. inside your client Providers
 * wrapper, alongside QueryClientProvider.
 */
export function SessionExpiredListener() {
    const router = useRouter();

    useEffect(() => {
        onSessionExpired((prevPath) => {
            router.push(`/login?prev=${prevPath}`);
        });
    }, [router]);

    return null;
}