import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Stack, Alert, Skeleton,
  Card, Grid, Tooltip, IconButton, Chip, Avatar,
} from '@mui/material';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import ContactSupportOutlinedIcon from '@mui/icons-material/ContactSupportOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import VerifiedIcon from '@mui/icons-material/Verified';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';

import { isUserAuthenticated } from '../../../services/apiClients';
import {
  fetchDashboardCounts,
  fetchDashboardRecentOrders,
  getDashboardCredentials,
} from '../../../Actions/Users/DashboardCountActions';

import './index.scss';

// ── Helpers ───────────────────────────────────────────────────────────────────
const getGreetingTime = () => {
  const hr = new Date().getHours();
  if (hr < 12) return 'Good Morning';
  if (hr < 18) return 'Good Afternoon';
  return 'Good Evening';
};

const statusMeta = (s = '') => {
  const v = String(s).toLowerCase();
  if (v.includes('deliver') || v.includes('complet')) {
    return { label: 'Delivered', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', dot: '#22c55e' };
  }
  if (v.includes('ship') || v.includes('transit')) {
    return { label: 'In Transit', color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd', dot: '#0ea5e9' };
  }
  if (v.includes('cancel') || v.includes('reject')) {
    return { label: 'Cancelled', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', dot: '#ef4444' };
  }
  if (v.includes('pending') || v.includes('process') || v.includes('accept')) {
    return { label: 'Processing', color: '#d97706', bg: '#fffbeb', border: '#fde68a', dot: '#f59e0b' };
  }
  return { label: s || 'Confirmed', color: '#475569', bg: '#f8fafc', border: '#e2e8f0', dot: '#64748b' };
};

const fmtDate = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(d);
  }
};

const fmtAmt = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

// ── Premium Stat Card ──────────────────────────────────────────────────────────
function StatCard({ icon, label, value, subtext, accent, onClick, loading, isLive }) {
  return (
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: '18px',
        bgcolor: '#ffffff',
        border: '1px solid #e2e8f0',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        '&:hover': onClick
          ? {
              transform: 'translateY(-3px)',
              boxShadow: '0 12px 24px -6px rgba(0, 31, 63, 0.08)',
              borderColor: accent,
            }
          : {},
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '14px',
            bgcolor: `${accent}12`,
            border: `1px solid ${accent}25`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accent,
            '& svg': { fontSize: 24 },
          }}
        >
          {icon}
        </Box>

        {isLive && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.8,
              bgcolor: 'rgba(2, 132, 199, 0.08)',
              px: 1,
              py: 0.4,
              borderRadius: '20px',
            }}
          >
            <span className="pulsing-radar" />
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#0284c7' }}>
              LIVE
            </Typography>
          </Box>
        )}
      </Box>

      <Box>
        {loading ? (
          <>
            <Skeleton width="45%" height={32} />
            <Skeleton width="70%" height={18} sx={{ mt: 0.5 }} />
          </>
        ) : (
          <>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.4rem', sm: '1.65rem' },
                color: '#0f172a',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                mb: 0.4,
              }}
            >
              {value}
            </Typography>
            <Typography
              sx={{
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#64748b',
              }}
            >
              {label}
            </Typography>
            {subtext && (
              <Typography
                sx={{
                  fontSize: '0.72rem',
                  color: '#94a3b8',
                  mt: 0.3,
                  fontWeight: 500,
                }}
              >
                {subtext}
              </Typography>
            )}
          </>
        )}
      </Box>
    </Card>
  );
}

