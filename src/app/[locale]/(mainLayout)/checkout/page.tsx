import CheckoutClient from "@/components/checkout/CheckoutClient";
import { getPublicSettings } from "@/service/SettingsService/settingsApi";

export default async function CheckoutPage() {
  const settings = await getPublicSettings();
  return <CheckoutClient settings={settings} />;
}
