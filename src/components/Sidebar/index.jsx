import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Typography, Divider,
  Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Button, Tooltip,
} from '@mui/material';
import { clearAdminAuth } from '../../services/apiClients';
import DashboardIcon       from '@mui/icons-material/Dashboard';
import InventoryIcon       from '@mui/icons-material/Inventory';
import ShoppingCartIcon    from '@mui/icons-material/ShoppingCart';
import PeopleIcon          from '@mui/icons-material/People';
import CategoryIcon        from '@mui/icons-material/Category';
import LocalShippingIcon   from '@mui/icons-material/LocalShipping';
import PinDropOutlinedIcon from '@mui/icons-material/PinDropOutlined';
import LogoutIcon          from '@mui/icons-material/Logout';

export const DRAWER_WIDTH = 240;

// ── Nav items ─────────────────────────────────────────────────────────────────
const menuItems = [
  { label: 'Dashboard',  path: '/admin/dashboard',  icon: <DashboardIcon /> },
  { label: 'Products',   path: '/admin/products',   icon: <InventoryIcon /> },
  { label: 'Categories', path: '/admin/categories', icon: <CategoryIcon /> },
  { label: 'Orders',     path: '/admin/orders',     icon: <ShoppingCartIcon /> },
  { label: 'Users',      path: '/admin/users',      icon: <PeopleIcon /> },
  { label: 'Shipments',  path: '/admin/shipments',  icon: <LocalShippingIcon /> },
  { label: 'Pincodes',   path: '/admin/pincodes',   icon: <PinDropOutlinedIcon /> },
];

// ── Design tokens for dark sidebar ───────────────────────────────────────────
const SIDEBAR_BG    = '#1a2236';
const ACTIVE_BG     = 'rgba(99,179,237,0.18)';
const ACTIVE_COLOR  = '#63b3ed';
const IDLE_COLOR    = '#94a3b8';
const HOVER_BG      = 'rgba(255,255,255,0.06)';

function Sidebar({ mobileOpen, onMobileClose }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLogout = () => {
    clearAdminAuth();
    setLogoutOpen(false);
    navigate('/admin/login', { replace: true });
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
      <List sx={{ px: 1.25, py: 1.5, flex: 1 }}>
        {menuItems.map(({ label, path, icon }) => {
          const active = location.pathname === path ||
            (path !== '/admin/dashboard' && location.pathname.startsWith(path));
          return (
            <ListItem key={path} disablePadding sx={{ mb: 0.25 }}>
              <ListItemButton
                selected={active}
                onClick={() => { navigate(path); onMobileClose?.(); }}
                sx={{
                  borderRadius: '8px', py: 0.9, px: 1.5,
                  color:   active ? ACTIVE_COLOR : IDLE_COLOR,
                  bgcolor: active ? ACTIVE_BG    : 'transparent',
                  '&:hover': { bgcolor: active ? ACTIVE_BG : HOVER_BG, color: '#fff' },
                  '&.Mui-selected': { bgcolor: ACTIVE_BG },
                  '&.Mui-selected:hover': { bgcolor: ACTIVE_BG },
                  transition: 'all 0.15s',
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                  {icon}
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{
                    fontSize: '0.82rem',
                    fontWeight: active ? 700 : 500,
                    color: 'inherit',
                  }}
                />
                {/* Active indicator bar */}
                {active && (
                  <Box sx={{
                    width: 3, height: 20, borderRadius: 2,
                    bgcolor: ACTIVE_COLOR, flexShrink: 0,
                  }} />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
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
            primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: 500, color: 'inherit' }}
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
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', bgcolor: SIDEBAR_BG },
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
          },
        }}>
        {drawerContent}
      </Drawer>
    </Box>
  );
}

export default Sidebar;
