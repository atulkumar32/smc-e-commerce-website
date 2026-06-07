import { useState, useRef, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './style.scss';

const NAV_LINKS = [
  { label: 'HOME', to: '/' },
  { label: 'ABOUT', to: '/about' },
  {
    label: 'PRODUCTS',
    to: '/our-products',
    dropdown: [
      { label: 'School Bags', to: '/products/school-bags' },
      { label: 'Purses', to: '/products/purses' },
      { label: 'Wallets', to: '/products/wallets' },
    ],
  },
  { label: 'CONTACT US', to: '/contact' },
];

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { totalItems, wishlistCount } = useCart();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  const handleNavClick = () => {
    setMenuOpen(false);
    setMobileProductsOpen(false);
  };

  return (
    <header className="site-header">
      <div className="site-header__container">
        {/* Logo */}
        <Link to="/" className="site-header__logo" onClick={handleNavClick}>
          <span className="site-header__logo-icon">M</span>
          <span className="site-header__logo-text">Shree Mahaveer</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="site-header__nav" aria-label="Main navigation">
          {NAV_LINKS.map((link) =>
            link.dropdown ? (
              <div
                key={link.label}
                className={`site-header__nav-item site-header__nav-item--dropdown${dropdownOpen ? ' is-open' : ''}`}
                ref={dropdownRef}
              >
                <button
                  className="site-header__nav-link site-header__nav-link--btn"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  {link.label}
                  <svg
                    className="site-header__chevron"
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 4l4 4 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                {dropdownOpen && (
                  <ul className="site-header__dropdown" role="menu">
                    {link.dropdown.map((item) => (
                      <li key={item.label} role="none">
                        <NavLink
                          to={item.to}
                          className="site-header__dropdown-link"
                          role="menuitem"
                          onClick={() => {
                            setDropdownOpen(false);
                            handleNavClick();
                          }}
                        >
                          {item.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <NavLink
                key={link.label}
                to={link.to}
                className={({ isActive }) =>
                  `site-header__nav-link${isActive ? ' is-active' : ''}`
                }
                end={link.to === '/'}
                onClick={handleNavClick}
              >
                {link.label}
              </NavLink>
            )
          )}
        </nav>

        {/* Right Actions */}
        <div className="site-header__actions">
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `site-header__action-link${isActive ? ' is-active' : ''}`
            }
            onClick={handleNavClick}
          >
            LOGIN
          </NavLink>

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="site-header__cart"
            aria-label={`Wishlist${wishlistCount > 0 ? `, ${wishlistCount} items` : ''}`}
            onClick={handleNavClick}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
            {wishlistCount > 0 && (
              <span className="site-header__cart-badge" aria-hidden="true">
                {wishlistCount > 99 ? '99+' : wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="site-header__cart"
            aria-label={`Shopping cart${totalItems > 0 ? `, ${totalItems} items` : ''}`}
            onClick={handleNavClick}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {totalItems > 0 && (
              <span className="site-header__cart-badge" aria-hidden="true">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>
        </div>

        {/* Hamburger */}
        <button
          className={`site-header__hamburger${menuOpen ? ' is-open' : ''}`}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile Menu */}
      <nav
        className={`site-header__mobile-nav${menuOpen ? ' is-open' : ''}`}
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
      >
        {NAV_LINKS.map((link) =>
          link.dropdown ? (
            <div key={link.label} className="site-header__mobile-item">
              <button
                className="site-header__mobile-link site-header__mobile-link--btn"
                onClick={() => setMobileProductsOpen((prev) => !prev)}
                aria-expanded={mobileProductsOpen}
              >
                {link.label}
                <svg
                  className={`site-header__chevron${mobileProductsOpen ? ' is-rotated' : ''}`}
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 4l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {mobileProductsOpen && (
                <ul className="site-header__mobile-dropdown">
                  {link.dropdown.map((item) => (
                    <li key={item.label}>
                      <NavLink
                        to={item.to}
                        className="site-header__mobile-dropdown-link"
                        onClick={handleNavClick}
                      >
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <NavLink
              key={link.label}
              to={link.to}
              className={({ isActive }) =>
                `site-header__mobile-link${isActive ? ' is-active' : ''}`
              }
              end={link.to === '/'}
              onClick={handleNavClick}
            >
              {link.label}
            </NavLink>
          )
        )}
        <div className="site-header__mobile-actions">
          <NavLink
            to="/login"
            className="site-header__mobile-link"
            onClick={handleNavClick}
          >
            LOGIN
          </NavLink>
          {/* Cart & Wishlist are provided by the mobile bottom bar; remove duplicates here */}
        </div>
      </nav>
    </header>
  );
}

export default Header;
