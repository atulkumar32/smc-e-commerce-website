import { Navigate, useLocation } from 'react-router-dom';
import UserLayout from '../layouts/UserLayout';
import { isUserAuthenticated } from '../services/apiClients';

/**
 * UserGuard — Protected layout route guard for customer portal (/user/*)
 * Evaluates authentication dynamically on each route transition.
 */
export default function UserGuard() {
  const location = useLocation();
  const authenticated = isUserAuthenticated();

  if (!authenticated) {
    // Preserve current attempted path so login can navigate back
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <UserLayout />;
}
