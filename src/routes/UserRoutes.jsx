import { Route, Navigate } from 'react-router-dom';
import UserGuard from './UserGuard';
import UserDashboardPage from '../pages/user/Dashboard';
import UserProfile from '../pages/user/Profile';
import UserOrders from '../pages/user/Orders';
import WishlistPage from '../pages/wishlist';
import CartPage from '../pages/cart';

export function UserRoutes() {
  return (
    <Route path="/user" element={<UserGuard />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<UserDashboardPage />} />
      <Route path="orders"    element={<UserOrders />} />
      <Route path="profile"   element={<UserProfile />} />
      <Route path="security"  element={<UserProfile initialTab={1} />} />
      <Route path="wishlist"  element={<WishlistPage />} />
      <Route path="cart"      element={<CartPage />} />
    </Route>
  );
}
