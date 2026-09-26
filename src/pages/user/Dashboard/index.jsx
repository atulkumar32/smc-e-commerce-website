/**
 * User Dashboard — Premium VORANO Redesign Customer Portal
 *
 * Architecture:
 *   DashboardHeader       — Dynamic welcome greeting, badges, notifications, wishlist/cart icons
 *   ud-top-grid           — ProfileCard (User info & edit) + StatsCards (5 key metrics)
 *   OrderTracking         — Live milestone pipeline for active/latest consignment
 *   OrderOverview         — Recent orders table/cards with instant copy ID and details trigger
 *   WishlistPreview       — Live wishlist items with instant cart drawer addition & remove
 *   RecentlyViewed        — Smooth horizontal carousel for browsing history
 *   RecommendedProducts   — 4-column responsive grid of curated catalog bags
 *   AddressSection        — Shipping destination cards with set-default & modal editor
 *
 * Preserves all live API integrations, auth states, cart context, and address syncing.
 * Legacy dashboard implementation is preserved in comments at the bottom of this file.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Alert, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

import { isUserAuthenticated } from '../../../services/apiClients';
import {
  fetchDashboardCounts,
  fetchDashboardRecentOrders,
  getDashboardCredentials,
} from '../../../Actions/Users/DashboardCountActions';
import { fetchUserProfileApi } from '../../../Actions/Users/FetchUserProfile';
import { fetchWebProductList } from '../../../Actions/Web/GetProductListAction';
import { useCart } from '../../../context/CartContext';

// ── Modular Dashboard Components ──────────────────────────────────────────────
import DashboardHeader      from './components/DashboardHeader';
import ProfileCard          from './components/ProfileCard';
import StatsCards           from './components/StatsCards';
import OrderTracking        from './components/OrderTracking';
import OrderOverview        from './components/OrderOverview';
import WishlistPreview      from './components/WishlistPreview';
import RecentlyViewed       from './components/RecentlyViewed';
import RecommendedProducts  from './components/RecommendedProducts';
import AddressSection       from './components/AddressSection';
import ReviewsModal         from '../../product/ProductDetail/Components/ReviewsModal';

import './UserDashboard.scss';
import './index.scss';

export default function UserDashboard() {
  const navigate = useNavigate();
  const { wishlistCount = 0 } = useCart();

  // ── States ──────────────────────────────────────────────────────────────────
  const [userProfile, setUserProfile] = useState(null);
  const [counts, setCounts] = useState(null);
  const [orders, setOrders] = useState([]);
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [addressCount, setAddressCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [reviewTarget, setReviewTarget] = useState(null);

  const handleOpenReview = useCallback((order) => {
    const items = Array.isArray(order?.items)
      ? order.items
      : typeof order?.items === 'string'
        ? (() => { try { return JSON.parse(order.items); } catch { return []; } })()
        : [];
    const targetItem = items[0] || {};
    const productId =
      targetItem.product_id ||
      targetItem.productId ||
      targetItem.id ||
      order?.product_id ||
      order?.productId ||
      order?.id;

    if (productId) {
      setReviewTarget({
        productId: String(productId),
        productName: targetItem.name || order?.product_name || 'Bespoke Bag',
      });
    }
  }, []);

  // ── Unified Data Fetcher ────────────────────────────────────────────────────
  const loadDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const [countsData, ordersData, profileData, productsData] = await Promise.allSettled([
        fetchDashboardCounts(),
        fetchDashboardRecentOrders({ page: 1, limit: 6 }),
        fetchUserProfileApi(),
        fetchWebProductList({ limit: 8 }),
      ]);

      if (countsData.status === 'fulfilled') {
        setCounts(countsData.value);
      }
      if (ordersData.status === 'fulfilled') {
        setOrders(Array.isArray(ordersData.value) ? ordersData.value : []);
      }
      if (profileData.status === 'fulfilled') {
        setUserProfile(profileData.value);
      }
      if (productsData.status === 'fulfilled') {
        const pList = productsData.value?.data || productsData.value?.products || productsData.value || [];
        setCatalogProducts(Array.isArray(pList) ? pList : []);
      }
    } catch (err) {
      console.error('[UserDashboard] Load error:', err);
      setError('Unable to refresh some dashboard data. You can continue shopping.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!isUserAuthenticated()) {
      navigate('/login', { replace: true });
      return;
    }
    loadDashboardData();
  }, [navigate, loadDashboardData]);

  // Fallback credentials from localStorage if profile API is still pending
  const activeUser = useMemo(() => {
    const creds = getDashboardCredentials();
    return {
      name: userProfile?.name || userProfile?.full_name || creds?.name || 'Customer',
      email: userProfile?.email || creds?.email || '',
      phone: userProfile?.phone || userProfile?.mobile || '',
      user_id: userProfile?.user_id || creds?.user_id || 'SMC',
      address: userProfile?.address || userProfile?.shipping_address || '',
      city: userProfile?.city || '',
      state: userProfile?.state || '',
      pincode: userProfile?.pincode || '',
    };
  }, [userProfile]);

  // Derived stats from counts API or computed fallback from orders
  const stats = useMemo(() => {
    if (counts) {
      return {
        total: Number(counts.total_orders || counts.totalOrders || orders.length || 0),
        spent: Number(counts.total_spent || counts.totalSpent || 0),
        pending: Number(counts.pending || counts.processing || 0),
        shipped: Number(counts.shipped || counts.in_transit || 0),
        delivered: Number(counts.delivered || counts.completed || 0),
      };
    }
    return {
      total: orders.length,
      spent: orders.reduce((sum, o) => sum + Number(o.total_amount || o.total || 0), 0),
      pending: orders.filter((o) => {
        const s = String(o.order_status || o.status || '').toLowerCase();
        return s.includes('pend') || s.includes('process') || s.includes('pack') || s.includes('confirm') || s.includes('approv');
      }).length,
      shipped: orders.filter((o) => {
        const s = String(o.order_status || o.status || '').toLowerCase();
        return s.includes('ship') || s.includes('transit');
      }).length,
      delivered: orders.filter((o) => {
        const s = String(o.order_status || o.status || '').toLowerCase();
        return s.includes('deliver') || s.includes('complet');
      }).length,
    };
  }, [counts, orders]);

  // Identify the most relevant active or recent order for live milestone tracking
  const activeOrder = useMemo(() => {
    if (!orders || orders.length === 0) return null;
    return (
      orders.find((o) => {
        const st = String(o.order_status || o.status || '').toLowerCase();
        return !st.includes('deliver') && !st.includes('cancel') && !st.includes('complet');
      }) || orders[0]
    );
  }, [orders]);

  return (
    <div className="ud-dashboard-root">
      {/* ── 1. Dashboard Welcome & Actions Header ── */}
      <DashboardHeader
        user={activeUser}
        onRefresh={() => loadDashboardData(true)}
        refreshing={refreshing}
      />

      {/* Error alert with retry button if network fails */}
      {error && (
        <Alert
          severity="warning"
          sx={{ mb: 3, borderRadius: '14px', border: '1px solid #fde68a' }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => loadDashboardData(true)}
              startIcon={<RefreshIcon />}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* ── 2. Top Stats Overview (1 Row 5 Columns, 100% Responsive) ── */}
      <div className="ud-stats-container">
        <StatsCards
          stats={stats}
          wishlistCount={wishlistCount}
          addressCount={addressCount}
          loading={loading}
          onNavigateOrders={(filter) =>
            navigate(filter ? `/user/orders?status=${filter}` : '/user/orders')
          }
          onNavigateWishlist={() => navigate('/user/wishlist')}
          onNavigateAddresses={() => {
            const el = document.getElementById('ud-address-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      </div>

      {/* ── 3. Active Order Delivery Milestone Tracker ── */}
      {!loading && activeOrder && (
        <OrderTracking
          order={activeOrder}
          onViewOrder={() => navigate('/user/orders')}
        />
      )}

      {/* ── 4. Recent Consignments & Orders Overview ── */}
      <OrderOverview
        orders={orders}
        loading={loading}
        onViewAll={() => navigate('/user/orders')}
        onViewOrder={() => navigate('/user/orders')}
        onShop={() => navigate('/products')}
        onReview={handleOpenReview}
      />

      {/* ── 5. Wishlist Preview ── */}
      <WishlistPreview
        onViewAll={() => navigate('/user/wishlist')}
        onShop={() => navigate('/products')}
      />

      {/* ── 6. Recently Viewed Products Carousel ── */}
      <RecentlyViewed fallbackProducts={catalogProducts} />

      {/* ── 7. Recommended Products Grid ("Recommended For You") ── */}
      <RecommendedProducts
        products={catalogProducts}
        loading={loading}
      />

      {/* ── 8. Saved Delivery Addresses ── */}
      <div id="ud-address-section">
        <AddressSection
          userProfile={activeUser}
          onAddressCountChange={setAddressCount}
        />
      </div>

      {/* ── 9. Write Review Modal for Delivered Orders ── */}
      {reviewTarget && (
        <ReviewsModal
          productId={reviewTarget.productId}
          totalReviews={0}
          avgRating={0}
          mode="write"
          allowWrite={true}
          onClose={() => setReviewTarget(null)}
        />
      )}
    </div>
  );
}

/*
 ==============================================================================
  OLD / PREVIOUS USER DASHBOARD IMPLEMENTATION (PRESERVED FOR HISTORICAL REFERENCE)
 ==============================================================================

function LegacyUserDashboard() {
  const navigate = useNavigate();
  const creds = getDashboardCredentials();
  const firstName = creds?.name?.split(' ')[0] || 'Valued Member';
  const fullName = creds?.name || 'Customer';
  const initials = (creds?.name || 'U').split(' ').map((w) => w[0] || '').join('').slice(0, 2).toUpperCase();

  const [counts, setCounts] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const greeting = useMemo(() => getGreetingTime(), []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [c, o] = await Promise.all([
        fetchDashboardCounts(),
        fetchDashboardRecentOrders({ page: 1, limit: 5 }),
      ]);
      setCounts(c);
      setOrders(Array.isArray(o) ? o : []);
    } catch (err) {
      setError(err.message || 'Unable to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isUserAuthenticated()) {
      navigate('/login', { replace: true });
      return;
    }
    loadDashboardData();
  }, [navigate]);

  return null;
}
*/
