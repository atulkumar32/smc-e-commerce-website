import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Typography, Button, Stack, Alert,
  TextField, InputAdornment, Skeleton, Pagination,
  Card, Chip, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, Divider, Avatar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { isUserAuthenticated } from '../../../services/apiClients';
import { fetchUserOrdersList } from '../../../Actions/Users/FetchUserOrderAction';
import { MEDIA_BASE } from '../../../Config/UrlsConfig';
import ReviewsModal from '../../product/ProductDetail/Components/ReviewsModal';

import './style.scss';

// ── Helpers ───────────────────────────────────────────────────────────────────
const statusMeta = (s = '') => {
  const v = String(s).toLowerCase();
  if (v.includes('deliver') || v.includes('complet')) {
    return { label: 'Delivered', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', dot: '#22c55e', step: 4 };
  }
  if (v.includes('ship') || v.includes('transit')) {
    return { label: 'In Transit', color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd', dot: '#0ea5e9', step: 3 };
  }
  if (v.includes('cancel') || v.includes('reject')) {
    return { label: 'Cancelled', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', dot: '#ef4444', step: 0 };
  }
  if (v.includes('pack') || v.includes('process')) {
    return { label: 'Processing', color: '#d97706', bg: '#fffbeb', border: '#fde68a', dot: '#f59e0b', step: 2 };
  }
  return { label: s || 'Confirmed', color: '#475569', bg: '#f8fafc', border: '#e2e8f0', dot: '#64748b', step: 1 };
};

const fmtDate = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(d);
  }
};

const fmtAmt = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

const parseOrderItems = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

// ── Delivery Stepper Component ────────────────────────────────────────────────
function DeliveryMiniStepper({ currentStep, isCancelled }) {
  if (isCancelled) {
    return (
      <Box sx={{ py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          label="Order Cancelled"
          size="small"
          sx={{
            bgcolor: '#fef2f2',
            color: '#dc2626',
            fontWeight: 700,
            border: '1px solid #fecaca',
          }}
        />
        <Typography sx={{ fontSize: '0.74rem', color: '#94a3b8' }}>
          This order has been cancelled and is not in transit.
        </Typography>
      </Box>
    );
  }

  const steps = [
    { label: 'Order Placed', stepNum: 1 },
    { label: 'Processing', stepNum: 2 },
    { label: 'In Transit', stepNum: 3 },
    { label: 'Delivered', stepNum: 4 },
  ];

  return (
    <Box sx={{ py: 1.5, px: { xs: 0, sm: 1 } }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          position: 'relative',
          gap: 1,
        }}
      >
        {steps.map((st, i) => {
          const isCompleted = currentStep >= st.stepNum;
          const isCurrent = currentStep === st.stepNum;

          return (
            <Box
              key={st.stepNum}
              className={`order-timeline-step ${isCompleted ? 'is-completed' : ''} ${isCurrent ? 'is-active' : ''}`}
              sx={{ textAlign: 'center' }}
            >
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: isCompleted ? '#001F3F' : '#f1f5f9',
                  color: isCompleted ? '#D4AF37' : '#94a3b8',
                  border: isCompleted ? '2px solid #D4AF37' : '2px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  mx: 'auto',
                  mb: 0.8,
                  position: 'relative',
                  zIndex: 2,
                  boxShadow: isCompleted ? '0 0 8px rgba(212, 175, 55, 0.25)' : 'none',
                }}
              >
                {isCompleted ? <CheckIcon sx={{ fontSize: 14 }} /> : st.stepNum}
              </Box>

              <Typography
                sx={{
                  fontSize: { xs: '0.66rem', sm: '0.74rem' },
                  fontWeight: isCompleted ? 700 : 500,
                  color: isCompleted ? '#0f172a' : '#94a3b8',
                  lineHeight: 1.15,
                }}
              >
                {st.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// ── Order Item Card ───────────────────────────────────────────────────────────
function OrderCard({ order, onOpenDetails, onOpenReview }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const status = order.order_status || order.status || 'pending';
  const meta = statusMeta(status);
  const isCancelled = meta.label === 'Cancelled';
  const isDelivered = meta.label === 'Delivered' ||
    String(status).toLowerCase().includes('deliver') ||
    String(status).toLowerCase().includes('complet');
  const orderId = order.order_id || `#${order.id}`;
  const amount = order.total_amount || order.total || 0;
  const items = parseOrderItems(order.items);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card
      elevation={0}
      className="order-luxury-card"
      sx={{
        borderRadius: '18px',
        border: '1px solid #e2e8f0',
        bgcolor: '#ffffff',
        overflow: 'hidden',
        mb: 2.5,
      }}
    >
      {/* ── Card Header ── */}
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          bgcolor: '#f8fafc',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography
            sx={{
              fontFamily: 'monospace',
              fontWeight: 800,
              fontSize: '0.92rem',
              color: '#0f172a',
              letterSpacing: '0.02em',
            }}
          >
            {orderId}
          </Typography>

          <Tooltip title={copied ? 'Copied to clipboard!' : 'Copy Order ID'}>
            <IconButton
              size="small"
              onClick={handleCopy}
              sx={{
                p: 0.4,
                color: copied ? '#16a34a' : '#94a3b8',
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
              }}
            >
              {copied ? <CheckIcon sx={{ fontSize: 13 }} /> : <ContentCopyIcon sx={{ fontSize: 13 }} />}
            </IconButton>
          </Tooltip>

          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.8,
              px: 1.25,
              py: 0.35,
              borderRadius: '20px',
              bgcolor: meta.bg,
              color: meta.color,
              border: `1px solid ${meta.border}`,
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}
          >
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: meta.dot }} />
            {meta.label.toUpperCase()}
          </Box>
        </Box>

        <Typography sx={{ fontSize: '0.76rem', color: '#64748b' }}>
          Ordered: {fmtDate(order.created_at)}
        </Typography>
      </Box>

      {/* ── Card Body ── */}
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Delivery Progress Bar */}
        <Box sx={{ mb: 2.5, pb: 2, borderBottom: '1px solid #f1f5f9' }}>
          <DeliveryMiniStepper currentStep={meta.step} isCancelled={isCancelled} />
        </Box>

        {/* Middle Section: Items and Destination */}
        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
          }}
        >
          {/* Left: Product preview or Order description */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {items.length > 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Box
                  sx={{
                    width: 54,
                    height: 54,
                    borderRadius: '12px',
                    bgcolor: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  {items[0].image ? (
                    <img
                      src={items[0].image.startsWith('http') ? items[0].image : `${MEDIA_BASE}${items[0].image}`}
                      alt={items[0].name || 'Product'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <ShoppingBagOutlinedIcon sx={{ color: '#94a3b8', fontSize: 24 }} />
                  )}
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      color: '#0f172a',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: { xs: 240, sm: 320 },
                    }}
                  >
                    {items[0].name || 'Custom Bag Consignment'}
                  </Typography>
                  <Typography sx={{ fontSize: '0.74rem', color: '#64748b' }}>
                    Qty: {items[0].quantity || 1}
                    {items.length > 1 ? ` • +${items.length - 1} more item(s)` : ''}
                    {items[0].selectedColor ? ` • Color: ${items[0].selectedColor}` : ''}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '10px',
                    bgcolor: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b',
                    flexShrink: 0,
                  }}
                >
                  <ShoppingBagOutlinedIcon sx={{ fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.86rem', color: '#0f172a' }}>
                    Shree Mahaveer Collections Consignment
                  </Typography>
                  <Typography sx={{ fontSize: '0.74rem', color: '#64748b' }}>
                    Authentic handcrafted bags package
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Shipping Destination Pill */}
            {(order.city || order.shipping_address || order.address) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 1.5 }}>
                <LocationOnOutlinedIcon sx={{ fontSize: 15, color: '#94a3b8' }} />
                <Typography sx={{ fontSize: '0.75rem', color: '#475569' }}>
                  Shipping to: {[order.city, order.state].filter(Boolean).join(', ') || order.shipping_address || order.address}
                  {order.pincode ? ` (${order.pincode})` : ''}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Right: Total Price and Actions */}
          <Box
            sx={{
              display: 'flex',
              alignItems: { xs: 'flex-start', sm: 'flex-end' },
              flexDirection: 'column',
              gap: 1,
              minWidth: { sm: 180 },
              pt: { xs: 1, md: 0 },
            }}
          >
            <Box sx={{ textAlign: { sm: 'right' } }}>
              <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Order Value
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#001F3F', lineHeight: 1.1 }}>
                {fmtAmt(amount)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.4, justifyContent: { sm: 'flex-end' } }}>
                <PaymentOutlinedIcon sx={{ fontSize: 13, color: '#94a3b8' }} />
                <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                  {order.payment_method || 'Online'}
                </Typography>
                {order.payment_status && (
                  <Chip
                    label={order.payment_status.toUpperCase()}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      bgcolor: order.payment_status === 'completed' || order.payment_status === 'paid' ? '#dcfce7' : '#fef3c7',
                      color: order.payment_status === 'completed' || order.payment_status === 'paid' ? '#16a34a' : '#d97706',
                    }}
                  />
                )}
              </Box>
            </Box>

            <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap', gap: 1 }}>
              {isDelivered && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={
                    <svg viewBox="0 0 24 24" fill="#D4AF37" width="15" height="15" style={{ display: 'block' }}>
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenReview?.(order);
                  }}
                  sx={{
                    bgcolor: '#091122',
                    color: '#ffffff',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    textTransform: 'none',
                    border: '1px solid rgba(212, 175, 55, 0.5)',
                    px: 1.8,
                    boxShadow: '0 2px 8px rgba(0, 31, 63, 0.15)',
                    '&:hover': {
                      bgcolor: '#001F3F',
                      borderColor: '#D4AF37',
                      boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
                    },
                  }}
                >
                  Write Review
                </Button>
              )}

              <Button
                variant="contained"
                size="small"
                onClick={() => onOpenDetails(order)}
                sx={{
                  bgcolor: '#001F3F',
                  color: '#ffffff',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  textTransform: 'none',
                  px: 2,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#003366' },
                }}
              >
                View Invoice Details
              </Button>

              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/products')}
                sx={{
                  color: '#475569',
                  borderColor: '#cbd5e1',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  textTransform: 'none',
                  '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
                }}
              >
                Buy Again
              </Button>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}

