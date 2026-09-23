import { useMemo }                     from 'react';
import { useLocation, useNavigate }    from 'react-router-dom';
import { useCart }                     from '../../context/CartContext';
import { getProfileCredentials }       from '../../Actions/Users/FetchUserProfile';
import './index.scss';

const META = {
  '/user/dashboard': { title: 'Dashboard',        icon: '⊞' },
  '/user/orders':    { title: 'My Orders',         icon: '📦' },
  '/user/profile':   { title: 'Account & Profile', icon: '👤' },
};

export default function UserTopbar({ onMenuClick, sidebarExpanded }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems = 0 } = useCart();
  const creds = getProfileCredentials();

  const meta     = useMemo(() => META[location.pathname] || { title: 'Dashboard', icon: '⊞' }, [location.pathname]);
  const initials = (creds?.name || 'U').split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase();

  return (
    <header className="utopbar">
      {/* Hamburger (mobile) / collapse toggle (desktop) */}
      <button className="utopbar__ham" onClick={onMenuClick} aria-label="Toggle menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6"  x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      {/* Page title */}
      <div className="utopbar__title">{meta.title}</div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Actions */}
      <div className="utopbar__actions">
        <button className="utopbar__btn" onClick={() => navigate('/products')} title="Go to shop">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          <span>Shop</span>
        </button>

        <button className="utopbar__btn utopbar__btn--cart" onClick={() => navigate('/cart')} title="Cart">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.95-1.44L23 6H6"/>
          </svg>
          {totalItems > 0 && <span className="utopbar__badge">{totalItems}</span>}
        </button>

        <button className="utopbar__avatar" onClick={() => navigate('/user/profile')} title="Profile">
          {initials}
        </button>
      </div>
    </header>
  );
}
