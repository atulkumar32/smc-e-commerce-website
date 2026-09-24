import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Avatar, IconButton, Badge, Tooltip, Menu, MenuItem,
  ListItemIcon, ListItemText, Divider, Button
} from '@mui/material';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import { useCart } from '../../../../context/CartContext';
import { useCartDrawer } from '../../../../context/CartDrawerContext';

const getGreetingTime = () => {
  const hr = new Date().getHours();
  if (hr < 12) return 'Good Morning';
  if (hr < 18) return 'Good Afternoon';
  return 'Good Evening';
};

export default function DashboardHeader({ user, onRefresh, refreshing }) {
  const navigate = useNavigate();
  const { wishlistCount = 0, totalItems = 0 } = useCart();
  const { openDrawer } = useCartDrawer ? useCartDrawer() : { openDrawer: () => navigate('/cart') };

  const [notifAnchor, setNotifAnchor] = useState(null);

  const greeting = useMemo(() => getGreetingTime(), []);
  const firstName = user?.name ? user.name.split(' ')[0] : 'Valued Member';
  const initials = (user?.name || 'U').split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase();

  const handleOpenNotif = (e) => setNotifAnchor(e.currentTarget);
  const handleCloseNotif = () => setNotifAnchor(null);

  return (
    <header className="ud-header">
      <div className="ud-header__welcome">
        <div className="ud-header__avatar-wrap">
          <Avatar className="ud-header__avatar">
            {initials}
          </Avatar>
          <span className="ud-header__online-dot" />
        </div>

        <div className="ud-header__text">
          <div className="ud-header__badge-row">
            <span className="ud-header__status-badge">
              <span className="ud-header__status-pulse" />
              Privilege Member
            </span>
            <span className="ud-header__store-tag">SMC Luxury Portal</span>
          </div>
          <h1 className="ud-header__title">
            {greeting}, {firstName} <span className="ud-header__wave">👋</span>
          </h1>
          <p className="ud-header__subtitle">
            Welcome back to <strong>Shree Mahaveer Collections</strong> &mdash; manage your bespoke bags and shipments.
          </p>
        </div>
      </div>

      <div className="ud-header__actions">
        {/* Refresh Action */}
        {onRefresh && (
          <Tooltip title="Refresh Dashboard" arrow>
            <IconButton
              onClick={onRefresh}
              className={`ud-header__icon-btn ${refreshing ? 'ud-header__icon-btn--spin' : ''}`}
              aria-label="Refresh Dashboard"
            >
              <RefreshOutlinedIcon />
            </IconButton>
          </Tooltip>
        )}

        {/* Notifications Icon with Popover */}
        <Tooltip title="Notifications" arrow>
          <IconButton
            onClick={handleOpenNotif}
            className="ud-header__icon-btn"
            aria-label="Notifications"
          >
            <Badge color="primary" variant="dot" invisible={false}>
              <NotificationsNoneOutlinedIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={notifAnchor}
          open={Boolean(notifAnchor)}
          onClose={handleCloseNotif}
          PaperProps={{
            elevation: 4,
            className: 'ud-notif-menu',
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box className="ud-notif-menu__header">
            <Typography variant="subtitle2" fontWeight={800}>
              Order Notifications
            </Typography>
            <span className="ud-notif-menu__badge">2 New</span>
          </Box>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem onClick={() => { handleCloseNotif(); navigate('/user/orders'); }} className="ud-notif-item">
            <ListItemIcon>
              <ShoppingBagOutlinedIcon fontSize="small" sx={{ color: '#0284c7' }} />
            </ListItemIcon>
            <ListItemText
              primary="Order Dispatch Update"
              secondary="Your recent bag consignment is verified and in dispatch queue."
              primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: 700 }}
              secondaryTypographyProps={{ fontSize: '0.72rem' }}
            />
          </MenuItem>
          <MenuItem onClick={() => { handleCloseNotif(); navigate('/products'); }} className="ud-notif-item">
            <ListItemIcon>
              <FavoriteBorderOutlinedIcon fontSize="small" sx={{ color: '#d4af37' }} />
            </ListItemIcon>
            <ListItemText
              primary="VORANO New Drops"
              secondary="New handcrafted school bags and leather purses are now live."
              primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: 700 }}
              secondaryTypographyProps={{ fontSize: '0.72rem' }}
            />
          </MenuItem>
        </Menu>

        {/* Contextual Action Buttons */}
        <Button
          variant="contained"
          onClick={() => navigate('/products')}
          startIcon={<StorefrontOutlinedIcon sx={{ fontSize: 18 }} />}
          sx={{
            bgcolor: '#001F3F',
            color: '#ffffff',
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.82rem',
            px: 2,
            py: 0.9,
            boxShadow: '0 4px 14px rgba(0, 31, 63, 0.2)',
            '&:hover': { bgcolor: '#002d5a' },
            display: { xs: 'none', sm: 'inline-flex' },
          }}
        >
          Explore Catalog
        </Button>

        <Button
          variant="outlined"
          onClick={() => navigate('/user/orders')}
          startIcon={<LocalShippingOutlinedIcon sx={{ fontSize: 18 }} />}
          sx={{
            color: '#001F3F',
            borderColor: 'rgba(0, 31, 63, 0.25)',
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.82rem',
            px: 2,
            py: 0.9,
            '&:hover': { borderColor: '#001F3F', bgcolor: 'rgba(0, 31, 63, 0.04)' },
          }}
        >
          Track Consignments
        </Button>
      </div>
    </header>
  );
}

