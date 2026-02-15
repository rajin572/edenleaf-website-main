import { apiGet } from "@/lib/serverFetch";
import type { ISettingsPublic } from "@/types";

/** GET /settings/public — the backend's own Cache-Control is max-age=60, so
 *  match it here rather than re-fetching more or less often than it changes. */
export async function getPublicSettings() {
  const res = await apiGet<ISettingsPublic>("/settings/public", {
    tags: ["Settings"],
    revalidate: 60,
  });
  return res.data;
}
