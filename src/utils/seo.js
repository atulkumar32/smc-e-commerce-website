/**
 * seo.js — SEO helpers and constants for Shree Mahaveer Collections
 *
 * All values that need to change per-environment or per-brand are here.
 * Product-specific meta title / description come from the DB via the API
 * (fields: meta_title, meta_description, slug on the product object).
 * These helpers build fallbacks when the DB fields are absent.
 */

// ── Site-wide constants ───────────────────────────────────────────────────────
export const SITE_NAME        = 'Shree Mahaveer Collections';
export const SITE_URL         = 'https://shreemahaveercollections.com';
export const SITE_DESCRIPTION = 'Premium school bags, backpacks & kids accessories — quality you can trust.';
export const SITE_LOCALE      = 'en_IN';
export const SITE_CURRENCY    = 'INR';
export const TWITTER_HANDLE   = '@shreemahaveer';   // update if applicable

// ── Separator used in <title> ─────────────────────────────────────────────────
const SEP = ' | ';

/**
 * Build a page <title> string.
 * @param {string} pageTitle  – e.g. "Nike Air Max 270" or "School Bags"
 * @param {string} [suffix]   – defaults to SITE_NAME
 */
export function buildTitle(pageTitle, suffix = SITE_NAME) {
  if (!pageTitle) return suffix;
  return `${pageTitle}${SEP}${suffix}`;
}

/**
 * Build a meta description, clamped to 160 chars.
 * Priority: DB field → auto-generated fallback.
 */
export function buildMetaDesc(text = '', maxLen = 160) {
  const trimmed = (text || '').trim();
  if (!trimmed) return SITE_DESCRIPTION;
  return trimmed.length <= maxLen ? trimmed : `${trimmed.slice(0, maxLen - 1)}…`;
}

/**
 * Build a canonical URL for a page.
 * @param {string} path – e.g. "/products/premium-bag-smc-00004"
 */
export function canonicalUrl(path = '') {
  const clean = path.replace(/\/$/, '') || '/';
  return `${SITE_URL}${clean}`;
}

/**
 * Build Product JSON-LD structured data.
 * Fields from DB: name, description, brand, sku, price, currency,
 *                 availability (InStock/OutOfStock), image.
 */
export function buildProductJsonLd({
  name, description, brand, sku, price, currency = SITE_CURRENCY,
  inStock = true, image, url, ratingValue = 4, reviewCount = 0,
}) {
  const availability = inStock
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock';

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description: description || undefined,
    brand: brand ? { '@type': 'Brand', name: brand } : undefined,
    sku: sku || undefined,
    image: image || undefined,
    url: url || undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: currency,
      price: String(price),
      availability,
      url: url || undefined,
    },
    aggregateRating: reviewCount > 0
      ? {
          '@type': 'AggregateRating',
          ratingValue: String(ratingValue),
          reviewCount: String(reviewCount),
        }
      : undefined,
  };
}

/**
 * Build BreadcrumbList JSON-LD.
 * @param {Array<{name:string, url:string}>} items
 */
export function buildBreadcrumbJsonLd(items = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
