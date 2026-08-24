/**
 * slug.js — SEO-friendly URL slug helpers
 *
 * URL format: /products/premium-girls-school-backpack-smc-00004
 *              └─ kebab(productName) ──────────────┘ └─ productId ┘
 *
 * The product_id is embedded as the last hyphen-separated segment so the
 * detail page can resolve it without an extra API lookup.
 */

/**
 * Convert a product name + id into an SEO slug.
 * "Premium Girls School Backpack 30L" + "SMC-00004"
 *   → "premium-girls-school-backpack-30l-smc-00004"
 */
export function toSlug(name = '', productId = '') {
  const nameSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')   // strip special chars
    .replace(/\s+/g, '-')           // spaces → hyphens
    .replace(/-+/g, '-')            // collapse multiple hyphens
    .replace(/^-|-$/g, '');          // trim leading/trailing hyphens

  const idSlug = String(productId)
    .toLowerCase()
    .replace(/\s+/g, '-');

  return nameSlug ? `${nameSlug}-${idSlug}` : idSlug;
}

/**
 * Extract the product_id from a slug.
 *
 * We embed the product ID as the LAST segment after the final double-dash
 * or recognise it by the "smc-" prefix pattern.
 * Fallback: return the whole slug (for old-style ?product_id= URLs).
 *
 * Examples:
 *   "premium-girls-school-backpack-smc-00004" → "SMC-00004"
 *   "test-ksc-smc-00003"                      → "SMC-00003"
 *   "SMC-00004"                               → "SMC-00004"   (plain id)
 */
export function productIdFromSlug(slug = '') {
  if (!slug) return '';

  // Already a plain product_id (contains no lowercase letters before the dash pattern)
  if (/^SMC-/i.test(slug)) return slug.toUpperCase();

  // Find last occurrence of "smc-XXXXX" pattern in the slug
  const match = slug.match(/(?:^|-)((smc|prv?d?)-[\w-]+)$/i);
  if (match) {
    return match[1].toUpperCase();
  }

  // Fallback — return as-is (the API will handle it)
  return slug;
}

/**
 * Capitalise the first letter of each word (Title Case).
 * "test school bag" → "Test School Bag"
 */
export function toTitleCase(str = '') {
  return str
    .toLowerCase()
    .replace(/(?:^|\s|-)\S/g, (c) => c.toUpperCase());
}
