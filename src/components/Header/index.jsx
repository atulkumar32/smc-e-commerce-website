import { useState, useCallback, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import logo from '../../assets/Logo/company.png';
import { fetchMainCategoriesWithSubsAction } from '../../Actions/CategoryAction';
import './style.scss';

// ── Icons ─────────────────────────────────────────────────────────────────────
const BagIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="8" width="20" height="14" rx="2" /><path d="M16 8V6a4 4 0 00-8 0v2" />
  </svg>
);
const GlobeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </svg>
);
const DiamondIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 22 12 12 22 2 12" />
  </svg>
);
const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const CartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
  </svg>
);
const ChevDown = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const SearchIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

// ── Sub-tab bag icons ─────────────────────────────────────────────────────────
const TI = {
  all:      <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="12" width="26" height="20" rx="3"/><path d="M11 12V9a7 7 0 0114 0v3"/><line x1="5" y1="20" x2="31" y2="20"/></svg>,
  backpack: <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="8" width="18" height="24" rx="4"/><path d="M13 8V6a5 5 0 0110 0v2"/><path d="M13 18h10M13 22h6"/></svg>,
  laptop:   <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="10" width="24" height="18" rx="2"/><path d="M12 10V8a6 6 0 0112 0v2"/><line x1="6" y1="28" x2="30" y2="28"/></svg>,
  trolley:  <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="6" width="18" height="22" rx="3"/><path d="M14 6V4a4 4 0 018 0v2"/><line x1="18" y1="28" x2="18" y2="33"/><line x1="11" y1="33" x2="25" y2="33"/></svg>,
  duffle:   <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="18" cy="21" rx="13" ry="9"/><path d="M12 21v-5a6 6 0 0112 0v5"/></svg>,
  sling:    <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="11" y="13" width="14" height="18" rx="3"/><path d="M14 13v-3a4 4 0 018 0v3"/><path d="M18 8 Q26 4 25 13"/></svg>,
  tote:     <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7 13h22l-3 19H10L7 13z"/><path d="M13 13v-3a5 5 0 0110 0v3"/></svg>,
  pouch:    <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="15" width="20" height="16" rx="4"/><path d="M12 15v-2a6 6 0 0112 0v2"/><line x1="8" y1="22" x2="28" y2="22"/></svg>,
  waist:    <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="11" y="16" width="14" height="12" rx="3"/><path d="M4 20h7M25 20h7"/><line x1="18" y1="16" x2="18" y2="12"/></svg>,
};

function tabIcon(n = '') {
  const s = n.toLowerCase();
  if (s.includes('all'))                                              return TI.all;
  if (s.includes('backpack') || s.includes('school') || s.includes('kids') || s.includes('gym')) return TI.backpack;
  if (s.includes('laptop')   || s.includes('office'))                return TI.laptop;
  if (s.includes('trolley')  || s.includes('travel'))                return TI.trolley;
  if (s.includes('duffle')   || s.includes('duffel'))                return TI.duffle;
  if (s.includes('sling'))                                           return TI.sling;
  if (s.includes('tote') || s.includes('handbag') || s.includes('ladies') || s.includes('fancy') || s.includes('clutch')) return TI.tote;
  if (s.includes('pouch') || s.includes('wallet'))                   return TI.pouch;
  if (s.includes('waist'))                                           return TI.waist;
  return TI.all;
}

