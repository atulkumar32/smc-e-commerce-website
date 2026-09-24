import { Route, Navigate } from 'react-router-dom';
import UserLayout from '../layouts/UserLayout';
import UserDashboardPage from '../pages/user/Dashboard';
import UserProfile from '../pages/user/Profile';
import UserOrders from '../pages/user/Orders';
import WishlistPage from '../pages/wishlist';
import CartPage from '../pages/cart';
import { isUserAuthenticated } from '../services/apiClients';

export function UserRoutes() {
  return (
    <Route path="/user" element={<UserLayout />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route
        path="dashboard"
        element={
          isUserAuthenticated() ? <UserDashboardPage /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="orders"
        element={
          isUserAuthenticated() ? <UserOrders /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="profile"
        element={
          isUserAuthenticated() ? <UserProfile /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="security"
        element={
          isUserAuthenticated() ? <UserProfile initialTab={1} /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="wishlist"
        element={
          isUserAuthenticated() ? <WishlistPage /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="cart"
        element={
          isUserAuthenticated() ? <CartPage /> : <Navigate to="/login" replace />
        }
      />
    </Route>
  );
}
