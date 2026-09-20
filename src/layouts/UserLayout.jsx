import { useState }   from 'react';
import { Outlet }      from 'react-router-dom';
import { Box }         from '@mui/material';
import UserSidebar     from '../components/UserSidebar';
import UserTopbar      from '../components/UserTopbar';
import { SIDEBAR_W_OPEN, SIDEBAR_W_CLOSED } from '../components/UserSidebar';

function UserLayout() {
  const [expanded,   setExpanded]   = useState(true);   // sidebar expanded by default
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f0f4f8' }}>

      {/* Sidebar — sticky on desktop, overlay on mobile */}
      <UserSidebar
        expanded={expanded}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Right side: topbar + page content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Topbar — passes toggle callback so the hamburger icon controls expansion */}
        <UserTopbar
          onMenuClick={() => {
            // On mobile open the overlay drawer; on desktop toggle expand
            if (window.innerWidth < 900) {
              setMobileOpen(true);
            } else {
              setExpanded(e => !e);
            }
          }}
          sidebarExpanded={expanded}
        />

        {/* Page content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            pt: { xs: '64px', sm: '70px' },   // clears fixed topbar
            px: { xs: 2, sm: 3 },
            pb: 4,
            minWidth: 0,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default UserLayout;
