import { clientFetch } from "@/lib/clientFetch";
import type { INewsletterSubscriber } from "@/types";

type Req<T = Record<string, unknown>> = { body?: T; params?: Record<string, string> };
type ApiResult<T = unknown> =
  | { success: true; message: string; data?: T }
  | { success: false; message: string; data?: undefined };

const UNSUBSCRIBE_TOKEN_KEY = "ednleaf_newsletter_token";
const LEGACY_UNSUBSCRIBE_TOKEN_KEY = "eCommerce_newsletter_token";

/**
 * POST /newsletter/subscribe — public, no auth. Persists the returned
 * unsubscribe token locally since the backend never emails it (no mailer is
 * wired for this module yet) — see the unsubscribe flow below.
 */
export const subscribeToNewsletter = async (req: Req = {}): Promise<ApiResult<{ unsubscribeToken: string }>> => {
  const { email } = (req.body ?? {}) as Record<string, string>;
  const res = await clientFetch<{ subscriber: INewsletterSubscriber; unsubscribeToken: string }>(
    "/newsletter/subscribe",
    { method: "POST", body: { email }, auth: false }
  );
  if (res.success && res.data?.unsubscribeToken && typeof window !== "undefined") {
    window.localStorage.setItem(UNSUBSCRIBE_TOKEN_KEY, res.data.unsubscribeToken);
  }
  return res.success
    ? { success: true, message: res.message ?? "Subscribed", data: { unsubscribeToken: res.data!.unsubscribeToken } }
    : { success: false, message: res.message ?? "Could not subscribe. Please try again." };
};

/** POST /newsletter/unsubscribe — public, no auth, token-gated. */
export const unsubscribeFromNewsletter = async (req: Req = {}): Promise<ApiResult> => {
  const { token } = (req.body ?? {}) as Record<string, string>;
  const res = await clientFetch("/newsletter/unsubscribe", { method: "POST", body: { token }, auth: false });
  if (res.success && typeof window !== "undefined") {
    window.localStorage.removeItem(UNSUBSCRIBE_TOKEN_KEY);
    window.localStorage.removeItem(LEGACY_UNSUBSCRIBE_TOKEN_KEY);
  }
  return res.success
    ? { success: true, message: res.message ?? "Unsubscribed" }
    : { success: false, message: res.message ?? "This unsubscribe link is invalid or has expired." };
};

export const getStoredUnsubscribeToken = () =>
  typeof window !== "undefined"
    ? window.localStorage.getItem(UNSUBSCRIBE_TOKEN_KEY) ?? window.localStorage.getItem(LEGACY_UNSUBSCRIBE_TOKEN_KEY)
    : null;
