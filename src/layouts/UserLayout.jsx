import { useState } from 'react';
import { Outlet }   from 'react-router-dom';
import UserSidebar, { DRAWER_WIDTH, DRAWER_WIDTH_CLOSED } from '../components/UserSidebar';
import UserTopbar   from '../components/UserTopbar';
import './UserLayout.scss';

function UserLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed,  setCollapsed]  = useState(false);

  return (
    <div className="ulayout">
      {/* Desktop sidebar */}
      <UserSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(c => !c)}
      />

      {/* Right column */}
      <div
        className="ulayout__main"
        style={{ '--sb-w': `${collapsed ? DRAWER_WIDTH_CLOSED : DRAWER_WIDTH}px` }}
      >
        <UserTopbar
          onMenuClick={() => setMobileOpen(true)}
          sidebarExpanded={!collapsed}
        />
        <main className="ulayout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default UserLayout;
