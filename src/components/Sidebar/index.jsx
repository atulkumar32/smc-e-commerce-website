import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Typography,
  Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Button, Popper, Paper, Fade,
} from '@mui/material';
import { clearAdminAuth } from '../../services/apiClients';
import DashboardIcon        from '@mui/icons-material/Dashboard';
import InventoryIcon        from '@mui/icons-material/Inventory';
import ShoppingCartIcon     from '@mui/icons-material/ShoppingCart';
import PeopleIcon           from '@mui/icons-material/People';
import CategoryIcon         from '@mui/icons-material/Category';
import LocalShippingIcon    from '@mui/icons-material/LocalShipping';
import PinDropOutlinedIcon  from '@mui/icons-material/PinDropOutlined';
import PaletteIcon          from '@mui/icons-material/Palette';
import RateReviewIcon       from '@mui/icons-material/RateReview';
import LocalOfferIcon        from '@mui/icons-material/LocalOffer';
import MailOutlinedIcon      from '@mui/icons-material/MailOutlined';
import LogoutIcon           from '@mui/icons-material/Logout';
import LayersIcon           from '@mui/icons-material/Layers';
import AddBoxIcon           from '@mui/icons-material/AddBox';
import ChevronRightIcon     from '@mui/icons-material/ChevronRight';
import './index.scss';

export const DRAWER_WIDTH = 240;

// ── Design tokens ─────────────────────────────────────────────────────────────
const SIDEBAR_BG   = '#1a2236';
const ACTIVE_BG    = 'rgba(99,179,237,0.18)';
const ACTIVE_COLOR = '#63b3ed';
const IDLE_COLOR   = '#94a3b8';
const HOVER_BG     = 'rgba(255,255,255,0.06)';

// ── Nav items ─────────────────────────────────────────────────────────────────
// children[] = hover flyout sub-items
const menuItems = [
  { label: 'Dashboard',         path: '/admin/dashboard',          icon: <DashboardIcon /> },
  {
    label: 'Products',
    path:  '/admin/products',
    icon:  <InventoryIcon />,
    children: [
      { label: 'Master Products', path: '/admin/products',   icon: <LayersIcon /> },
      { label: 'Add Variant',     path: '/admin/add-variant', icon: <AddBoxIcon /> },
    ],
  },
  { label: 'Categories',        path: '/admin/categories',         icon: <CategoryIcon /> },
  { label: 'Orders',            path: '/admin/orders',             icon: <ShoppingCartIcon /> },
  { label: 'Users',             path: '/admin/users',              icon: <PeopleIcon /> },
  { label: 'Shipments',         path: '/admin/shipments',          icon: <LocalShippingIcon /> },
  { label: 'Pincodes',          path: '/admin/pincodes',           icon: <PinDropOutlinedIcon /> },
  { label: 'Color Codes',       path: '/admin/bulk-upload-colors', icon: <PaletteIcon /> },
  { label: 'Reviews & Ratings', path: '/admin/reviews',            icon: <RateReviewIcon /> },
  { label: 'Coupons',           path: '/admin/coupons',            icon: <LocalOfferIcon /> },
  { label: 'Send Mail',         path: '/admin/send-emails',        icon: <MailOutlinedIcon /> },
];

// ── Flyout submenu (appears to the right of the sidebar) ──────────────────────
function FlyoutMenu({ anchorEl, open, children: subs, onNavigate }) {
  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="right-start"
      transition
      style={{ zIndex: 1400 }}
      modifiers={[{ name: 'offset', options: { offset: [0, 4] } }]}
    >
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={160}>
          <Paper elevation={8} sx={{
            bgcolor: '#ffffff',
            borderRadius: '10px',
            overflow: 'hidden',
            minWidth: 196,
            border: '1px solid #e4e7ec',
            py: 0.5,
          }}>
            {subs.map((sub) => (
              <Box
                key={sub.path}
                onClick={() => onNavigate(sub.path)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.25,
                  px: 1.75,
                  py: 1,
                  cursor: 'pointer',
                  fontSize: '0.83rem',
                  fontWeight: 500,
                  color: '#1a2236',
                  transition: 'background 0.13s, color 0.13s',
                  '&:hover': {
                    bgcolor: '#eff6ff',
                    color: '#1565c0',
                  },
                }}
              >
                <Box sx={{ color: '#1565c0', display: 'flex', alignItems: 'center' }}>
                  {sub.icon
                    ? <Box sx={{ fontSize: 16, display: 'flex' }}>{sub.icon}</Box>
                    : null}
                </Box>
                <Typography variant="body2" fontWeight={500} color="inherit">
                  {sub.label}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Fade>
      )}
    </Popper>
  );
}

