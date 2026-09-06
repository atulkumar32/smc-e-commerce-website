import { useState, useCallback, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useCartDrawer } from '../../context/CartDrawerContext';
import { fetchMainCategoriesWithSubsAction } from '../../Actions/CategoryAction';
import './style.scss';

// ── Fallback tier data ────────────────────────────────────────────────────────
const FALLBACK = [
  { id: 1, name: 'Borono',   subs: [] },
  { id: 2, name: 'Exported', subs: [] },
  { id: 3, name: 'Generic',  subs: [] },
];

// ── Tier tab icons ────────────────────────────────────────────────────────────
function TierSvg({ name }) {
  const n = name.toLowerCase();
  if (n.includes('export')) return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9"/>
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>
    </svg>
  );
  if (n.includes('generic')) return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 2l8 10-8 10-8-10z"/>
    </svg>
  );
  // Borono / default — bag icon
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 8h12l-1 13H7L6 8z"/>
      <path d="M9 8V6a3 3 0 0 1 6 0v2"/>
    </svg>
  );
}

// ── Category strip icons ──────────────────────────────────────────────────────
const CAT_ICONS = {
  'All Bags':    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 8h12l-1 13H7L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>,
  'Backpacks':   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M7 9a5 5 0 0 1 10 0v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z"/><path d="M9 6a3 3 0 0 1 6 0"/><rect x="9" y="13" width="6" height="4" rx="0.5"/></svg>,
  'Laptop Bags': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="7" width="18" height="12" rx="1.5"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7"/></svg>,
  'Trolley Bags':<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="6" y="6" width="12" height="15" rx="1.5"/><path d="M10 6V4h4v2"/><circle cx="9" cy="22" r="0.8" fill="currentColor"/><circle cx="15" cy="22" r="0.8" fill="currentColor"/></svg>,
  'Duffle Bags': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="9" width="18" height="9" rx="4"/><path d="M8 9V7a1.5 1.5 0 0 1 1.5-1.5h5A1.5 1.5 0 0 1 16 7v2"/></svg>,
  'Sling Bags':  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M8 10h8l1.5 9h-11z"/><path d="M6 4l6 6 6-6"/></svg>,
  'Tote Bags':   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 9h14l-1 12H6z"/><path d="M8 9V7a4 4 0 0 1 8 0v2"/></svg>,
  'Pouches':     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="5" y="8" width="14" height="11" rx="3"/><path d="M9 8V6.5A1.5 1.5 0 0 1 10.5 5h3A1.5 1.5 0 0 1 15 6.5V8"/></svg>,
  'Waist Bags':  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 13c2-3 14-3 16 0-1 3-15 3-16 0z"/><path d="M2 13h2M20 13h2"/></svg>,
  'School Bags': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M7 9a5 5 0 0 1 10 0v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z"/><path d="M9 6a3 3 0 0 1 6 0"/><circle cx="12" cy="15" r="1.4"/></svg>,
  'Gym Bags':    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="9" width="18" height="9" rx="4"/><path d="M8 9V7a1.5 1.5 0 0 1 1.5-1.5h5A1.5 1.5 0 0 1 16 7v2"/><path d="M12 12v3"/></svg>,
  'Camera Bags': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="8" width="18" height="11" rx="2"/><circle cx="12" cy="13.5" r="3.2"/><path d="M9 8l1-2h4l1 2"/></svg>,
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function Header() {
  const navigate  = useNavigate();
  const { totalItems } = useCart();
  const { wishlistCount } = useCart();
  const { openDrawer } = useCartDrawer();
  const moreRef   = useRef(null);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen,   setMoreOpen]   = useState(false);
  const [query,      setQuery]      = useState('');
  const [cats,       setCats]       = useState(FALLBACK);
  const [activeCat,  setActiveCat]  = useState(FALLBACK[0]);
  const [activeSub,  setActiveSub]  = useState('All Bags');

  // Load categories from API
  useEffect(() => {
    fetchMainCategoriesWithSubsAction()
      .then((list) => {
        if (!list.length) return;
        const data = list.map((c) => ({
          ...c,
          subs: [{ id: 'all', name: 'All Bags' }, ...c.subs],
        }));
        setCats(data);
        setActiveCat(data[0]);
      })
      .catch(() => {});
  }, []);

  // Close More on outside click
  useEffect(() => {
    const fn = (e) => { if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const closeAll = () => { setMobileOpen(false); setMoreOpen(false); };

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (query.trim()) { navigate(`/products?q=${encodeURIComponent(query.trim())}`); setQuery(''); closeAll(); }
  }, [query, navigate]);

  const selectTier = (cat) => { setActiveCat(cat); setActiveSub('All Bags'); closeAll(); };
  const selectSub  = (name) => {
    setActiveSub(name);
    navigate(name === 'All Bags' ? '/products' : `/products?category=${encodeURIComponent(name)}`);
    closeAll();
  };

  const subs = activeCat?.subs ?? [];

  return (
    <>
      {/* ═══ TOPBAR — single row ════════════════════════════════ */}
      <header className="hdr-topbar">
        <div className="hdr-inner">

          {/* 1. Brand */}
          <Link to="/" className="hdr-brand" onClick={closeAll}>
            <span className="hdr-brand__mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="#F8F7F2" strokeWidth="1.8">
                <path d="M6 8h12l-1 13H7L6 8z"/>
                <path d="M9 8V6a3 3 0 0 1 6 0v2"/>
              </svg>
            </span>
            <span>
              <span className="hdr-brand__name">Shree Mahaveer</span>
              <span className="hdr-brand__sub">Collections</span>
            </span>
          </Link>

          {/* 2. Tier tabs */}
          <div className="hdr-tiers">
            {cats.map((cat) => (
              <button key={cat.id}
                className={`hdr-tier${activeCat?.id === cat.id ? ' hdr-tier--on' : ''}`}
                onClick={() => selectTier(cat)}>
                <TierSvg name={cat.name} />
                {cat.name}
              </button>
            ))}
          </div>

          {/* 3. Search */}
          <form className="hdr-search" onSubmit={handleSearch} role="search">
            <input
              className="hdr-search__inp"
              type="text"
              placeholder="Search for bags, brands and more…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search products"
            />
            <button type="submit" className="hdr-search__btn" aria-label="Search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
          </form>

          {/* 4. Actions */}
          <div className="hdr-acts">

            {/* Login */}
            <NavLink to="/login" className="hdr-act" onClick={closeAll}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>
              </svg>
              <span className="hdr-act__lbl">Login</span>
              <span className="hdr-chev" />
            </NavLink>

            {/* More */}
            <div className="hdr-more-wrap" ref={moreRef}>
              <button className="hdr-act" onClick={() => setMoreOpen((p) => !p)}>
                <span className="hdr-act__lbl">More</span>
                <span className="hdr-chev" />
              </button>
              {moreOpen && (
                <div className="hdr-more-menu">
                  <Link to="/home"    onClick={closeAll}>Home</Link>
                  <Link to="/about"   onClick={closeAll}>About Us</Link>
                  <Link to="/contact" onClick={closeAll}>Contact Us</Link>
                  <hr className="hdr-more-menu__hr" />
                  <Link to="/wishlist" onClick={closeAll} className="hdr-more-menu__wishlist">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M12 21s-7.5-4.6-10-9.2C.4 8.4 2 4.5 6 4c2.3-.3 4.2 1 6 3 1.8-2 3.7-3.3 6-3 4 .5 5.6 4.4 4 7.8-2.5 4.6-10 9.2-10 9.2z"/>
                    </svg>
                    Wishlist
                    {wishlistCount > 0 && (
                      <span className="hdr-more-menu__badge">{wishlistCount}</span>
                    )}
                  </Link>
                </div>
              )}
            </div>

            {/* Cart — opens drawer */}
            <button
              className="hdr-act hdr-cart"
              onClick={() => { closeAll(); openDrawer(); }}
              aria-label={`Cart${totalItems > 0 ? `, ${totalItems} items` : ''}`}
            >
              <span className="hdr-cart__icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 8h12l-1 13H7L6 8z"/>
                  <path d="M9 8V6a3 3 0 0 1 6 0v2"/>
                </svg>
                {totalItems > 0 && (
                  <span className="hdr-cart__badge">{totalItems > 99 ? '99+' : totalItems}</span>
                )}
              </span>
              <span className="hdr-act__lbl">Cart</span>
            </button>
          </div>

          {/* 5. Mobile hamburger */}
          <button
            className={`hdr-ham${mobileOpen ? ' hdr-ham--open' : ''}`}
            onClick={() => setMobileOpen((p) => !p)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            <span/><span/><span/>
          </button>
        </div>
      </header>

      {/* ═══ CATEGORY STRIP ════════════════════════════════════ */}
      <div className="hdr-cats">
        <div className="hdr-cats__inner">
          {subs.map((sub) => (
            <button
              key={sub.id ?? sub.name}
              className={`hdr-cat${activeSub === sub.name ? ' hdr-cat--on' : ''}`}
              onClick={() => selectSub(sub.name)}
            >
              {CAT_ICONS[sub.name] ?? CAT_ICONS['All Bags']}
              <span>{sub.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ═══ MOBILE DRAWER ═════════════════════════════════════ */}
      {mobileOpen && <div className="hdr-overlay" onClick={closeAll} aria-hidden="true" />}
      <nav className={`hdr-drawer${mobileOpen ? ' hdr-drawer--open' : ''}`}
        aria-label="Mobile navigation" aria-hidden={!mobileOpen}>
        <p className="hdr-drawer__sec">Brand Tiers</p>
        {cats.map((c) => (
          <button key={c.id}
            className={`hdr-drawer__link${activeCat?.id === c.id ? ' hdr-drawer__link--on' : ''}`}
            onClick={() => selectTier(c)}>
            <TierSvg name={c.name} />
            {c.name}
          </button>
        ))}
        <hr className="hdr-drawer__hr" />
        <p className="hdr-drawer__sec">Navigation</p>
        {[
          { to: '/home',     l: 'Home' },
          { to: '/products', l: 'All Products' },
          { to: '/about',    l: 'About Us' },
          { to: '/contact',  l: 'Contact' },
        ].map(({ to, l }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => `hdr-drawer__link${isActive ? ' hdr-drawer__link--on' : ''}`}
            onClick={closeAll}>{l}</NavLink>
        ))}
        <hr className="hdr-drawer__hr" />
        <NavLink to="/login" className="hdr-drawer__link" onClick={closeAll}>Login</NavLink>
      </nav>
    </>
  );
}
