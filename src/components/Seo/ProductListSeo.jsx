/**
 * ProductListSeo
 *
 * SEO tags for the Product Listing page (category / all products).
 *
 * Props:
 *   pageTitle    – e.g. "School Bags" or "All Products"
 *   category     – URL category key, e.g. "school-bags"
 *   totalCount   – number of products found
 *   description  – optional override; auto-generated if absent
 */
import { Helmet } from 'react-helmet-async';
import {
  SITE_NAME, SITE_URL, SITE_LOCALE,
  buildTitle, buildMetaDesc, canonicalUrl, buildBreadcrumbJsonLd,
} from '../../utils/seo';

// Category-level meta that can eventually come from a DB CMS table
const CATEGORY_META = {
  'school-bags': {
    title:       `School Bags for Kids – Lightweight & Durable${' | '}${SITE_NAME}`,
    description: 'Explore our range of premium school bags for kids. Lightweight, durable, and designed for comfort — perfect for every grade.',
  },
  purses: {
    title:       `Premium Purses & Handbags${' | '}${SITE_NAME}`,
    description: 'Handcrafted purses and handbags combining elegance with everyday practicality.',
  },
  wallets: {
    title:       `Wallets & Card Holders${' | '}${SITE_NAME}`,
    description: 'Slim, stylish wallets and card holders — genuine leather and premium materials.',
  },
  'new-arrivals': {
    title:       `New Arrivals – Latest Collection${' | '}${SITE_NAME}`,
    description: 'Be the first to shop our newest bags and accessories. Fresh styles added regularly.',
  },
};

function ProductListSeo({ pageTitle = 'All Products', category = 'all', totalCount }) {
  const cat      = CATEGORY_META[category];
  const path     = category && category !== 'all' ? `/products/${category}` : '/products';
  const canonical = canonicalUrl(path);

  const metaTitle = cat?.title || buildTitle(pageTitle);
  const baseDesc  = cat?.description
    || `Shop ${totalCount ? `${totalCount}+` : ''} ${pageTitle.toLowerCase()} at ${SITE_NAME}. Premium quality, best prices.`;
  const metaDesc  = buildMetaDesc(baseDesc);

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home',     url: SITE_URL },
    { name: pageTitle,  url: canonical },
  ]);

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type':    'CollectionPage',
    name:       pageTitle,
    description: metaDesc,
    url:        canonical,
    isPartOf:   { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
  };

  return (
    <Helmet>
      <title>{metaTitle}</title>
      <meta name="description"  content={metaDesc} />
      <link rel="canonical"     href={canonical} />
      <meta name="robots"       content="index, follow" />

      <meta property="og:type"        content="website" />
      <meta property="og:title"       content={metaTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:url"         content={canonical} />
      <meta property="og:site_name"   content={SITE_NAME} />
      <meta property="og:locale"      content={SITE_LOCALE} />

      <meta name="twitter:card"        content="summary" />
      <meta name="twitter:title"       content={metaTitle} />
      <meta name="twitter:description" content={metaDesc} />

      <script type="application/ld+json">
        {JSON.stringify(collectionJsonLd)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbJsonLd)}
      </script>
    </Helmet>
  );
}

export default ProductListSeo;