function pillIcon(n = '') {
  const s = n.toLowerCase();
  if (s.includes('export'))  return <GlobeIcon />;
  if (s.includes('generic')) return <DiamondIcon />;
  return <BagIcon />;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Header() {
  const navigate = useNavigate();
  const { totalItems } = useCart();

  const [menuOpen,  setMenuOpen]  = useState(false);
  const [query,     setQuery]     = useState('');
  const [cats,      setCats]      = useState([]);
  const [activeCat, setActiveCat] = useState(null);
  const [activeTab, setActiveTab] = useState('All Bags');
  const [scrolled,  setScrolled]  = useState(false);
  const lastY    = useRef(0);
  const topRef   = useRef(null);   // ref to hdr__top — we measure its height

  // Scroll: hide top rows on down, show on up — smooth via CSS transform
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const going = y - lastY.current;
      if (y > 80 && going > 2)       setScrolled(true);   // scrolling down
      else if (going < -2)           setScrolled(false);  // scrolling up
      lastY.current = y;
    };sdfsd 
    
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fetch main categories + embedded sub-categories from API
  useEffect(() => {
    fetchMainCategoriesWithSubsAction()
      .then((list) => {
        if (!list.length) return;
        // Prepend "All Bags" to every category's subs
        const normalised = list.map((cat) => ({
          ...cat,
          subs: [{ id: 'all', name: 'All Bags' }, ...cat.subs],
        }));
        setCats(normalised);
        setActiveCat(normalised[0]);
        setActiveTab('All Bags');
      })
      .catch(() => { /* silent — header shows empty pills if API fails */ });
  }, []);

  const close = () => setMenuOpen(false);
  const subTabs = activeCat?.subs ?? [];

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  }, [query, navigate]);

  const handleTab = (sub) => {
    setActiveTab(sub.name);
    navigate(sub.name === 'All Bags' ? '/products' : `/products?category=${encodeURIComponent(sub.name)}`);
    close();
  };

  const handleCat = (cat) => {
    setActiveCat(cat);
    setActiveTab('All Bags');
    close();
  };

  return (
    <header className={`hdr${scrolled ? ' hdr--scrolled' : ''}`}>

      {/* ── TOP BLOCK: logo column (left) + content column (right) ── */}
      <div className="hdr__top" ref={topRef}>
        <div className="hdr__top-inner">

          {/* Logo column */}
          <Link to="/" className="hdr__logo-col" onClick={close} aria-label="SMC Collections">
            <img src={logo} alt="SMC Collections" className="hdr__logo-img" />
          </Link>

          {/* Content column */}
          <div className="hdr__content">

            {/* Row 1: category pills + hamburger */}
            <div className="hdr__row1">
              <nav className="hdr__pills" aria-label="Main categories">
                {cats.map((cat) => (
                  <button key={cat.id}
                    className={`hdr__pill${activeCat?.id === cat.id ? ' hdr__pill--on' : ''}`}
                    onClick={() => handleCat(cat)}
                    aria-pressed={activeCat?.id === cat.id}>
                    {pillIcon(cat.name)}
                    <span>{cat.name.toUpperCase()}</span>
                  </button>
                ))}
              </nav>

              <button className={`hdr__ham${menuOpen ? ' is-open' : ''}`}
                onClick={() => setMenuOpen((p) => !p)}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}>
                <span /><span /><span />
              </button>
            </div>

            {/* Row 2: search + actions */}
            <div className="hdr__row2">
              <form className="hdr__srch" onSubmit={handleSearch} role="search">
                <span className="hdr__srch-ico"><SearchIcon /></span>
                <input className="hdr__srch-inp" type="search"
                  placeholder="Search for bags, brands and more..."
                  value={query} onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search products" />
                <button type="submit" className="hdr__srch-btn" aria-label="Search">
                  <SearchIcon />
                </button>
              </form>

              <div className="hdr__acts">
                <NavLink to="/login"
                  className={({ isActive }) => `hdr__act${isActive ? ' hdr__act--on' : ''}`}
                  onClick={close}>
                  <UserIcon /><span>Login</span><ChevDown />
                </NavLink>
                <button className="hdr__act">
                  <span>More</span><ChevDown />
                </button>
                <Link to="/cart" className="hdr__act hdr__act--cart" onClick={close}
                  aria-label={`Cart${totalItems > 0 ? `, ${totalItems} items` : ''}`}>
                  <span className="hdr__cart-wrap">
                    <CartIcon />
                    {totalItems > 0 && <em className="hdr__cbadge">{totalItems > 99 ? '99+' : totalItems}</em>}
                  </span>
                  <span>Cart</span>
                </Link>
              </div>
            </div>

          </div>{/* end content */}
        </div>{/* end top-inner */}
      </div>{/* end top */}

      {/* ── ROW 3: sub-category icon tabs ── */}
      <div className="hdr__r3">
        <div className="hdr__r3i">
          {subTabs.map((sub) => (
            <button key={sub.id}
              className={`hdr__tab${activeTab === sub.name ? ' hdr__tab--on' : ''}`}
              onClick={() => handleTab(sub)}
              aria-pressed={activeTab === sub.name}>
              <span className="hdr__tab-ico">{tabIcon(sub.name)}</span>
              <span className="hdr__tab-lbl">{sub.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile overlay */}
      {menuOpen && <div className="hdr__ov" onClick={close} aria-hidden="true" />}

      {/* Mobile drawer */}
      <nav className={`hdr__drw${menuOpen ? ' is-open' : ''}`}
        aria-label="Mobile navigation" aria-hidden={!menuOpen}>
        <p className="hdr__drw-sec">Categories</p>
        {cats.map((c) => (
          <button key={c.id}
            className={`hdr__drw-lnk${activeCat?.id === c.id ? ' is-on' : ''}`}
            onClick={() => handleCat(c)}>
            {c.name}
          </button>
        ))}
        <hr className="hdr__drw-hr" />
        <p className="hdr__drw-sec">Navigate</p>
        {[
          { to: '/home',    l: 'Home' },
          { to: '/products',l: 'Products' },
          { to: '/about',   l: 'About' },
          { to: '/contact', l: 'Contact' },
        ].map(({ to, l }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => `hdr__drw-lnk${isActive ? ' is-on' : ''}`}
            onClick={close}>{l}</NavLink>
        ))}
        <hr className="hdr__drw-hr" />
        <NavLink to="/login" className="hdr__drw-lnk" onClick={close}>Login</NavLink>
      </nav>
    </header>
  );
}
