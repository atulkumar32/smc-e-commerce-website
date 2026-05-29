import { Box, AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useLocation } from 'react-router-dom';
import { useMemo } from 'react';

function titleFromPath(pathname) {
  if (pathname.startsWith('/user/dashboard')) return 'Dashboard';
  if (pathname.startsWith('/user/profile')) return 'Profile';
  if (pathname.startsWith('/user/orders')) return 'Orders';
  return 'User';
}

function UserTopbar({ onMenuClick }) {
  const location = useLocation();

  const title = useMemo(() => titleFromPath(location.pathname), [location.pathname]);

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
        zIndex: (t) => t.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { md: 'none' } }}
          aria-label="open navigation"
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" component="h1" fontWeight={600} sx={{ flexGrow: 1 }}>
          {title}
        </Typography>

        {/* Logout is handled from the sidebar with confirmation modal */}
        <Box />
      </Toolbar>
    </AppBar>
  );
}

export default UserTopbar;

