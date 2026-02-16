import { cookies } from "next/headers";
import { brandCookieName, legacyCookieName } from "./brandCookieNames";

// Helper function to get the Authorization token from cookies
export const getAuthToken = async () => {
  const cookieStore = await cookies();
  return cookieStore.get(brandCookieName("access_token"))?.value
    ?? cookieStore.get(legacyCookieName("access_token"))?.value;
};