// ── Order Details & Invoice Modal ─────────────────────────────────────────────
function OrderDetailsModal({ order, open, onClose, onOpenReview }) {
  if (!order) return null;

  const orderId = order.order_id || `#${order.id}`;
  const amount = Number(order.total_amount || order.total || 0);
  const subtotal = Number(order.subtotal || amount * 0.92);
  const tax = Number(order.tax || amount * 0.08);
  const shippingCost = Number(order.shipping_cost || 0);
  const items = parseOrderItems(order.items);
  const meta = statusMeta(order.order_status || order.status);
  const isDelivered = meta.label === 'Delivered' ||
    String(order.order_status || order.status || '').toLowerCase().includes('deliver') ||
    String(order.order_status || order.status || '').toLowerCase().includes('complet');

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
        className="no-print"
        sx={{
          p: 2.5,
          bgcolor: '#091122',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.01em' }}>
            Consignment Invoice & Details
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#D4AF37', fontWeight: 600 }}>
            Shree Mahaveer Collections • {orderId}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: '#ffffff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent className="printable-invoice" sx={{ p: { xs: 2.5, sm: 3.5 } }}>
        {/* Invoice Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#001F3F' }}>
              SHREE MAHAVEER COLLECTIONS
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>
              Premium School Bags, Purses & Wallets
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', mt: 0.5 }}>
              GSTIN: 08ABCDE1234F1Z5 • Care: support@shreemahaveer.com
            </Typography>
          </Box>

          <Box sx={{ textAlign: { sm: 'right' } }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
              Invoice: {orderId}
            </Typography>
            <Typography sx={{ fontSize: '0.76rem', color: '#64748b' }}>
              Date: {fmtDate(order.created_at)}
            </Typography>
            <Chip
              label={meta.label.toUpperCase()}
              size="small"
              sx={{
                mt: 0.8,
                bgcolor: meta.bg,
                color: meta.color,
                border: `1px solid ${meta.border}`,
                fontWeight: 700,
                fontSize: '0.7rem',
              }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2.5 }} />

        {/* Customer & Shipping Details */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 3,
            mb: 3,
            p: 2,
            borderRadius: '12px',
            bgcolor: '#f8fafc',
            border: '1px solid #e2e8f0',
          }}
        >
          <Box>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', mb: 0.8 }}>
              Delivery Destination
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
              {order.customer_name || 'Customer Name'}
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#475569', mt: 0.3 }}>
              {order.shipping_address || order.address || 'Address on file'}
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#475569' }}>
              {[order.city, order.state].filter(Boolean).join(', ')} {order.pincode ? `- ${order.pincode}` : ''}
            </Typography>
            {order.phone && (
              <Typography sx={{ fontSize: '0.78rem', color: '#64748b', mt: 0.5 }}>
                Phone: {order.phone}
              </Typography>
            )}
          </Box>

          <Box>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', mb: 0.8 }}>
              Payment Information
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
              Method: {order.payment_method || 'Online Payment Gateway'}
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#475569', mt: 0.3 }}>
              Transaction Status:{' '}
              <span style={{ fontWeight: 700, color: order.payment_status === 'completed' || order.payment_status === 'paid' ? '#16a34a' : '#d97706' }}>
                {(order.payment_status || 'Pending').toUpperCase()}
              </span>
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: '#64748b', mt: 0.5 }}>
              Currency: INR (₹)
            </Typography>
          </Box>
        </Box>

        {/* Itemized Table */}
        <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a', mb: 1.5 }}>
          Ordered Items
        </Typography>

        <Box sx={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', mb: 3 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '3fr 1fr 1fr 1fr',
              p: 1.5,
              bgcolor: '#f1f5f9',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#475569',
            }}
          >
            <Box>Item Description</Box>
            <Box sx={{ textAlign: 'center' }}>Qty</Box>
            <Box sx={{ textAlign: 'right' }}>Unit Price</Box>
            <Box sx={{ textAlign: 'right' }}>Total</Box>
          </Box>

          {items.length > 0 ? (
            items.map((item, i) => {
              const qty = Number(item.quantity || 1);
              const price = Number(item.price || 0);
              const lineTotal = qty * price;

              return (
                <Box
                  key={i}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '3fr 1fr 1fr 1fr',
                    p: 1.5,
                    borderTop: '1px solid #f1f5f9',
                    fontSize: '0.82rem',
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{ pr: 1 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.84rem', color: '#0f172a' }}>
                      {item.name || 'Bag Item'}
                    </Typography>
                    {(item.selectedColor || item.selectedSize) && (
                      <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        {[item.selectedColor && `Color: ${item.selectedColor}`, item.selectedSize && `Size: ${item.selectedSize}`].filter(Boolean).join(' • ')}
                      </Typography>
                    )}
                    {isDelivered && (
                      <Button
                        size="small"
                        startIcon={
                          <svg viewBox="0 0 24 24" fill="#D4AF37" width="13" height="13" style={{ display: 'block' }}>
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        }
                        onClick={() => onOpenReview?.(order, item)}
                        sx={{
                          mt: 0.6,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: '#001F3F',
                          bgcolor: 'rgba(212, 175, 55, 0.1)',
                          border: '1px solid rgba(212, 175, 55, 0.45)',
                          borderRadius: '6px',
                          textTransform: 'none',
                          py: 0.2,
                          px: 1,
                          '&:hover': { bgcolor: 'rgba(212, 175, 55, 0.2)', borderColor: '#D4AF37' },
                        }}
                      >
                        Write Review
                      </Button>
                    )}
                  </Box>
                  <Box sx={{ textAlign: 'center', color: '#475569' }}>{qty}</Box>
                  <Box sx={{ textAlign: 'right', color: '#475569' }}>{fmtAmt(price)}</Box>
                  <Box sx={{ textAlign: 'right', fontWeight: 700, color: '#001F3F' }}>
                    {fmtAmt(lineTotal || price)}
                  </Box>
                </Box>
              );
            })
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '3fr 1fr 1fr 1fr',
                p: 1.5,
                fontSize: '0.82rem',
                alignItems: 'center',
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: '0.84rem', color: '#0f172a' }}>
                  Handcrafted Bag Consignment Package
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>1</Box>
              <Box sx={{ textAlign: 'right' }}>{fmtAmt(amount)}</Box>
              <Box sx={{ textAlign: 'right', fontWeight: 700, color: '#001F3F' }}>{fmtAmt(amount)}</Box>
            </Box>
          )}
        </Box>

        {/* Pricing Summary */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Box sx={{ width: { xs: '100%', sm: 280 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
              <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>Subtotal</Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#0f172a', fontWeight: 600 }}>{fmtAmt(subtotal)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
              <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>Estimated Tax (GST)</Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#0f172a', fontWeight: 600 }}>{fmtAmt(tax)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>Delivery & Handling</Typography>
              <Typography sx={{ fontSize: '0.8rem', color: shippingCost === 0 ? '#16a34a' : '#0f172a', fontWeight: 600 }}>
                {shippingCost === 0 ? 'FREE' : fmtAmt(shippingCost)}
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#001F3F' }}>Net Total</Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#001F3F' }}>{fmtAmt(amount)}</Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions className="no-print" sx={{ p: 2.5, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', gap: 1, flexWrap: 'wrap' }}>
        {isDelivered && (
          <Button
            onClick={() => onOpenReview?.(order)}
            startIcon={
              <svg viewBox="0 0 24 24" fill="#D4AF37" width="16" height="16" style={{ display: 'block' }}>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            }
            sx={{
              bgcolor: '#091122',
              color: '#ffffff',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: '8px',
              border: '1px solid rgba(212, 175, 55, 0.45)',
              px: 2,
              '&:hover': { bgcolor: '#001F3F', borderColor: '#D4AF37' },
            }}
          >
            Write Product Review
          </Button>
        )}
        <Button
          onClick={handlePrint}
          startIcon={<PrintOutlinedIcon />}
          sx={{
            color: '#001F3F',
            fontWeight: 700,
            textTransform: 'none',
            borderRadius: '8px',
          }}
        >
          Print Invoice
        </Button>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            bgcolor: '#001F3F',
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 700,
            px: 3,
            '&:hover': { bgcolor: '#003366' },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Main Orders Page Component ────────────────────────────────────────────────
function UserOrders() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState(() => searchParams.get('status') || 'all');
  const [detailsModal, setDetailsModal] = useState({ open: false, order: null });
  const [reviewTarget, setReviewTarget] = useState(null);

  const handleOpenReview = (order, item = null) => {
    const items = parseOrderItems(order?.items);
    const targetItem = item || items[0] || {};
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
  };

  const LIMIT = 10;

  const loadOrders = useCallback(async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const { orders: list, total_records, summary: sum } = await fetchUserOrdersList({ page: p, limit: LIMIT });
      setOrders(list);
      setTotalRecords(total_records);
      if (sum) setSummary(sum);
    } catch (err) {
      setError(err.message || 'Unable to retrieve your orders. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isUserAuthenticated()) {
      navigate('/login', { replace: true });
      return;
    }
    loadOrders(1);
  }, [navigate, loadOrders]);

  const handlePageChange = (_, p) => {
    setPage(p);
    loadOrders(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Status Tab Counts - Uses API summary when provided or computes fallback
  const countsByTab = useMemo(() => {
    if (summary) {
      return {
        all: Number(summary.all_orders ?? orders.length),
        pending: Number(summary.processing ?? 0),
        shipped: Number(summary.in_transit ?? 0),
        delivered: Number(summary.delivered ?? 0),
        cancelled: Number(summary.cancelled ?? 0),
      };
    }
    const res = { all: orders.length, pending: 0, shipped: 0, delivered: 0, cancelled: 0 };
    orders.forEach((o) => {
      const s = String(o.order_status || o.status || '').toLowerCase();
      if (s.includes('deliver') || s.includes('complet')) res.delivered++;
      else if (s.includes('ship') || s.includes('transit') || s.includes('dispat')) res.shipped++;
      else if (s.includes('cancel') || s.includes('reject')) res.cancelled++;
      else res.pending++;
    });
    return res;
  }, [orders, summary]);

  // Sync search state from URL query
  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null) {
      setSearch(q);
    }
    const st = searchParams.get('status');
    if (st) {
      setActiveTab(st);
    }
  }, [searchParams]);

  // Filtered orders by Search and Tab
  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const s = String(o.order_status || o.status || '').toLowerCase();
      const id = String(o.order_id || o.id || '').toLowerCase();
      const city = String(o.city || o.shipping_address || '').toLowerCase();

      // Tab match
      if (activeTab === 'pending' && !(s.includes('pend') || s.includes('process') || s.includes('accept') || s.includes('confirm') || s.includes('approv'))) return false;
      if (activeTab === 'shipped' && !(s.includes('ship') || s.includes('transit') || s.includes('dispat'))) return false;
      if (activeTab === 'delivered' && !(s.includes('deliver') || s.includes('complet'))) return false;
      if (activeTab === 'cancelled' && !(s.includes('cancel') || s.includes('reject'))) return false;

      // Search match
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        return id.includes(query) || s.includes(query) || city.includes(query);
      }
      return true;
    });
  }, [orders, activeTab, search]);

  const totalPages = Math.ceil(totalRecords / LIMIT);

  return (
    <Box className="orders-page-wrapper" sx={{ maxWidth: 1100, mx: 'auto' }}>
      {/* ── 1. Modern Page Header ── */}
      <Box
        sx={{
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #001F3F 0%, #001328 100%)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          p: { xs: 2.5, sm: 3 },
          mb: 3,
          color: '#ffffff',
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          boxShadow: '0 8px 30px rgba(0, 31, 63, 0.18)',
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <ShoppingBagOutlinedIcon sx={{ color: '#D4AF37', fontSize: 18 }} />
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#D4AF37', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Consignment & Shipment History
            </Typography>
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.25rem', sm: '1.45rem' }, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            My Orders & Invoices
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.72)', mt: 0.4 }}>
            {totalRecords > 0 ? `${totalRecords} total orders recorded • Track dispatches & download tax invoices` : 'Manage your recent bag orders, tracking milestones, and consignment receipts.'}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
            onClick={() => loadOrders(page)}
            disabled={loading}
            sx={{
              color: '#ffffff',
              borderColor: 'rgba(255, 255, 255, 0.25)',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.8rem',
              textTransform: 'none',
              px: 1.75,
              py: 0.75,
              '&:hover': { borderColor: '#D4AF37', bgcolor: 'rgba(212, 175, 55, 0.08)' },
            }}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            size="small"
            startIcon={<StorefrontOutlinedIcon sx={{ fontSize: 16 }} />}
            onClick={() => navigate('/products')}
            sx={{
              bgcolor: '#D4AF37',
              color: '#001530',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.8rem',
              textTransform: 'none',
              px: 2,
              py: 0.75,
              boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
              '&:hover': { bgcolor: '#F5D77F' },
            }}
          >
            Explore Bags
          </Button>
        </Stack>
      </Box>

      {/* ── 2. Status Filter Tabs & Search Bar ── */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
          p: 2,
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center' }}>
          {/* Status Tabs */}
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              overflowX: 'auto',
              width: { xs: '100%', md: 'auto' },
              pb: { xs: 1, md: 0 },
            }}
          >
            {[
              { key: 'all', label: 'All Orders', count: countsByTab.all },
              { key: 'pending', label: 'Processing', count: countsByTab.pending },
              { key: 'shipped', label: 'In Transit', count: countsByTab.shipped },
              { key: 'delivered', label: 'Delivered', count: countsByTab.delivered },
              { key: 'cancelled', label: 'Cancelled', count: countsByTab.cancelled },
            ].map((tab) => {
              const isSelected = activeTab === tab.key;
              return (
                <Button
                  key={tab.key}
                  size="small"
                  onClick={() => setActiveTab(tab.key)}
                  sx={{
                    borderRadius: '20px',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    px: 1.75,
                    py: 0.6,
                    whiteSpace: 'nowrap',
                    bgcolor: isSelected ? '#001F3F' : '#f8fafc',
                    color: isSelected ? '#ffffff' : '#64748b',
                    border: isSelected ? '1px solid #001F3F' : '1px solid #e2e8f0',
                    '&:hover': {
                      bgcolor: isSelected ? '#001F3F' : '#f1f5f9',
                      color: isSelected ? '#ffffff' : '#0f172a',
                    },
                  }}
                >
                  {tab.label}
                  <Box
                    component="span"
                    sx={{
                      ml: 0.8,
                      px: 0.7,
                      py: 0.1,
                      borderRadius: '10px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      bgcolor: isSelected ? 'rgba(255, 255, 255, 0.2)' : '#e2e8f0',
                      color: isSelected ? '#ffffff' : '#475569',
                    }}
                  >
                    {tab.count}
                  </Box>
                </Button>
              );
            })}
          </Box>

          {/* Search box */}
          <Box sx={{ flex: 1, width: { xs: '100%', md: 'auto' } }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by Order ID, City, or Status…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearch('')}>
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: '#f8fafc',
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#cbd5e1' },
                },
              }}
            />
          </Box>
        </Box>
      </Card>

      {/* Error alert */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2.5, borderRadius: '12px' }}
          action={
            <Button color="inherit" size="small" onClick={() => loadOrders(page)} startIcon={<RefreshIcon />}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* ── 3. Orders List ── */}
      <Box>
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card
              key={i}
              elevation={0}
              sx={{ p: 3, borderRadius: '18px', border: '1px solid #e2e8f0', bgcolor: '#ffffff', mb: 2.5 }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Skeleton width={160} height={24} />
                <Skeleton width={90} height={24} sx={{ borderRadius: '12px' }} />
              </Box>
              <Skeleton width="100%" height={32} sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Skeleton width={200} height={20} />
                <Skeleton width={120} height={36} sx={{ borderRadius: '10px' }} />
              </Box>
            </Card>
          ))
        ) : filtered.length === 0 ? (
          <Card
            elevation={0}
            sx={{
              p: { xs: 4, sm: 6 },
              borderRadius: '20px',
              border: '2px dashed #cbd5e1',
              bgcolor: '#ffffff',
              textAlign: 'center',
            }}
          >
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
              <ShoppingBagOutlinedIcon sx={{ fontSize: 36 }} />
            </Box>

            <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', mb: 0.5 }}>
              {search || activeTab !== 'all' ? 'No orders match your filter' : 'You haven’t placed any orders yet'}
            </Typography>

            <Typography sx={{ fontSize: '0.85rem', color: '#64748b', maxWidth: 400, mx: 'auto', mb: 2.5 }}>
              {search || activeTab !== 'all'
                ? 'Try searching with another keyword or reset the status filters to view all orders.'
                : 'Explore our premium collection of school backpacks, stylish purses, and handcrafted wallets.'}
            </Typography>

            {search || activeTab !== 'all' ? (
              <Button
                variant="outlined"
                onClick={() => { setSearch(''); setActiveTab('all'); }}
                sx={{
                  color: '#001F3F',
                  borderColor: '#001F3F',
                  borderRadius: '10px',
                  fontWeight: 700,
                  textTransform: 'none',
                  px: 2.5,
                }}
              >
                Reset Filters
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={() => navigate('/products')}
                startIcon={<StorefrontOutlinedIcon />}
                sx={{
                  bgcolor: '#001F3F',
                  borderRadius: '10px',
                  fontWeight: 700,
                  textTransform: 'none',
                  px: 3,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#003366' },
                }}
              >
                Browse Bag Collections
              </Button>
            )}
          </Card>
        ) : (
          filtered.map((order) => (
            <OrderCard
              key={order.order_id || order.id}
              order={order}
              onOpenDetails={(o) => setDetailsModal({ open: true, order: o })}
              onOpenReview={handleOpenReview}
            />
          ))
        )}
      </Box>

      {/* ── 4. Pagination ── */}
      {!loading && totalPages > 1 && !search && activeTab === 'all' && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="medium"
            showFirstButton
            showLastButton
            sx={{
              '& .MuiPaginationItem-root': {
                fontWeight: 700,
                borderRadius: '8px',
              },
            }}
          />
        </Box>
      )}

      {/* ── 5. Invoice & Details Modal ── */}
      <OrderDetailsModal
        order={detailsModal.order}
        open={detailsModal.open}
        onClose={() => setDetailsModal({ open: false, order: null })}
        onOpenReview={handleOpenReview}
      />

      {/* ── 6. Write Review Modal (Same as Product Detail page) ── */}
      {reviewTarget && (
        <ReviewsModal
          productId={reviewTarget.productId}
          totalReviews={0}
          avgRating={0}
          mode="write"
          onClose={() => setReviewTarget(null)}
        />
      )}
    </Box>
  );
}

export default UserOrders;
