import { NextRequest, NextResponse } from "next/server";
import { fetchWithAuth } from "@/lib/fetchWraper";

/** Proxies GET /orders/:id/invoice with the customer's own session cookie
 *  attached server-side. A plain <a href="{API}/orders/:id/invoice"> can't
 *  work here — that's a bare browser navigation with no Authorization header,
 *  so the backend 401s. Routing it through this same-origin handler lets
 *  fetchWithAuth attach the token before the request ever leaves the server. */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetchWithAuth(`/orders/${id}/invoice`, { method: "GET" });

  if (!res.ok) {
    return NextResponse.json({ success: false, message: "Could not download invoice" }, { status: res.status });
  }

  const blob = await res.blob();
  return new NextResponse(blob, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": res.headers.get("Content-Disposition") ?? `attachment; filename="invoice-${id}.pdf"`,
    },
  });
}
