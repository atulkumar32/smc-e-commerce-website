import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import UserSidebar, { DRAWER_WIDTH } from '../components/UserSidebar';
import UserTopbar from '../components/UserTopbar';
import RevealOnScroll from '../components/RevealOnScroll';

function UserLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <UserTopbar onMenuClick={() => setMobileOpen(true)} />
      <UserSidebar
        mobileOpen={mobileOpen}

        onMobileClose={() => setMobileOpen(false)}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          bgcolor: '#ffffff',
        }}
      >
        <Toolbar />
        <RevealOnScroll />
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default UserLayout;

