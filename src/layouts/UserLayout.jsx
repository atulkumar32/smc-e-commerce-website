import { useState } from 'react';
import { Outlet }   from 'react-router-dom';
import UserSidebar, { DRAWER_WIDTH, DRAWER_WIDTH_CLOSED } from '../components/UserSidebar';
import UserTopbar   from '../components/UserTopbar';
import './UserLayout.scss';

function UserLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed,  setCollapsed]  = useState(false);

  // Toggle behavior: On desktop toggles sidebar expansion, on mobile toggles drawer
  const handleToggleMenu = () => {
    if (window.innerWidth >= 900) {
      setCollapsed(c => !c);
    } else {
      setMobileOpen(m => !m);
    }
  };

  return (
    <div className="ulayout">
      {/* Sidebar with 60px/200px spring expansion */}
      <UserSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        collapsed={collapsed}
      />

      {/* Right column */}
      <div
        className="ulayout__main"
        style={{ '--sb-w': `${collapsed ? DRAWER_WIDTH_CLOSED : DRAWER_WIDTH}px` }}
      >
        <UserTopbar
          onMenuClick={handleToggleMenu}
          collapsed={collapsed}
        />
        <main className="ulayout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default UserLayout;
