import { Routes, Route, Navigate } from 'react-router-dom';
import StoreLayout from '../layouts/StoreLayout';
import { AdminShell } from './AdminRoutes';
import DashboardPage from '../pages/admin/Dashboard';
import ProductsPage from '../pages/admin/Products';
import CategoriesPage from '../pages/admin/Categories';
import OrdersPage from '../pages/admin/Orders';
import UsersPage from '../pages/admin/Users';
import AdminLoginPage from '../pages/admin/Login';
import HomePage from '../pages/home';
import AboutPage from '../pages/about';
import ContactPage from '../pages/contact';
import { isAdminAuthenticated } from '../services/apiClients';
import { UserRoutes } from './UserRoutes';
import ProductList from '../pages/product/ProductList';
import ProductDetail from '../pages/product/ProductDetail';
import CartPage from '../pages/cart';
import CheckoutPage from '../pages/checkout';
import WishlistPage from '../pages/wishlist';
import PaymentLoadingPage from '../pages/payment/PaymentLoading/index.jsx';
import PaymentSuccessPage from '../pages/payment/PaymentSuccess/index.jsx';
import PaymentFailedPage from '../pages/payment/PaymentFailed/index.jsx';
import LoginPage from '../pages/auth/Login';
import RegisterPage from '../pages/auth/Register';
import UpcomingPage from '../pages/upComingPage/index.js';

function AppRoutes() {
  return (
    <Routes>
      {/* ── Admin login — standalone, no AdminShell wrapper ── */}
      <Route
        path="/admin/login"
        element={
          isAdminAuthenticated() ? (
            <Navigate to="/admin/dashboard" replace />
          ) : (
            <AdminLoginPage />
          )
        }
      />

      {/* ── Admin panel — protected by admin auth token ── */}
      <Route
        path="/admin"
        element={
          isAdminAuthenticated() ? (
            <AdminShell />
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="users" element={<UsersPage />} />
      </Route>

      {/* ── User routes — dedicated user pages under /user/* ── */}
      {UserRoutes()}

      {/* ── Store (public) ── */}
      <Route element={<StoreLayout />}>

        <Route path="/" element={<UpcomingPage />} />
        <Route path="/uat/" element={<HomePage />} />

        {/* Info pages */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Product pages */}
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:slug" element={<ProductDetail />} />
        {/* Category sub-routes — reuse ProductList with a filter param */}
        <Route path="/products/school-bags" element={<ProductList />} />
        <Route path="/products/purses" element={<ProductList />} />
        <Route path="/products/wallets" element={<ProductList />} />
        <Route path="/products/new-arrivals" element={<ProductList />} />

        {/* Cart & checkout */}
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />

        {/* User shortcuts */}
        <Route path="/dashboard" element={<Navigate to="/user/dashboard" replace />} />
        <Route path="/profile" element={<Navigate to="/user/profile" replace />} />
        <Route path="/orders" element={<Navigate to="/user/orders" replace />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Payment status pages (PhonePe redirect targets) */}
        <Route path="/payment/loading" element={<PaymentLoadingPage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/payment/failed" element={<PaymentFailedPage />} />

        {/* Static info pages */}
        <Route path="/craftsmanship" element={<AboutPage />} />
        <Route path="/sustainability" element={<AboutPage />} />
        <Route path="/privacy-policy" element={<AboutPage />} />
        <Route path="/shipping-returns" element={<ContactPage />} />
        <Route path="/care-guide" element={<AboutPage />} />
        <Route path="/store-locator" element={<ContactPage />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
