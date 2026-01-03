/**
 * Strips HTML tags and returns plain text
 * Works in both server-side and client-side environments
 * @param html - HTML string to process
 * @returns Plain text without HTML tags, styles, scripts
 */
export const stripHtmlTags = (html: string): string => {
  if (!html) return "";

  try {
    // Remove style tags and their content
    let text = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");

    // Remove script tags and their content
    text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");

    // Remove all HTML tags
    text = text.replace(/<[^>]+>/g, "");

    // Decode HTML entities using a more comprehensive approach
    text = decodeHtmlEntities(text);

    // Remove extra whitespace and newlines
    text = text.replace(/\s+/g, " ").trim();

    return text;
  } catch (error) {
    console.error("Error stripping HTML:", error);
    return "";
  }
};

/**
 * Decode HTML entities without using DOM
 * @param text - Text with HTML entities
 * @returns Decoded text
 */
const decodeHtmlEntities = (text: string): string => {
  // Common HTML entities
  const entities: Record<string, string> = {
    "&nbsp;": " ",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#039;": "'",
    "&apos;": "'",
    "&cent;": "¢",
    "&pound;": "£",
    "&yen;": "¥",
    "&euro;": "€",
    "&copy;": "©",
    "&reg;": "®",
    "&trade;": "™",
    "&times;": "×",
    "&divide;": "÷",
    "&hellip;": "…",
    "&mdash;": "—",
    "&ndash;": "–",
    "&lsquo;": "",
    "&rsquo;": "",
    "&ldquo;": '"',
    "&rdquo;": '"',
    "&bull;": "•",
    "&middot;": "·",
  };

  // Replace named entities
  let decoded = text;
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.replace(new RegExp(entity, "g"), char);
  }

  // Decode numeric entities (&#123; and &#xAB;)
  decoded = decoded.replace(/&#(\d+);/g, (_, dec) =>
    String.fromCharCode(parseInt(dec, 10)),
  );
  decoded = decoded.replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16)),
  );

  return decoded;
};
