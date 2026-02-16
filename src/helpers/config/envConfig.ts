export const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_BASE_API;
};

export const getServerUrl = () => {
  return process.env.NEXT_PUBLIC_SERVER_API;
};

// Public site origin (no trailing slash) — used for canonical URLs, sitemap,
// robots, Open Graph and JSON-LD. Set NEXT_PUBLIC_SITE_URL to the production
// domain before deploying; falls back to localhost in development.
export const getSiteUrl = () => {
  const url = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return url.replace(/\/$/, "");
};

// Business WhatsApp number in international format without "+" (e.g. 8801XXXXXXXXX).
// Left blank, wa.me still opens WhatsApp with the message pre-filled and lets the
// customer pick the contact, so the button is never a dead link.
export const getWhatsappNumber = () => {
  return process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
};

export const getContactEmail = () => {
  return process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "";
};

export const mapsApiKey = () => {
  return process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY;
};
