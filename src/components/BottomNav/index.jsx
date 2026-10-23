import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useCartDrawer } from '../../context/CartDrawerContext';
import { isUserAuthenticated } from '../../services/apiClients';
import './style.scss';

// ── SVG Luxury Stroke Icons ───────────────────────────────────────────────────
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
    <path d="M9 21V12h6v9"/>
  </svg>
);

const ShopIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" fillOpacity="0.16"/>
  </svg>
);

const SearchIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const WishlistIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
);

const BagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);

const AccountIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

/**
 * BottomNav — Fully responsive, reactive, auto-adjustable bottom navigation bar
 * Supports all screens from 320px narrow phones to full-width desktop dock.
 */
export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems, wishlistCount } = useCart();
  const { openDrawer } = useCartDrawer();
  const isAuthenticated = isUserAuthenticated();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  // Close search popover on route change
  useEffect(() => {
    setSearchOpen(false);
  }, [location.pathname]);

  // Autofocus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Close search on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  const handleMobileSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const safeWishlistCount = Number(wishlistCount) || 0;
  const safeTotalItems = Number(totalItems) || 0;

  return (
    <nav className="v-bottom-nav" aria-label="Bottom Navigation Bar">
      {/* ── Slide-Up Search Drawer ── */}
      {searchOpen && (
        <div className="v-bottom-nav__search-popover">
          <form onSubmit={handleMobileSearch} className="v-bottom-nav__search-form" role="search">
            <span className="v-bottom-nav__search-icon" aria-hidden="true">
              <SearchIcon size={16} />
            </span>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search bags, backpacks, travel gear…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search products"
            />
            {searchQuery.trim() && (
              <button
                type="button"
                className="v-bottom-nav__search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
            <button type="submit" className="v-bottom-nav__search-submit" aria-label="Submit search">
              <ArrowIcon />
            </button>
            <button
              type="button"
              className="v-bottom-nav__search-close"
              onClick={() => setSearchOpen(false)}
              aria-label="Close search"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* ── Bottom Action Items (Auto-Adjustable Across All Screens) ── */}
      <div className="v-bottom-nav__bar">
        {/* 1. HOME */}
        <NavLink
          to="/home"
          className={({ isActive }) => `v-bottom-nav__item${isActive ? ' is-active' : ''}`}
          aria-label="Home"
        >
          <div className="v-bottom-nav__icon-wrap">
            <HomeIcon />
          </div>
          <span className="v-bottom-nav__lbl">HOME</span>
        </NavLink>

        {/* 2. SHOP */}
        <NavLink
          to="/products"
          className={({ isActive }) => `v-bottom-nav__item${isActive ? ' is-active' : ''}`}
          aria-label="Shop Products"
        >
          <div className="v-bottom-nav__icon-wrap">
            <ShopIcon />
          </div>
          <span className="v-bottom-nav__lbl">SHOP</span>
        </NavLink>

        {/* 3. SEARCH */}
        <button
          type="button"
          className={`v-bottom-nav__item${searchOpen ? ' is-active' : ''}`}
          onClick={() => setSearchOpen((prev) => !prev)}
          aria-label={searchOpen ? 'Close Search' : 'Open Search'}
          aria-expanded={searchOpen}
        >
          <div className="v-bottom-nav__icon-wrap">
            <SearchIcon />
          </div>
          <span className="v-bottom-nav__lbl">SEARCH</span>
        </button>

        {/* 4. WISHLIST */}
        <NavLink
          to="/wishlist"
          className={({ isActive }) => `v-bottom-nav__item${isActive ? ' is-active' : ''}`}
          aria-label="Wishlist"
        >
          <div className="v-bottom-nav__icon-wrap">
            <WishlistIcon />
            {safeWishlistCount > 0 && (
              <span className="v-bottom-nav__badge" aria-label={`${safeWishlistCount} wishlist items`}>
                {safeWishlistCount > 99 ? '99+' : safeWishlistCount}
              </span>
            )}
          </div>
          <span className="v-bottom-nav__lbl">WISHLIST</span>
        </NavLink>

        {/* 5. BAG (CART) */}
        <button
          type="button"
          className="v-bottom-nav__item"
          onClick={openDrawer}
          aria-label="Shopping Cart Bag"
        >
          <div className="v-bottom-nav__icon-wrap">
            <BagIcon />
            {safeTotalItems > 0 && (
              <span className="v-bottom-nav__badge" aria-label={`${safeTotalItems} items in cart`}>
                {safeTotalItems > 99 ? '99+' : safeTotalItems}
              </span>
            )}
          </div>
          <span className="v-bottom-nav__lbl">BAG</span>
        </button>

        {/* 6. ACCOUNT */}
        <NavLink
          to={isAuthenticated ? '/user/dashboard' : '/login'}
          className={({ isActive }) => `v-bottom-nav__item${isActive ? ' is-active' : ''}`}
          aria-label={isAuthenticated ? 'Account' : 'Login'}
        >
          <div className="v-bottom-nav__icon-wrap">
            <AccountIcon />
          </div>
          <span className="v-bottom-nav__lbl">ACCOUNT</span>
        </NavLink>
      </div>
    </nav>
  );
}
