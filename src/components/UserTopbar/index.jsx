/**
 * UserTopbar — Refined Luxury Glassmorphic Topbar
 * Shree Mahaveer Collections Design System (#001F3F & #D4AF37)
 *
 * Page-aware navigation bar with route badges, responsive search bar,
 * live wishlist & cart counters, and luxury authenticated member chip.
 */

import { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import { useCart } from '../../context/CartContext';
import { useCartDrawer } from '../../context/CartDrawerContext';
import { getProfileCredentials } from '../../Actions/Users/FetchUserProfile';
import './index.scss';

const PAGE_CONFIG = {
  '/user/dashboard': {
    title: 'Dashboard',
    breadcrumb: 'Customer Portal / Overview',
    tag: 'SMC Privilege',
    searchPlaceholder: 'Search collections, backpacks, luggage...',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
      </svg>
    ),
  },
  '/user/orders': {
    title: 'My Orders',
    breadcrumb: 'Customer Portal / Consignments & Tracking',
    tag: 'Live Tracking',
    searchPlaceholder: 'Search order ID, bag title, or status...',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
  },
  '/user/profile': {
    title: 'Profile Details',
    breadcrumb: 'Customer Portal / Account Settings',
    tag: 'Verified Account',
    searchPlaceholder: 'Search catalog bags, purses & accessories...',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  '/user/security': {
    title: 'Privacy & Security',
    breadcrumb: 'Customer Portal / Security & Password',
    tag: 'Account Protection',
    searchPlaceholder: 'Search catalog bags, purses & accessories...',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
  },
  '/user/wishlist': {
    title: 'My Wishlist',
    breadcrumb: 'Customer Portal / Saved Wishlist',
    tag: 'Curated Items',
    searchPlaceholder: 'Search saved items...',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
  },
  '/user/cart': {
    title: 'Shopping Cart',
    breadcrumb: 'Customer Portal / Active Consignment',
    tag: 'Your Bag',
    searchPlaceholder: 'Search cart products...',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
    ),
  },
};

export default function UserTopbar({ onMenuClick, collapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { totalItems = 0, wishlistCount = 0 } = useCart ? useCart() : {};
  const { openDrawer } = useCartDrawer ? useCartDrawer() : { openDrawer: () => navigate('/cart') };
  const creds = getProfileCredentials();

  const [searchVal, setSearchVal] = useState('');

  // Sync search input with search URL params when on orders page
  useEffect(() => {
    if (location.pathname === '/user/orders') {
      const q = searchParams.get('search') || '';
      setSearchVal(q);
    } else {
      setSearchVal('');
    }
  }, [location.pathname, searchParams]);

  const config = useMemo(() => PAGE_CONFIG[location.pathname] || {
    title: 'Customer Portal',
    breadcrumb: 'Customer Portal',
    tag: 'SMC Member',
    searchPlaceholder: 'Search store catalog...',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  }, [location.pathname]);

  const fullName = creds?.name || 'Valued Member';
  const firstName = fullName.split(' ')[0] || 'Member';
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map(w => w[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchVal.trim();
    if (!query) return;

    if (location.pathname === '/user/orders') {
      navigate(`/user/orders?search=${encodeURIComponent(query)}`);
    } else {
      navigate(`/products?search=${encodeURIComponent(query)}`);
    }
  };

  const handleClearSearch = () => {
    setSearchVal('');
    if (location.pathname === '/user/orders') {
      navigate('/user/orders');
    }
  };

  return (
    <header className="utopbar">
      {/* ── Left Area: Hamburger + Dynamic Page Title & Badges ── */}
      <div className="utopbar__left">
        {/* Sidebar expansion / collapse hamburger toggle button */}
        <button
          className="utopbar__ham"
          onClick={onMenuClick}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <line x1="4" y1="7"  x2="20" y2="7"/>
            <line x1="4" y1="12" x2="20" y2="12"/>
            <line x1="4" y1="17" x2="20" y2="17"/>
          </svg>
        </button>

        {/* Page Title & Breadcrumbs */}
        <div className="utopbar__title-box">
          <div className="utopbar__breadcrumb-row">
            {/* <span className="utopbar__breadcrumb">{config.breadcrumb}</span>
            <span className="utopbar__tag">{config.tag}</span> */}
          </div>
          <div className="utopbar__heading-row">
            <span className="utopbar__heading-icon-badge">
              {config.icon}
            </span>
            <h1 className="utopbar__title">{config.title}</h1>
          </div>
        </div>
      </div>

      {/* ── Center Area: Universal Quick Search ── */}
      <div className="utopbar__center">
        <form className="utopbar__search-form" onSubmit={handleSearchSubmit}>
          <svg className="utopbar__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            className="utopbar__search-input"
            placeholder={config.searchPlaceholder}
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            aria-label="Search"
          />
          {searchVal && (
            <button
              type="button"
              className="utopbar__search-clear"
              onClick={handleClearSearch}
              title="Clear search"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </form>
      </div>

      {/* ── Right Area: Store, Wishlist, Cart Drawer, and Member Profile Chip ── */}
      <div className="utopbar__actions">
        {/* Explore Storefront */}
        <button
          className="utopbar__btn utopbar__btn--shop"
          onClick={() => navigate('/products')}
          title="Explore Collections"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          <span>Store</span>
        </button>

        {/* Wishlist Shortcut */}
        <Tooltip title="Saved Wishlist" arrow>
          <button
            className="utopbar__btn utopbar__btn--icon"
            onClick={() => navigate('/user/wishlist')}
            aria-label="Wishlist"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {wishlistCount > 0 && <span className="utopbar__badge utopbar__badge--wish">{wishlistCount}</span>}
          </button>
        </Tooltip>

        {/* Cart Shortcut */}
        <Tooltip title="View Shopping Cart" arrow>
          <button
            className="utopbar__btn utopbar__btn--icon utopbar__btn--cart"
            onClick={() => navigate('/user/cart')}
            aria-label="Cart"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {totalItems > 0 && <span className="utopbar__badge">{totalItems}</span>}
          </button>
        </Tooltip>

        {/* Luxury User Profile Pill Chip */}
        <Tooltip title="Manage Profile & Security" arrow>
          <div
            className="utopbar__user-chip"
            onClick={() => navigate('/user/profile')}
            role="button"
            tabIndex={0}
          >
            <div className="utopbar__avatar">{initials}</div>
            <div className="utopbar__user-meta">
              <span className="utopbar__user-name">{firstName}</span>
              <span className="utopbar__user-role">Member</span>
            </div>
            <svg className="utopbar__user-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </Tooltip>
      </div>
    </header>
  );
}
