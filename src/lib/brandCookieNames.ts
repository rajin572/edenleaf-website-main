export const brandCookieName = (suffix: string) => `ednleaf_${suffix}`;

// Read and clear cookies issued before the Ednleaf rename until they expire.
export const legacyCookieName = (suffix: string) => `eCommerce_${suffix}`;
