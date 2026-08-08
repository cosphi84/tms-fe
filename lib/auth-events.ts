// A minimal event bridge between non-React code (axios interceptors, plain
// modules) and the React tree. Interceptors can't call useRouter() — that's a
// hook, and interceptors run outside any component. So instead of navigating
// directly, they emit a signal here; a listener component mounted near the
// app root (which *can* use useRouter()) picks it up and performs the actual
// client-side navigation.

type SessionExpiredHandler = (prevPath: string) => void;

let handler: SessionExpiredHandler | null = null;

/** Called once, from the root listener component's effect. */
export function onSessionExpired(fn: SessionExpiredHandler): void {
    handler = fn;
}

/** Called from the axios response interceptor on unrecoverable 401. */
export function emitSessionExpired(prevPath: string): void {
    handler?.(prevPath);
}