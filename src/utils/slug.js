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
    .replace(/^-|-$/g, '');         // trim leading/trailing hyphens

  // Strip variant suffix like "SMC-00003__123" to get master product id
  const rawId = String(productId || '').split('__')[0].trim();

  // If rawId already starts with the name slug, return it directly
  if (nameSlug && rawId.toLowerCase().startsWith(nameSlug)) {
    return rawId.toLowerCase();
  }

  const idSlug = rawId
    .toLowerCase()
    .replace(/\s+/g, '-');

  return nameSlug ? `${nameSlug}-${idSlug}` : idSlug;
}

/**
 * Extract the product_id from a slug.
 *
 * Examples:
 *   "premium-girls-school-backpack-smc-00004" → "SMC-00004"
 *   "test-smc-00003"                          → "SMC-00003"
 *   "SMC-00003__variant-1"                    → "SMC-00003"
 *   "SMC-00004"                               → "SMC-00004"
 */
export function productIdFromSlug(slug = '') {
  if (!slug) return '';

  // Clean any variant suffix like "__123"
  const clean = String(slug).split('__')[0].trim();

  // Already a plain product_id (contains no lowercase letters before the dash pattern)
  if (/^SMC-/i.test(clean)) return clean.toUpperCase();

  // Find last occurrence of "smc-XXXXX" pattern in the slug
  const match = clean.match(/(?:^|-)((smc|prv?d?)-[\w-]+)$/i);
  if (match) {
    return match[1].toUpperCase();
  }

  // Fallback — return as-is (the API will handle it)
  return clean;
}

/**
 * Robust helper to obtain the canonical SEO slug for any product object.
 */
export function getProductSlug(item) {
  if (!item) return '';
  if (item.slug && !item.slug.includes('__')) return item.slug;
  const rawId = item.productId || item.product_id || item.id || '';
  const cleanId = String(rawId).split('__')[0].trim();
  return toSlug(item.name || '', cleanId);
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
