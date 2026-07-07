import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import Sidebar, { DRAWER_WIDTH } from '../Sidebar';
import AdminHeader from '../AdminHeader';

const pageTitles = {
  '/admin/dashboard': 'Dashboard',
  '/admin/products': 'Products',
  '/admin/categories': 'Categories',
  '/admin/orders': 'Orders',
  '/admin/users': 'Users',
  '/admin/shipments': 'Shipments',
};

function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Admin';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AdminHeader title={title} onMenuClick={() => setMobileOpen(true)} />
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default AdminLayout;