// ── Single nav item (with optional flyout) ────────────────────────────────────
function NavItem({ item, active, onNavigate, onMobileClose }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;

  const handleMouseEnter = (e) => {
    if (hasChildren) setAnchorEl(e.currentTarget);
  };
  const handleMouseLeave = () => {
    setAnchorEl(null);
  };
  const handleClick = () => {
    if (!hasChildren) {
      onNavigate(item.path);
      onMobileClose?.();
    }
  };
  const handleSubNavigate = (path) => {
    setAnchorEl(null);
    onNavigate(path);
    onMobileClose?.();
  };

  return (
    <ListItem disablePadding sx={{ mb: 0.25, position: 'relative' }}>
      <ListItemButton
        selected={active}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sx={{
          borderRadius: '8px', py: 0.9, px: 1.5,
          color: '#ffffff',
          bgcolor: active ? ACTIVE_BG : 'transparent',
          '&:hover': { bgcolor: active ? ACTIVE_BG : HOVER_BG, color: '#ffffff' },
          '&.Mui-selected': { bgcolor: ACTIVE_BG, color: '#ffffff' },
          '&.Mui-selected:hover': { bgcolor: ACTIVE_BG, color: '#ffffff' },
          '& .MuiListItemIcon-root': { color: '#ffffff' },
          '& .MuiTypography-root': { color: '#ffffff' },
          transition: 'all 0.15s',
        }}
      >
        <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
          {item.icon}
        </ListItemIcon>
        <ListItemText primary={item.label} />
        {/* Chevron for items with children */}
        {hasChildren && (
          <ChevronRightIcon sx={{ fontSize: 16, color: IDLE_COLOR, flexShrink: 0 }} />
        )}
        {/* Active bar */}
        {active && !hasChildren && (
          <Box sx={{
            width: 3, height: 20, borderRadius: 2,
            bgcolor: ACTIVE_COLOR, flexShrink: 0,
          }} />
        )}
      </ListItemButton>

      {/* Flyout — only rendered when hovered */}
      {hasChildren && (
        <Box onMouseEnter={() => setAnchorEl(anchorEl)} onMouseLeave={handleMouseLeave}>
          <FlyoutMenu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            children={item.children}
            onNavigate={handleSubNavigate}
          />
        </Box>
      )}
    </ListItem>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ mobileOpen, onMobileClose }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLogout = () => {
    clearAdminAuth();
    setLogoutOpen(false);
    navigate('/admin/login', { replace: true });
  };

  const isActive = (item) => {
    if (item.children) {
      return item.children.some(
        (c) => location.pathname === c.path ||
          (c.path !== '/admin/dashboard' && location.pathname.startsWith(c.path))
      );
    }
    return location.pathname === item.path ||
      (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
  };

  const drawerContent = (
    <Box sx={{
      height: '100%', display: 'flex', flexDirection: 'column',
      bgcolor: SIDEBAR_BG, color: '#fff',
    }}>
      {/* ── Brand ── */}
      <Box sx={{
        px: 2.5, py: 2.25,
        display: 'flex', alignItems: 'center', gap: 1.5,
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <Box sx={{
          width: 34, height: 34, borderRadius: '8px',
          bgcolor: '#1565c0', display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <DashboardIcon sx={{ color: '#fff', fontSize: 18 }} />
        </Box>
        <Box>
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem', lineHeight: 1.2 }}>
            Shree Mahaveer
          </Typography>
          <Typography sx={{ color: IDLE_COLOR, fontSize: '0.66rem' }}>
            Collections Admin
          </Typography>
        </Box>
      </Box>

      {/* ── Nav items ── */}
      <List sx={{ px: 1.25, py: 1.5, flex: 1, overflow: 'visible' }}>
        {menuItems.map((item) => (
          <NavItem
            key={item.path}
            item={item}
            active={isActive(item)}
            onNavigate={(path) => navigate(path)}
            onMobileClose={onMobileClose}
          />
        ))}
      </List>

      {/* ── Logout ── */}
      <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.07)', px: 1.25, py: 1.5 }}>
        <ListItemButton
          onClick={() => { setLogoutOpen(true); onMobileClose?.(); }}
          sx={{
            borderRadius: '8px', py: 0.9, px: 1.5,
            color: '#ef4444',
            '&:hover': { bgcolor: 'rgba(239,68,68,0.1)' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            sx={{ '& .MuiTypography-root': { fontSize: '0.82rem', fontWeight: 500, color: 'inherit' } }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
      {/* Logout confirm */}
      <Dialog open={logoutOpen} onClose={() => setLogoutOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to logout? This will clear your admin session.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleLogout} color="error" variant="contained">Logout</Button>
        </DialogActions>
      </Dialog>

      {/* Mobile drawer */}
      <Drawer variant="temporary" open={mobileOpen} onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', bgcolor: SIDEBAR_BG, overflow: 'visible' },
        }}>
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer variant="permanent" open
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH, boxSizing: 'border-box',
            bgcolor: SIDEBAR_BG, border: 'none',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            overflow: 'visible',  // allows flyout to escape the drawer
          },
        }}>
        {drawerContent}
      </Drawer>
    </Box>
  );
}

export default Sidebar;
