/**
 * UserSidebar — Collapsible Navigation Menu Bar matching design specification
 * Collapsed: 60px  |  Expanded: 200px
 * Features rounded right edges, SMC gold logo, vibrant royal blue active pill,
 * outline white/slate icons, and clean bottom Logout.
 */

import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import { clearUserAuth } from '../../services/apiClients';
import { useCart } from '../../context/CartContext';
import './index.scss';

export const DRAWER_WIDTH        = 200;
export const DRAWER_WIDTH_CLOSED = 60;

const NAV = [
  {
    label: 'Dashboard',
    to: '/user/dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    label: 'Your Orders',
    to: '/user/orders',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
        <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
  },
  {
    label: 'Your Profile',
    to: '/user/profile',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    label: 'Wishlist',
    to: '/user/wishlist',
    badgeKey: 'wishlist',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
  },
  {
    label: 'Your Cart',
    to: '/user/cart',
    badgeKey: 'cart',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
        <circle cx="9" cy="21" r="1"/>
        <circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
    ),
  },
  {
    label: 'Privacy & Security',
    to: '/user/security',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
  },
];

function SidebarContent({ collapsed, onClose }) {
  const navigate  = useNavigate();
  const cartCtx   = useCart ? useCart() : {};
  const wishlistCount = cartCtx?.wishlistCount ?? (cartCtx?.wishlistItems?.length || 0);
  const cartCount     = cartCtx?.totalItems ?? (cartCtx?.cartItems?.length || 0);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const doLogout = () => {
    clearUserAuth();
    navigate('/login', { replace: true });
  };

  return (
    <div className={`usb${collapsed ? ' usb--collapsed' : ''}`}>

      {/* ── Logo Header (Gold bag + SMC) ── */}
      <Tooltip title="Shree Mahaveer Collections" placement="right" arrow disableHoverListener={!collapsed}>
        <div
          className="usb__logo"
          onClick={() => { navigate('/home'); onClose?.(); }}
          role="button"
          tabIndex={0}
        >
          <div className="usb__logo-icon-wrap">
            <svg className="usb__logo-bag" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2.2">
              <path d="M6 9h12l-1 12H7L6 9z"/>
              <path d="M9 9V6a3 3 0 0 1 6 0v3"/>
            </svg>
            <span className="usb__logo-smc">SMC</span>
          </div>

          {!collapsed && (
            <div className="usb__logo-text">
              <span className="usb__logo-name">Shree Mahaveer</span>
              <span className="usb__logo-sub">Collections</span>
            </div>
          )}
        </div>
      </Tooltip>

      {/* ── Navigation Links ── */}
      <nav className="usb__nav">
        {NAV.map(({ label, to, icon, badgeKey }) => (
          <Tooltip key={to} title={label} placement="right" arrow disableHoverListener={!collapsed}>
            <NavLink
              to={to}
              className={({ isActive }) => `usb__link${isActive ? ' usb__link--active' : ''}`}
              onClick={onClose}
            >
              <span className="usb__link-icon-box">
                {icon}
              </span>
              {!collapsed && (
                <span className="usb__link-label">
                  {label}
                </span>
              )}
              {!collapsed && badgeKey === 'wishlist' && wishlistCount > 0 && (
                <span className="usb__link-badge">{wishlistCount}</span>
              )}
              {!collapsed && badgeKey === 'cart' && cartCount > 0 && (
                <span className="usb__link-badge">{cartCount}</span>
              )}
            </NavLink>
          </Tooltip>
        ))}
      </nav>

      {/* ── Spacer ── */}
      <div style={{ flex: 1 }} />

      {/* ── Bottom Logout (1-Row, exactly as image) ── */}
      <Tooltip title="Logout" placement="right" arrow disableHoverListener={!collapsed}>
        <button
          className="usb__logout"
          onClick={() => setLogoutConfirm(true)}
          aria-label="Logout"
        >
          <span className="usb__logout-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </span>
          {!collapsed && <span className="usb__logout-label">Logout</span>}
        </button>
      </Tooltip>

      {/* ── Logout Confirmation Dialog ── */}
      {logoutConfirm && (
        <div className="usb__confirm">
          <div className="usb__confirm-box">
            <div className="usb__confirm-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>
            <p className="usb__confirm-title">Sign Out?</p>
            <p className="usb__confirm-sub">Are you sure you want to log out of your SMC account?</p>
            <div className="usb__confirm-btns">
              <button className="usb__confirm-no" onClick={() => setLogoutConfirm(false)}>Cancel</button>
              <button className="usb__confirm-yes" onClick={doLogout}>Sign Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UserSidebar({ mobileOpen, onMobileClose, collapsed }) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="usb-overlay" onClick={onMobileClose} aria-hidden="true" />
      )}

      {/* Mobile Drawer */}
      <aside className={`usb-rail usb-rail--mobile${mobileOpen ? ' usb-rail--mobile-open' : ''}`}>
        <SidebarContent collapsed={false} onClose={onMobileClose} />
      </aside>

      {/* Desktop Rail with Spring Expansion Animation */}
      <aside
        className={`usb-rail usb-rail--desktop${collapsed ? ' usb-rail--collapsed' : ' usb-rail--expanded'}`}
        style={{
          width: collapsed ? DRAWER_WIDTH_CLOSED : DRAWER_WIDTH,
          minWidth: collapsed ? DRAWER_WIDTH_CLOSED : DRAWER_WIDTH,
          maxWidth: collapsed ? DRAWER_WIDTH_CLOSED : DRAWER_WIDTH,
          flexBasis: collapsed ? DRAWER_WIDTH_CLOSED : DRAWER_WIDTH,
        }}
      >
        <SidebarContent collapsed={collapsed} onClose={() => {}} />
      </aside>
    </>
  );
}
