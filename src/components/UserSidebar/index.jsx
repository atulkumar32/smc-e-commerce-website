/**
 * UserSidebar — Premium collapsible sidebar
 * Expanded: 240px  |  Collapsed: 72px
 * Toggle button lives at the bottom of the sidebar
 */

import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import { clearUserAuth } from '../../services/apiClients';
import { getProfileCredentials } from '../../Actions/Users/FetchUserProfile';
import './index.scss';

export const DRAWER_WIDTH        = 240;
export const DRAWER_WIDTH_CLOSED = 72;

const NAV = [
  {
    label: 'Dashboard',
    to: '/user/dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
      </svg>
    ),
  },
  {
    label: 'My Orders',
    to: '/user/orders',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
    ),
  },
  {
    label: 'Profile',
    to: '/user/profile',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>
      </svg>
    ),
  },
  {
    label: 'Wishlist',
    to: '/wishlist',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 10-7.8 7.8L12 22l8.8-9.6a5.5 5.5 0 000-7.8z"/>
      </svg>
    ),
  },
  {
    label: 'Shop',
    to: '/products',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
    ),
  },
];

function SidebarContent({ collapsed, onToggle, onClose }) {
  const navigate  = useNavigate();
  const creds     = getProfileCredentials();
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const initials = (creds?.name || 'U').split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase();
  const name     = creds?.name || 'My Account';
  const email    = creds?.email || '';

  const doLogout = () => {
    clearUserAuth();
    navigate('/login', { replace: true });
  };

  return (
    <div className={`usb${collapsed ? ' usb--collapsed' : ''}`}>

      {/* ── Logo ── */}
      <div className="usb__logo">
        <div className="usb__logo-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M6 8h12l-1 13H7L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>
          </svg>
        </div>
        {!collapsed && (
          <div className="usb__logo-text">
            <span className="usb__logo-name">Shree Mahaveer</span>
            <span className="usb__logo-sub">Collections</span>
          </div>
        )}
      </div>

      {/* ── User chip ── */}
      <div className="usb__user" onClick={() => { navigate('/user/profile'); onClose?.(); }}>
        <div className="usb__avatar">{initials}</div>
        {!collapsed && (
          <div className="usb__user-info">
            <span className="usb__user-name">{name}</span>
            <span className="usb__user-email">{email}</span>
          </div>
        )}
      </div>

      {/* ── Nav ── */}
      <nav className="usb__nav">
        {NAV.map(({ label, to, icon }) => (
          collapsed ? (
            <Tooltip key={to} title={label} placement="right" arrow>
              <NavLink
                to={to}
                className={({ isActive }) => `usb__link${isActive ? ' usb__link--active' : ''}`}
                onClick={onClose}
              >
                <span className="usb__link-icon">{icon}</span>
              </NavLink>
            </Tooltip>
          ) : (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `usb__link${isActive ? ' usb__link--active' : ''}`}
              onClick={onClose}
            >
              <span className="usb__link-icon">{icon}</span>
              <span className="usb__link-label">{label}</span>
            </NavLink>
          )
        ))}
      </nav>

      {/* ── Spacer ── */}
      <div style={{ flex: 1 }} />

      {/* ── Logout ── */}
      {collapsed ? (
        <Tooltip title="Sign Out" placement="right" arrow>
          <button className="usb__logout usb__logout--icon" onClick={() => setLogoutConfirm(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </Tooltip>
      ) : (
        <button className="usb__logout" onClick={() => setLogoutConfirm(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>Sign Out</span>
        </button>
      )}

      {/* ── Toggle button ── */}
      <button className="usb__toggle" onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        {!collapsed && <span>Collapse</span>}
      </button>

      {/* Logout confirm overlay */}
      {logoutConfirm && (
        <div className="usb__confirm">
          <div className="usb__confirm-box">
            <p>Sign out of your account?</p>
            <div className="usb__confirm-btns">
              <button onClick={() => setLogoutConfirm(false)}>Cancel</button>
              <button className="usb__confirm-yes" onClick={doLogout}>Sign Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UserSidebar({ mobileOpen, onMobileClose, collapsed, onToggleCollapse }) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="usb-overlay" onClick={onMobileClose} aria-hidden="true" />
      )}
      <aside className={`usb-rail usb-rail--mobile${mobileOpen ? ' usb-rail--mobile-open' : ''}`}>
        <SidebarContent collapsed={false} onToggle={() => {}} onClose={onMobileClose} />
      </aside>

      {/* Desktop permanent */}
      <aside
        className="usb-rail usb-rail--desktop"
        style={{ width: collapsed ? DRAWER_WIDTH_CLOSED : DRAWER_WIDTH }}
      >
        <SidebarContent collapsed={collapsed} onToggle={onToggleCollapse} onClose={() => {}} />
      </aside>
    </>
  );
}
