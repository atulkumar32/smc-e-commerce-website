/**
 * ProductDetailSeo
 *
 * Renders all SEO tags for the Product Detail page using react-helmet-async.
 *
 * Props come from the API-mapped product object (useProductDetail).
 * Fields that can be managed from the DB independently:
 *   product.meta_title       → overrides auto-generated title
 *   product.meta_description → overrides short_description fallback
 *   product.raw.slug         → overrides auto-generated slug
 *
 * Usage:
 *   <ProductDetailSeo product={product} selectedVariant={selectedVariant} path="/products/..." />
 */
import { Helmet } from 'react-helmet-async';
import {
  SITE_NAME, SITE_URL, SITE_LOCALE, SITE_CURRENCY,
  buildTitle, buildMetaDesc, canonicalUrl,
  buildProductJsonLd, buildBreadcrumbJsonLd,
} from '../../utils/seo';
import { toSlug, toTitleCase } from '../../utils/slug';

function ProductDetailSeo({ product, selectedVariant, path }) {
  if (!product) return null;

  // ── Title & description ───────────────────────────────────────────────────
  // Priority:  DB meta_title → "Product Name | Brand | Site"
  const displayName = toTitleCase(product.name);
  const metaTitle   = product.raw?.meta_title
    || buildTitle(
        [displayName, product.brand].filter(Boolean).join(' – '),
        SITE_NAME
       );

  // Priority:  DB meta_description → short_description → full_description fallback
  const metaDesc = buildMetaDesc(
    product.raw?.meta_description || product.shortDescription || product.description || ''
  );

  // ── Canonical URL ─────────────────────────────────────────────────────────
  const slug      = product.raw?.slug || toSlug(product.name, product.id);
  const canonical = canonicalUrl(path || `/products/${slug}`);

  // ── OG image ─────────────────────────────────────────────────────────────
  const ogImage = selectedVariant?.primaryImage || product.primaryImage || product.gallery?.[0] || '';

  // ── Price (from selected variant or top-level) ────────────────────────────
  const price    = selectedVariant?.sellingPrice ?? product.price ?? 0;
  const inStock  = (selectedVariant?.stock ?? product.stock ?? 0) > 0;
  const sku      = selectedVariant?.sku || product.raw?.sku || product.id;

  // ── JSON-LD ───────────────────────────────────────────────────────────────
  const productJsonLd = buildProductJsonLd({
    name:        displayName,
    description: metaDesc,
    brand:       product.brand,
    sku,
    price,
    currency:    SITE_CURRENCY,
    inStock,
    image:       ogImage,
    url:         canonical,
    ratingValue: product.rating,
    reviewCount: product.reviewCount,
  });

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home',     url: SITE_URL },
    { name: 'Products', url: `${SITE_URL}/products` },
    { name: displayName, url: canonical },
  ]);

  return (
    <Helmet>
      {/* ── Primary ── */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDesc} />
      <link rel="canonical" href={canonical} />
      <meta name="robots" content="index, follow" />

      {/* ── Open Graph ── */}
      <meta property="og:type"        content="product" />
      <meta property="og:title"       content={metaTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:url"         content={canonical} />
      <meta property="og:site_name"   content={SITE_NAME} />
      <meta property="og:locale"      content={SITE_LOCALE} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogImage && <meta property="og:image:alt" content={displayName} />}

      {/* ── Product-specific OG ── */}
      <meta property="product:price:amount"   content={String(price)} />
      <meta property="product:price:currency" content={SITE_CURRENCY} />
      {product.brand && <meta property="product:brand" content={product.brand} />}
      <meta property="product:availability" content={inStock ? 'in stock' : 'out of stock'} />
      {sku && <meta property="product:retailer_item_id" content={sku} />}

      {/* ── Twitter Card ── */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={metaTitle} />
      <meta name="twitter:description" content={metaDesc} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* ── JSON-LD structured data ── */}
      <script type="application/ld+json">
        {JSON.stringify(productJsonLd)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbJsonLd)}
      </script>
    </Helmet>
  );
}

export default ProductDetailSeo;
