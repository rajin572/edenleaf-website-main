import { notFound } from "next/navigation";
import GuestReviewClient from "@/components/review/GuestReviewClient";
import type { ITrackedOrder } from "@/types";

const BASE_API = process.env.NEXT_PUBLIC_BASE_API;

/** GET /orders/track/:token is fully public and token-scoped — no cookies
 *  involved, so this is a plain server-side fetch rather than reusing the
 *  browser-only TrackingService (which reads js-cookie, a client-only API). */
async function trackOrderServerSide(token: string): Promise<ITrackedOrder | null> {
  try {
    const res = await fetch(`${BASE_API}/orders/track/${token}`, { cache: "no-store" });
    const json = await res.json();
    return json?.success ? (json.data as ITrackedOrder) : null;
  } catch {
    return null;
  }
}

export default async function GuestReviewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const order = await trackOrderServerSide(token);
  if (!order) notFound();
  return <GuestReviewClient token={token} items={order.items} />;
}
