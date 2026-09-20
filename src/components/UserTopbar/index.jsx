import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, IconButton, Box,
  Badge, Tooltip, Avatar,
} from '@mui/material';
import MenuIcon     from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import ShoppingBagOutlinedIcon    from '@mui/icons-material/ShoppingBagOutlined';
import VerifiedUserOutlinedIcon   from '@mui/icons-material/VerifiedUserOutlined';
import { useCart } from '../../context/CartContext';
import { getProfileCredentials } from '../../Actions/Users/FetchUserProfile';

function getPageMeta(pathname) {
  if (pathname.startsWith('/user/orders'))  return { title: 'My Orders',        breadcrumb: 'Orders History & Tracking' };
  if (pathname.startsWith('/user/profile')) return { title: 'Account Settings', breadcrumb: 'Profile & Security' };
  return { title: 'Dashboard', breadcrumb: 'Overview & Activity' };
}

function UserTopbar({ onMenuClick, sidebarExpanded }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount = 0, wishlistCount = 0 } = useCart();
  const creds = getProfileCredentials();

  const meta        = useMemo(() => getPageMeta(location.pathname), [location.pathname]);
  const displayName = creds?.name?.split(' ')[0] || 'Member';
  const initials    = (creds?.name || 'U').split(' ').map((w) => w[0] || '').join('').slice(0, 2).toUpperCase();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(16px)',
        color: '#0f172a',
        borderBottom: '1px solid rgba(226,232,240,0.85)',
        zIndex: 1100,   // sidebar (1200) overlaps the topbar on the left
        left: 0,
        right: 0,
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      <Toolbar sx={{ px: { xs: 2, sm: 3 }, minHeight: { xs: 64, sm: 70 }, gap: 1 }}>

        {/* Hamburger — always visible, switches icon with sidebar state */}
        <IconButton
          edge="start"
          onClick={onMenuClick}
          sx={{
            color: '#1e293b',
            bgcolor: '#f1f5f9',
            borderRadius: '10px',
            '&:hover': { bgcolor: '#e2e8f0' },
          }}
          aria-label="toggle sidebar"
        >
          {sidebarExpanded
            ? <MenuOpenIcon sx={{ fontSize: 22 }} />
            : <MenuIcon     sx={{ fontSize: 22 }} />}
        </IconButton>

        {/* Page title — simple, no breadcrumb */}
        <Typography
          variant="h6"
          component="h1"
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            fontSize: { xs: '1rem', sm: '1.1rem' },
            color: '#0f172a',
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
            minWidth: 0,
          }}
        >
          {meta.title}
        </Typography>

        {/* Right-side actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>

          <Tooltip title="Wishlist">
            <IconButton onClick={() => navigate('/wishlist')} sx={{ color: '#475569', bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', width: 40, height: 40, '&:hover': { bgcolor: '#f1f5f9', color: '#dc2626' } }}>
              <Badge badgeContent={wishlistCount} color="error" max={99}>
                <FavoriteBorderOutlinedIcon sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Cart">
            <IconButton onClick={() => navigate('/cart')} sx={{ color: '#475569', bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', width: 40, height: 40, '&:hover': { bgcolor: '#f1f5f9', color: '#001F3F' } }}>
              <Badge badgeContent={cartCount} color="primary" max={99}>
                <ShoppingBagOutlinedIcon sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User capsule */}
          <Box
            onClick={() => navigate('/user/profile')}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1.25,
              py: 0.5, px: { xs: 0.75, sm: 1.25 },
              borderRadius: '24px', border: '1px solid #e2e8f0',
              bgcolor: '#fff', cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc', boxShadow: '0 2px 10px rgba(0,31,63,0.06)' },
            }}
          >
            <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', fontWeight: 700, bgcolor: '#001F3F', color: '#D4AF37', border: '1.5px solid #D4AF37' }}>
              {initials}
            </Avatar>
            <Box sx={{ display: { xs: 'none', md: 'block' }, pr: 0.5 }}>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.1 }}>
                {displayName}
              </Typography>
              <Typography sx={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.3 }}>
                <VerifiedUserOutlinedIcon sx={{ fontSize: 11 }} /> Active
              </Typography>
            </Box>
          </Box>

        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default UserTopbar;
