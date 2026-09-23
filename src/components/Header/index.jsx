import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useCartDrawer } from '../../context/CartDrawerContext';
import { fetchMainCategoriesWithSubsAction } from '../../Actions/CategoryAction';
import './style.scss';

// ── Static nav links ──────────────────────────────────────────
const NAV_LINKS = [
  { label: 'Home',         to: '/home' },
  { label: 'School Bags',  to: '/products?category_name=School+Bags' },
  { label: 'Backpacks',    to: '/products?category_name=Backpacks' },
  { label: 'Laptop Bags',  to: '/products?category_name=Laptop+Bags' },
  { label: 'Ladies Bags',  to: '/products?category_name=Ladies+Bags' },
  { label: 'Sling Bags',   to: '/products?category_name=Sling+Bags' },
  { label: 'Travel Bags',  to: '/products?category_name=Travel+Bags' },
  { label: 'New Arrivals', to: '/products/new-arrivals' },
];

// ── SVG icons (inline — no extra dep) ────────────────────────
const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 10-7.8 7.8L12 22l8.8-9.6a5.5 5.5 0 000-7.8z"/>
  </svg>
);
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>
  </svg>
);
const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor"/>
  </svg>
);
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
  </svg>
);
const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.5 6.3a2.8 2.8 0 00-2-2C18.9 4 12 4 12 4s-6.9 0-8.5.3a2.8 2.8 0 00-2 2A29 29 0 001 12a29 29 0 00.5 5.7 2.8 2.8 0 002 2C5.1 20 12 20 12 20s6.9 0 8.5-.3a2.8 2.8 0 002-2A29 29 0 0023 12a29 29 0 00-.5-5.7z"/>
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"/>
  </svg>
);

export default function Header() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { totalItems, wishlistCount } = useCart();
  const { openDrawer } = useCartDrawer();

  const [query,       setQuery]       = useState('');
  const [mobileOpen,  setMobileOpen]  = useState(false);

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setMobileOpen(false);
    }
  }, [query, navigate]);

  return (
    <>
      {/* ═══ TOP BAR ═══════════════════════════════════════════ */}
      <div className="v-topbar">
        <div className="v-topbar__left">
          <span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            Free Shipping on Orders Above ₹999
          </span>
          <span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.7l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.7l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
            Easy Returns within 7 Days
          </span>
          <span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            100% Secure Payments
          </span>
        </div>
        <div className="v-topbar__right">
          <span>Follow Us</span>
          <a href="#" aria-label="Instagram"><InstagramIcon /></a>
          <a href="#" aria-label="Facebook"><FacebookIcon /></a>
          <a href="#" aria-label="YouTube"><YoutubeIcon /></a>
        </div>
      </div>

      {/* ═══ MAIN HEADER ═══════════════════════════════════════ */}
      <header className="v-header">

        {/* Logo */}
        <Link to="/home" className="v-logo">
          {/* Shree Mahaveer */}
          VORANO

          <small>INDIA</small>
        </Link>
        {/* Search */}
        <form className="v-search" onSubmit={handleSearch} role="search">
          <input
            type="text"
            placeholder="Search for bags, brands and more…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search products"
          />
          <button type="submit" aria-label="Search">
            <SearchIcon />
          </button>
        </form>

        {/* Actions */}
        <div className="v-hdr-acts">
          <NavLink to="/login" className="v-hdr-act">
            <UserIcon />
            <span className="lbl">Login</span>
          </NavLink>

          <NavLink to="/wishlist" className="v-hdr-act">
            <HeartIcon />
            <span className="lbl">Wishlist</span>
            {wishlistCount > 0 && (
              <span className="v-cart-count">{wishlistCount > 99 ? '99+' : wishlistCount}</span>
            )}
          </NavLink>

          <button className="v-hdr-act" onClick={openDrawer} aria-label="Cart">
            <div style={{ position: 'relative', display: 'inline-flex' }}>
              <CartIcon />
              {totalItems > 0 && (
                <span className="v-cart-count">{totalItems > 99 ? '99+' : totalItems}</span>
              )}
            </div>
            <span className="lbl">Cart</span>
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className={`v-ham${mobileOpen ? ' v-ham--open' : ''}`}
          onClick={() => setMobileOpen(p => !p)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          <span/><span/><span/>
        </button>
      </header>

      {/* ═══ NAV BAR ════════════════════════════════════════════ */}
      <nav aria-label="Main navigation">
        <ul className="v-nav__inner">
          {NAV_LINKS.map(({ label, to }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `v-nav__link${isActive ? ' v-nav__link--active' : ''}`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* ═══ MOBILE DRAWER ══════════════════════════════════════ */}
      {mobileOpen && (
        <div
          className="v-drawer-overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      <nav
        className={`v-drawer${mobileOpen ? ' v-drawer--open' : ''}`}
        aria-label="Mobile navigation"
        aria-hidden={!mobileOpen}
      >
        <div className="v-drawer__head">
          <Link to="/home" className="v-logo" style={{ fontSize: 22 }}
            onClick={() => setMobileOpen(false)}>
            SMC<small style={{ letterSpacing: 3 }}>Collections</small>
          </Link>
          <button className="v-drawer__close" onClick={() => setMobileOpen(false)}>×</button>
        </div>

        {/* Mobile search */}
        <form onSubmit={handleSearch} style={{ padding: '12px 20px' }}>
          <div className="v-search" style={{ maxWidth: '100%', height: 40 }}>
            <input
              type="text"
              placeholder="Search products…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit"><SearchIcon /></button>
          </div>
        </form>

        <div className="v-drawer__hr" />

        {NAV_LINKS.map(({ label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `v-drawer__link${isActive ? ' v-drawer__link--active' : ''}`
            }
            onClick={() => setMobileOpen(false)}
          >
            {label}
          </NavLink>
        ))}

        <div className="v-drawer__hr" />

        <NavLink to="/login" className="v-drawer__link" onClick={() => setMobileOpen(false)}>Login / Account</NavLink>
        <NavLink to="/wishlist" className="v-drawer__link" onClick={() => setMobileOpen(false)}>Wishlist</NavLink>
        <NavLink to="/cart" className="v-drawer__link" onClick={() => setMobileOpen(false)}>Cart {totalItems > 0 ? `(${totalItems})` : ''}</NavLink>
      </nav>
    </>
  );
}

/*
 * OLD DESIGN preserved below — comment block for reference
 * ─────────────────────────────────────────────────────────
 * Previous implementation used:
 *   hdr-topbar, hdr-inner, hdr-brand, hdr-tiers, hdr-tier,
 *   hdr-search, hdr-acts, hdr-act, hdr-cart, hdr-ham,
 *   hdr-cats (category strip), hdr-cat, hdr-drawer
 * All those classes are now superseded by v-* prefixed classes.
 */