// ── Active Order Progress Stepper ─────────────────────────────────────────────
function ActiveOrderTracker({ order, onViewOrder }) {
  if (!order) return null;

  const statusStr = String(order.order_status || order.status || '').toLowerCase();
  const isCancelled = statusStr.includes('cancel');

  const steps = [
    { title: 'Order Placed', key: 'placed', done: true },
    {
      title: 'Confirmed',
      key: 'confirmed',
      done: !isCancelled,
    },
    {
      title: 'Dispatched / In Transit',
      key: 'transit',
      done: !isCancelled && (statusStr.includes('ship') || statusStr.includes('transit') || statusStr.includes('deliver') || statusStr.includes('complet')),
    },
    {
      title: 'Delivered',
      key: 'delivered',
      done: !isCancelled && (statusStr.includes('deliver') || statusStr.includes('complet')),
    },
  ];

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '20px',
        bgcolor: '#ffffff',
        border: '1px solid #e2e8f0',
        p: { xs: 2.5, sm: 3 },
        mb: 3.5,
        boxShadow: '0 4px 20px rgba(0, 31, 63, 0.04)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1.5,
          mb: 3,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.4 }}>
            <span className="pulsing-radar" />
            <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Latest Delivery Status
            </Typography>
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.05rem', sm: '1.2rem' }, color: '#0f172a' }}>
            Order #{order.order_id || order.id}
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>
            Placed on {fmtDate(order.created_at)} • Destination: {[order.city, order.state].filter(Boolean).join(', ') || 'India'}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          size="small"
          onClick={() => onViewOrder(order)}
          endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.82rem',
            color: '#001F3F',
            borderColor: 'rgba(0, 31, 63, 0.25)',
            '&:hover': {
              borderColor: '#001F3F',
              bgcolor: 'rgba(0, 31, 63, 0.04)',
            },
          }}
        >
          Track All Orders
        </Button>
      </Box>

      {/* Progress timeline bar */}
      <Box sx={{ px: { xs: 0, sm: 2 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' },
            gap: { xs: 2, sm: 1 },
            position: 'relative',
          }}
        >
          {steps.map((step, idx) => {
            const isCompleted = step.done;
            return (
              <Box
                key={step.key}
                sx={{
                  display: 'flex',
                  alignItems: { xs: 'center', sm: 'flex-start' },
                  flexDirection: { xs: 'row', sm: 'column' },
                  gap: 1.5,
                  position: 'relative',
                }}
              >
                {/* Step indicator circle */}
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    bgcolor: isCompleted ? '#001F3F' : '#f1f5f9',
                    color: isCompleted ? '#D4AF37' : '#94a3b8',
                    border: isCompleted ? '2px solid #D4AF37' : '2px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    flexShrink: 0,
                    boxShadow: isCompleted ? '0 0 10px rgba(212, 175, 55, 0.3)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {isCompleted ? <CheckIcon sx={{ fontSize: 16 }} /> : idx + 1}
                </Box>

                {/* Step label */}
                <Box>
                  <Typography
                    sx={{
                      fontSize: '0.82rem',
                      fontWeight: isCompleted ? 700 : 500,
                      color: isCompleted ? '#0f172a' : '#94a3b8',
                      lineHeight: 1.2,
                    }}
                  >
                    {step.title}
                  </Typography>
                  <Typography sx={{ fontSize: '0.68rem', color: '#64748b' }}>
                    {isCompleted ? 'Completed' : 'Pending'}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Card>
  );
}

// ── Main User Dashboard Component ─────────────────────────────────────────────
function UserDashboard() {
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

  const stats = useMemo(() => {
    if (counts) {
      return {
        total: Number(counts.total_orders || counts.totalOrders || 0),
        spent: Number(counts.total_spent || counts.totalSpent || 0),
        pending: Number(counts.pending || counts.processing || 0),
        shipped: Number(counts.shipped || counts.in_transit || 0),
        delivered: Number(counts.delivered || counts.completed || 0),
      };
    }
    return {
      total: orders.length,
      spent: orders.reduce((s, o) => s + Number(o.total_amount || o.total || 0), 0),
      pending: orders.filter((o) => String(o.status || o.order_status || '').toLowerCase().includes('pend')).length,
      shipped: orders.filter((o) => String(o.status || o.order_status || '').toLowerCase().includes('ship')).length,
      delivered: orders.filter((o) => String(o.status || o.order_status || '').toLowerCase().includes('deliver')).length,
    };
  }, [counts, orders]);

  // Find most recent active order (pending or in transit)
  const activeOrder = useMemo(() => {
    if (!orders || orders.length === 0) return null;
    return orders.find((o) => {
      const st = String(o.order_status || o.status || '').toLowerCase();
      return !st.includes('deliver') && !st.includes('cancel') && !st.includes('complet');
    }) || orders[0];
  }, [orders]);

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Box className="user-dashboard-wrapper" sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* ── 1. Luxury Hero Banner ── */}
      <Box
        className="luxury-hero-banner"
        sx={{
          borderRadius: { xs: '20px', sm: '24px' },
          p: { xs: 3, sm: 4 },
          mb: 3.5,
          color: '#ffffff',
          boxShadow: '0 20px 40px -15px rgba(0, 31, 63, 0.4)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2.5,
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* User welcome & avatar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Avatar
              sx={{
                width: { xs: 56, sm: 68 },
                height: { xs: 56, sm: 68 },
                fontSize: { xs: '1.2rem', sm: '1.45rem' },
                fontWeight: 800,
                bgcolor: '#091122',
                color: '#F5D77F',
                border: '2.5px solid #D4AF37',
                boxShadow: '0 8px 24px rgba(212, 175, 55, 0.25)',
                flexShrink: 0,
              }}
            >
              {initials}
            </Avatar>

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                <Chip
                  icon={<VerifiedIcon sx={{ fontSize: '14px !important', color: '#D4AF37 !important' }} />}
                  label="Privilege Member"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(212, 175, 55, 0.15)',
                    color: '#F5D77F',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    height: 24,
                  }}
                />
                <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.65)' }}>
                  Shree Mahaveer Collections
                </Typography>
              </Box>

              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '1.4rem', sm: '1.85rem' },
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15,
                  mb: 0.5,
                }}
              >
                {greeting}, {firstName}!
              </Typography>

              <Typography sx={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.75)' }}>
                Track active consignments, review your order invoices, and manage your luxury bags collection.
              </Typography>
            </Box>
          </Box>

          {/* Quick Hero Actions */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Button
              variant="contained"
              onClick={() => navigate('/products')}
              startIcon={<StorefrontOutlinedIcon sx={{ fontSize: 18 }} />}
              sx={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
                color: '#091122',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.85rem',
                textTransform: 'none',
                px: 2.5,
                py: 1,
                boxShadow: '0 8px 20px rgba(212, 175, 55, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #E5BA73 0%, #D4AF37 100%)',
                },
              }}
            >
              Browse Collections
            </Button>

            <Button
              variant="outlined"
              onClick={() => navigate('/user/orders')}
              endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '0.85rem',
                textTransform: 'none',
                px: 2.5,
                py: 1,
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(8px)',
                '&:hover': {
                  borderColor: '#ffffff',
                  bgcolor: 'rgba(255, 255, 255, 0.12)',
                },
              }}
            >
              Order History
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Error alert with retry */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: '14px' }}
          action={
            <Button color="inherit" size="small" onClick={loadDashboardData} startIcon={<RefreshIcon />}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* ── 2. Performance & Metric Cards Grid ── */}
      <Box sx={{ mb: 3.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', letterSpacing: '-0.01em' }}>
            Account Performance Overview
          </Typography>
          <IconButton size="small" onClick={loadDashboardData} sx={{ color: '#64748b' }}>
            <RefreshIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(5, 1fr)',
            },
            gap: 2,
          }}
        >
          <StatCard
            icon={<ShoppingBagOutlinedIcon />}
            label="Total Orders"
            value={stats.total}
            subtext="Lifetime orders"
            accent="#001F3F"
            loading={loading}
            onClick={() => navigate('/user/orders')}
          />
          <StatCard
            icon={<CurrencyRupeeIcon />}
            label="Total Investment"
            value={fmtAmt(stats.spent)}
            subtext="Net shopping spend"
            accent="#16a34a"
            loading={loading}
          />
          <StatCard
            icon={<LocalShippingOutlinedIcon />}
            label="In Transit"
            value={stats.shipped}
            subtext="Out for delivery"
            accent="#0284c7"
            isLive={stats.shipped > 0}
            loading={loading}
            onClick={() => navigate('/user/orders?status=shipped')}
          />
          <StatCard
            icon={<CheckCircleOutlinedIcon />}
            label="Delivered"
            value={stats.delivered}
            subtext="Fulfilled orders"
            accent="#10b981"
            loading={loading}
            onClick={() => navigate('/user/orders?status=delivered')}
          />
          <StatCard
            icon={<PendingActionsIcon />}
            label="Pending Processing"
            value={stats.pending}
            subtext="Awaiting packaging"
            accent="#d97706"
            loading={loading}
            onClick={() => navigate('/user/orders?status=pending')}
          />
        </Box>
      </Box>

      {/* ── 3. Active Order Progress Tracker (if applicable) ── */}
      {!loading && activeOrder && (
        <ActiveOrderTracker
          order={activeOrder}
          onViewOrder={() => navigate('/user/orders')}
        />
      )}

      {/* ── 4. Recent Orders Showcase ── */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '20px',
          bgcolor: '#ffffff',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          mb: 3.5,
          boxShadow: '0 4px 20px rgba(0, 31, 63, 0.03)',
        }}
      >
        {/* Table header */}
        <Box
          sx={{
            px: { xs: 2.5, sm: 3 },
            py: 2.25,
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
            bgcolor: '#ffffff',
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
              Recent Order Invoices
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
              Your latest purchases and shipping status
            </Typography>
          </Box>

          <Button
            size="small"
            onClick={() => navigate('/user/orders')}
            endIcon={<ArrowForwardIcon sx={{ fontSize: 15 }} />}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.82rem',
              color: '#001F3F',
              '&:hover': { bgcolor: 'rgba(0, 31, 63, 0.05)' },
            }}
          >
            View Complete History
          </Button>
        </Box>

        {/* Rows or Empty State */}
        {loading ? (
          <Box sx={{ p: 2 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  borderBottom: i < 3 ? '1px solid #f8fafc' : 'none',
                }}
              >
                <Box>
                  <Skeleton width={140} height={20} />
                  <Skeleton width={180} height={14} sx={{ mt: 0.5 }} />
                </Box>
                <Skeleton width={90} height={28} sx={{ borderRadius: '20px' }} />
              </Box>
            ))}
          </Box>
        ) : orders.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                bgcolor: '#f1f5f9',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
                color: '#94a3b8',
              }}
            >
              <ShoppingBagOutlinedIcon sx={{ fontSize: 34 }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a', mb: 0.5 }}>
              No orders found yet
            </Typography>
            <Typography sx={{ fontSize: '0.85rem', color: '#64748b', maxWidth: 360, mx: 'auto', mb: 2.5 }}>
              Discover handcrafted school bags, luxury purses, and leather wallets designed to last.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/products')}
              startIcon={<StorefrontOutlinedIcon />}
              sx={{
                bgcolor: '#001F3F',
                color: '#ffffff',
                borderRadius: '10px',
                fontWeight: 700,
                textTransform: 'none',
                px: 3,
                boxShadow: 'none',
                '&:hover': { bgcolor: '#003366' },
              }}
            >
              Start Shopping Now
            </Button>
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            {orders.map((order, idx) => {
              const meta = statusMeta(order.order_status || order.status);
              const orderId = order.order_id || `#${order.id}`;
              const isCopied = copiedId === orderId;

              return (
                <Box
                  key={orderId || idx}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 2,
                    px: { xs: 2.5, sm: 3 },
                    py: 2,
                    borderBottom: idx < orders.length - 1 ? '1px solid #f1f5f9' : 'none',
                    transition: 'background 0.15s ease',
                    '&:hover': { bgcolor: '#f8fafc' },
                  }}
                >
                  {/* Left: ID & Date */}
                  <Box sx={{ minWidth: 160 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
                      <Typography
                        sx={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          fontSize: '0.86rem',
                          color: '#0f172a',
                        }}
                      >
                        {orderId}
                      </Typography>
                      <Tooltip title={isCopied ? 'Copied!' : 'Copy Order ID'}>
                        <IconButton
                          size="small"
                          onClick={() => handleCopyId(orderId)}
                          sx={{ p: 0.3, color: isCopied ? '#16a34a' : '#94a3b8' }}
                        >
                          {isCopied ? <CheckIcon sx={{ fontSize: 14 }} /> : <ContentCopyIcon sx={{ fontSize: 13 }} />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Typography sx={{ fontSize: '0.74rem', color: '#64748b' }}>
                      Ordered on {fmtDate(order.created_at)}
                    </Typography>
                  </Box>

                  {/* Middle: Amount & Payment */}
                  <Box sx={{ minWidth: 120 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#001F3F' }}>
                      {fmtAmt(order.total_amount || order.total)}
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {order.payment_method ? `${order.payment_method}` : 'Online Gateway'}
                    </Typography>
                  </Box>

                  {/* Destination */}
                  <Box sx={{ minWidth: 140, display: { xs: 'none', md: 'block' } }}>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                      {[order.city, order.state].filter(Boolean).join(', ') || 'Delivery Address'}
                    </Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      {order.pincode ? `PIN: ${order.pincode}` : 'Standard Shipping'}
                    </Typography>
                  </Box>

                  {/* Status Pill & Details trigger */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.8,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: '24px',
                        bgcolor: meta.bg,
                        color: meta.color,
                        border: `1px solid ${meta.border}`,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                      }}
                    >
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: meta.dot,
                        }}
                      />
                      {meta.label.toUpperCase()}
                    </Box>

                    <Button
                      size="small"
                      variant="text"
                      onClick={() => navigate('/user/orders')}
                      endIcon={<ArrowOutwardIcon sx={{ fontSize: 13 }} />}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.76rem',
                        color: '#001F3F',
                        minWidth: 'auto',
                        p: '4px 8px',
                      }}
                    >
                      View
                    </Button>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Card>

      {/* ── 5. Quick Account Services Grid ── */}
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', mb: 2 }}>
          Account & Shopping Assistance
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              onClick={() => navigate('/user/profile')}
              sx={{
                p: 2.5,
                borderRadius: '16px',
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: '#001F3F',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(0, 31, 63, 0.06)',
                },
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  bgcolor: 'rgba(0, 31, 63, 0.06)',
                  color: '#001F3F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1.5,
                }}
              >
                <SecurityOutlinedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', mb: 0.3 }}>
                Profile & Security
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                Update shipping addresses, phone, and account credentials.
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              onClick={() => navigate('/wishlist')}
              sx={{
                p: 2.5,
                borderRadius: '16px',
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: '#dc2626',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(220, 38, 38, 0.08)',
                },
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  bgcolor: 'rgba(220, 38, 38, 0.06)',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1.5,
                }}
              >
                <FavoriteBorderOutlinedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', mb: 0.3 }}>
                Saved Wishlist
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                Review saved school backpacks, purses, and deals.
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              onClick={() => navigate('/contact')}
              sx={{
                p: 2.5,
                borderRadius: '16px',
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: '#0284c7',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(2, 132, 199, 0.08)',
                },
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  bgcolor: 'rgba(2, 132, 199, 0.06)',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1.5,
                }}
              >
                <ContactSupportOutlinedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', mb: 0.3 }}>
                Help & Concierge
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                Need help with shipment or exchanges? Contact our care team.
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              onClick={() => navigate('/craftsmanship')}
              sx={{
                p: 2.5,
                borderRadius: '16px',
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: '#D4AF37',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(212, 175, 55, 0.12)',
                },
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  bgcolor: 'rgba(212, 175, 55, 0.1)',
                  color: '#AA820A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1.5,
                }}
              >
                <AutoAwesomeIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', mb: 0.3 }}>
                Quality Guarantee
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                100% authentic materials and handcrafted precision.
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default UserDashboard;
