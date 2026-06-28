import { useEffect } from 'react';
import { CATEGORIES } from '../../pages/product/productData';
import './style.scss';

/**
 * NavDrawer
 * Slide-in filter/category drawer for the product listing page.
 *
 * Props:
 *  open           – boolean
 *  onClose        – fn
 *  activeCategory – string
 *  onCategory     – fn(key)
 */
function NavDrawer({ open, onClose, activeCategory, onCategory }) {
  // Lock body scroll when open — always clean up on unmount or close
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    // Always restore on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleCategory = (key) => {
    onCategory(key);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`nav-drawer__overlay${open ? ' is-open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`nav-drawer${open ? ' is-open' : ''}`}
        aria-label="Filter navigation"
        aria-hidden={!open}
        role="dialog"
        aria-modal="true"
      >
        <div className="nav-drawer__header">
          <h2 className="nav-drawer__title">Refine Selection</h2>
          <button
            className="nav-drawer__close"
            onClick={onClose}
            aria-label="Close filter drawer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="nav-drawer__nav">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              className={`nav-drawer__item${activeCategory === cat.key ? ' is-active' : ''}`}
              onClick={() => handleCategory(cat.key)}
              aria-current={activeCategory === cat.key ? 'page' : undefined}
            >
              <span className="nav-drawer__item-label">{cat.label}</span>
            </button>
          ))}

          <div className="nav-drawer__divider" />

          <p className="nav-drawer__section-label">Quick Filters</p>
          <button className="nav-drawer__item" onClick={onClose}>
            <span className="nav-drawer__item-label">All Filters</span>
          </button>
        </nav>
      </aside>
    </>
  );
}

export default NavDrawer;
