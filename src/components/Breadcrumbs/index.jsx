import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import './style.scss';

// ── Common Route Name Dictionary ───────────────────────────────────────────────
const ROUTE_LABELS = {
  about: 'About Us',
  contact: 'Contact Concierge',
  products: 'All Collections',
  cart: 'Shopping Cart',
  checkout: 'Secure Checkout',
  wishlist: 'Saved Wishlist',
  login: 'Account Login',
  register: 'Create Account',
  'privacy-policy': 'Privacy Policy',
  'shipping-returns': 'Shipping & Returns',
  craftsmanship: 'Why SMC Craftsmanship',
  sustainability: 'Sustainability',
  user: 'Customer Portal',
  dashboard: 'Overview',
  orders: 'Orders & Tracking',
  profile: 'Profile Settings',
  address: 'Delivery Addresses',
  password: 'Password & Security',
};

// ── Format Slug to Title Case ──────────────────────────────────────────────────
function formatSegment(seg) {
  if (!seg) return '';
  if (ROUTE_LABELS[seg.toLowerCase()]) return ROUTE_LABELS[seg.toLowerCase()];
  return seg
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Breadcrumbs Component
 *
 * Universal breadcrumbs supporting:
 * 1. Explicit `items` array: [{ label: 'Home', to: '/' }, { label: 'Category', to: '/...' }, { label: 'Product Name' }]
 * 2. Auto-generated from current pathname if `items` is omitted.
 * 3. Light / Dark / Gold theme variants for white cards, dark hero sections, or transparent headers.
 * 4. Microdata Schema.org BreadcrumbList support.
 */
export default function Breadcrumbs({
  items,
  variant = 'light',
  className = '',
  showHomeIcon = true,
  separator = null,
}) {
  const location = useLocation();

  // Auto-generate items from current pathname if not explicitly provided
  const resolvedItems = useMemo(() => {
    if (Array.isArray(items) && items.length > 0) {
      return items;
    }

    const segments = location.pathname.split('/').filter(Boolean);
    const autoItems = [{ label: 'Home', to: '/' }];

    let accumulatedPath = '';
    segments.forEach((seg, idx) => {
      accumulatedPath += `/${seg}`;
      const isLast = idx === segments.length - 1;
      autoItems.push({
        label: formatSegment(seg),
        to: isLast ? null : accumulatedPath,
      });
    });

    return autoItems;
  }, [items, location.pathname]);

  // Don't render breadcrumbs on homepage if only Home is present
  if (resolvedItems.length <= 1 && location.pathname === '/') {
    return null;
  }

  return (
    <nav
      className={`v-breadcrumbs v-breadcrumbs--${variant} ${className}`.trim()}
      aria-label="Breadcrumb"
    >
      <ol
        className="v-breadcrumbs__list"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        {resolvedItems.map((item, index) => {
          const isLast = index === resolvedItems.length - 1;
          const isFirst = index === 0;

          return (
            <li
              key={index}
              className={`v-breadcrumbs__item${isLast ? ' is-active' : ''}`}
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {item.to && !isLast ? (
                <Link
                  to={item.to}
                  className="v-breadcrumbs__link"
                  itemProp="item"
                >
                  {isFirst && showHomeIcon && (
                    <svg
                      className="v-breadcrumbs__home-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  )}
                  <span itemProp="name">{item.label}</span>
                </Link>
              ) : (
                <span
                  className="v-breadcrumbs__current"
                  aria-current="page"
                  itemProp="name"
                >
                  {item.label}
                </span>
              )}
              <meta itemProp="position" content={String(index + 1)} />

              {!isLast && (
                <span className="v-breadcrumbs__sep" aria-hidden="true">
                  {separator || (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="v-breadcrumbs__chevron"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  )}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

Breadcrumbs.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.node.isRequired,
      to: PropTypes.string,
    })
  ),
  variant: PropTypes.oneOf(['light', 'dark', 'gold', 'inline']),
  className: PropTypes.string,
  showHomeIcon: PropTypes.bool,
  separator: PropTypes.node,
};
