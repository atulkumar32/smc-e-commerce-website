/**
 * UserSidebar
 * Collapsed 60px (icons only) ↔ Expanded 200px (icon + label)
 * Width animates with 0.3s ease
 */

import { useState }                 from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Tooltip, Typography,
  Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, Button,
} from '@mui/material';
import DashboardOutlinedIcon     from '@mui/icons-material/DashboardOutlined';
import ShoppingBagOutlinedIcon   from '@mui/icons-material/ShoppingBagOutlined';
import PersonOutlinedIcon        from '@mui/icons-material/PersonOutlined';
import StorefrontOutlinedIcon    from '@mui/icons-material/StorefrontOutlined';
import FavoriteBorderIcon        from '@mui/icons-material/FavoriteBorder';
import SupportAgentOutlinedIcon  from '@mui/icons-material/SupportAgentOutlined';
import LogoutOutlinedIcon        from '@mui/icons-material/LogoutOutlined';
import { clearUserAuth }         from '../../services/apiClients';
import { getProfileCredentials } from '../../Actions/Users/FetchUserProfile';

export const SIDEBAR_W_OPEN   = 200;
export const SIDEBAR_W_CLOSED = 60;
export const DRAWER_WIDTH     = SIDEBAR_W_OPEN;

const BG        = '#1a2236';
const ACTIVE_BG = '#2563eb';
const IDLE_CLR  = '#94a3b8';
const HOVER_BG  = 'rgba(255,255,255,0.07)';
const DIVIDER   = 'rgba(255,255,255,0.08)';

const NAV = [
  { label: 'Dashboard', path: '/user/dashboard', Icon: DashboardOutlinedIcon    },
  { label: 'My Orders', path: '/user/orders',    Icon: ShoppingBagOutlinedIcon  },
  { label: 'Profile',   path: '/user/profile',   Icon: PersonOutlinedIcon       },
  { label: 'Shop',      path: '/products',        Icon: StorefrontOutlinedIcon   },
  { label: 'Wishlist',  path: '/wishlist',        Icon: FavoriteBorderIcon       },
  { label: 'Support',   path: '/contact',         Icon: SupportAgentOutlinedIcon },
];

function NavRow({ label, Icon, active, expanded, onClick }) {
  const row = (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex', alignItems: 'center',
        height: 44, mx: '6px', borderRadius: '10px',
        cursor: 'pointer', overflow: 'hidden',
        justifyContent: expanded ? 'flex-start' : 'center',
        px: expanded ? '12px' : 0,
        color: active ? '#fff' : IDLE_CLR,
        bgcolor: active ? ACTIVE_BG : 'transparent',
        transition: 'background 0.15s, color 0.15s, padding 0.3s ease',
        '&:hover': { bgcolor: active ? ACTIVE_BG : HOVER_BG, color: active ? '#fff' : '#e2e8f0' },
      }}
    >
      <Box sx={{ flexShrink: 0, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon sx={{ fontSize: 20 }} />
      </Box>
      <Box sx={{
        overflow: 'hidden',
        maxWidth: expanded ? 130 : 0,
        opacity: expanded ? 1 : 0,
        ml: expanded ? '8px' : 0,
        transition: 'max-width 0.3s ease, opacity 0.2s ease',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
      }}>
        <Typography sx={{ fontSize: '0.84rem', fontWeight: active ? 700 : 500, color: 'inherit', letterSpacing: '-0.01em', lineHeight: 1 }}>
          {label}
        </Typography>
      </Box>
    </Box>
  );
  return expanded ? row : <Tooltip title={label} placement="right" arrow>{row}</Tooltip>;
}

