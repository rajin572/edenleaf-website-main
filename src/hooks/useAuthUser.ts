import { useMemo, useSyncExternalStore } from "react";
import { decodedToken } from "@/utils/jwt";
import { AUTH_UPDATED_EVENT, getClientToken } from "@/lib/clientFetch";
import type { IJwtPayload } from "@/types";

/**
 * Dispatched client-side right after a successful login or logout server
 * action resolves — those cookies are set/cleared inside "use server"
 * actions, so nothing else notifies already-mounted client components that
 * auth state changed.
 */
export { AUTH_UPDATED_EVENT };

const subscribe = (callback: () => void) => {
    window.addEventListener(AUTH_UPDATED_EVENT, callback);
    return () => window.removeEventListener(AUTH_UPDATED_EVENT, callback);
};

const getSnapshot = () => getClientToken() ?? null;
const getServerSnapshot = () => null;

/**
 * Single source of truth for "is a customer signed in," replacing the
 * duplicated useState+useEffect(Cookies.get(...)) copies previously in
 * TopBar, MobileAppBar and BottomNavBar.
 */
const useAuthUser = (): IJwtPayload | null => {
    const token = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    // Decode once per token. A fresh object every render made `user` an unstable effect
    // dependency, so effects keyed on it re-ran on every render.
    return useMemo(() => (token ? (decodedToken(token) as IJwtPayload | null) : null), [token]);
};

export default useAuthUser;