function SidebarInner({ expanded, onMobileClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const creds    = getProfileCredentials();
  const [logoutDlg, setLogoutDlg] = useState(false);

  const go = (path) => { navigate(path); onMobileClose?.(); };

  const isActive = (path) =>
    location.pathname === path ||
    (path.startsWith('/user/') && path !== '/user/dashboard' && location.pathname.startsWith(path));

  const initials = (creds?.name || 'U').split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase();

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: BG, overflow: 'hidden' }}>

      {/* Brand */}
      <Box sx={{
        height: 60, flexShrink: 0,
        display: 'flex', alignItems: 'center',
        justifyContent: expanded ? 'flex-start' : 'center',
        px: expanded ? '14px' : 0, gap: expanded ? '10px' : 0,
        borderBottom: `1px solid ${DIVIDER}`, overflow: 'hidden',
        transition: 'padding 0.3s ease',
      }}>
        <Box sx={{ flexShrink: 0, width: 36, height: 36, borderRadius: '9px', background: 'linear-gradient(135deg,#D4AF37,#9a7a0a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography sx={{ color: '#0f1c2e', fontWeight: 900, fontSize: '0.66rem' }}>SMC</Typography>
        </Box>
        <Box sx={{ overflow: 'hidden', maxWidth: expanded ? 130 : 0, opacity: expanded ? 1 : 0, transition: 'max-width 0.3s ease, opacity 0.2s ease', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
          <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.86rem', lineHeight: 1.15 }}>Shree Mahaveer</Typography>
          <Typography sx={{ color: '#D4AF37', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Collections</Typography>
        </Box>
      </Box>

      {/* Nav */}
      <Box sx={{ flex: 1, pt: '8px', overflowY: 'auto', overflowX: 'hidden', '&::-webkit-scrollbar': { width: 3 }, '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.1)', borderRadius: 2 } }}>
        {NAV.map(({ label, path, Icon }) => (
          <Box key={path} sx={{ mb: '2px' }}>
            <NavRow label={label} Icon={Icon} active={isActive(path)} expanded={expanded} onClick={() => go(path)} />
          </Box>
        ))}
      </Box>

      {/* Footer */}
      <Box sx={{ borderTop: `1px solid ${DIVIDER}`, pt: '8px', pb: '10px', flexShrink: 0 }}>
        {/* User */}
        <Tooltip title={expanded ? '' : (creds?.name || 'Profile')} placement="right" arrow>
          <Box onClick={() => go('/user/profile')} sx={{ display: 'flex', alignItems: 'center', height: 44, mx: '6px', borderRadius: '10px', cursor: 'pointer', overflow: 'hidden', justifyContent: expanded ? 'flex-start' : 'center', px: expanded ? '12px' : 0, gap: expanded ? '10px' : 0, transition: 'padding 0.3s ease', '&:hover': { bgcolor: HOVER_BG } }}>
            <Box sx={{ flexShrink: 0, width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#1e3a5f,#1565c0)', border: '1.5px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#F5D77F' }}>
              {initials}
            </Box>
            <Box sx={{ overflow: 'hidden', maxWidth: expanded ? 120 : 0, opacity: expanded ? 1 : 0, transition: 'max-width 0.3s ease, opacity 0.2s ease', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
              <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.78rem', lineHeight: 1.2 }}>{creds?.name || 'User'}</Typography>
              <Typography sx={{ color: '#22c55e', fontSize: '0.62rem', fontWeight: 600 }}>Active</Typography>
            </Box>
          </Box>
        </Tooltip>

        {/* Logout */}
        <Tooltip title={expanded ? '' : 'Logout'} placement="right" arrow>
          <Box onClick={() => { setLogoutDlg(true); onMobileClose?.(); }} sx={{ display: 'flex', alignItems: 'center', height: 44, mx: '6px', mt: '2px', borderRadius: '10px', cursor: 'pointer', overflow: 'hidden', justifyContent: expanded ? 'flex-start' : 'center', px: expanded ? '12px' : 0, gap: expanded ? '10px' : 0, color: '#f87171', transition: 'padding 0.3s ease', '&:hover': { bgcolor: 'rgba(239,68,68,0.1)' } }}>
            <Box sx={{ flexShrink: 0, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LogoutOutlinedIcon sx={{ fontSize: 19 }} />
            </Box>
            <Box sx={{ overflow: 'hidden', maxWidth: expanded ? 120 : 0, opacity: expanded ? 1 : 0, transition: 'max-width 0.3s ease, opacity 0.2s ease', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: 'inherit' }}>Logout</Typography>
            </Box>
          </Box>
        </Tooltip>
      </Box>

      {/* Logout dialog */}
      <Dialog open={logoutDlg} onClose={() => setLogoutDlg(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '14px' } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm Logout</DialogTitle>
        <DialogContent><DialogContentText>Are you sure you want to end your session?</DialogContentText></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setLogoutDlg(false)} sx={{ textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
          <Button onClick={() => { clearUserAuth(); setLogoutDlg(false); navigate('/login', { replace: true }); }} variant="contained" color="error" sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', boxShadow: 'none' }}>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function UserSidebar({ mobileOpen, onMobileClose, expanded }) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <Box sx={{ display: { xs: 'block', md: 'none' }, position: 'fixed', inset: 0, zIndex: 1400 }}>
          <Box onClick={onMobileClose} sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.5)' }} />
          <Box sx={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: SIDEBAR_W_OPEN }}>
            <SidebarInner expanded onMobileClose={onMobileClose} />
          </Box>
        </Box>
      )}

      {/* Desktop permanent */}
      <Box sx={{ display: { xs: 'none', md: 'block' }, flexShrink: 0, width: expanded ? SIDEBAR_W_OPEN : SIDEBAR_W_CLOSED, minHeight: '100vh', transition: 'width 0.3s ease', overflow: 'hidden', position: 'sticky', top: 0, zIndex: 1200 }}>
        <SidebarInner expanded={expanded} onMobileClose={onMobileClose} />
      </Box>
    </>
  );
}

export default UserSidebar;
