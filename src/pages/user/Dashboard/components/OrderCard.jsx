import { useState } from 'react';
import { Box, Typography, Button, IconButton, Tooltip } from '@mui/material';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { MEDIA_BASE } from '../../../../Config/UrlsConfig';

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

const statusMeta = (s = '') => {
  const v = String(s).toLowerCase();
  if (v.includes('deliver') || v.includes('complet')) {
    return { label: 'Delivered', bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', dot: '#22c55e' };
  }
  if (v.includes('ship') || v.includes('transit')) {
    return { label: 'In Transit', bg: '#f0f9ff', color: '#0284c7', border: '#bae6fd', dot: '#0ea5e9' };
  }
  if (v.includes('cancel') || v.includes('reject')) {
    return { label: 'Cancelled', bg: '#fef2f2', color: '#dc2626', border: '#fecaca', dot: '#ef4444' };
  }
  if (v.includes('pack')) {
    return { label: 'Packed', bg: '#fffbeb', color: '#d97706', border: '#fde68a', dot: '#f59e0b' };
  }
  if (v.includes('pending') || v.includes('process') || v.includes('accept')) {
    return { label: 'Processing', bg: '#fffbeb', color: '#d97706', border: '#fde68a', dot: '#f59e0b' };
  }
  return { label: s || 'Confirmed', bg: '#f8fafc', color: '#475569', border: '#e2e8f0', dot: '#64748b' };
};

function resolveImg(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const normalized = path.replace(/^\/+/, '');
  return `${MEDIA_BASE}${normalized}`;
}

export default function OrderCard({ order, onView, onReview }) {
  const [copied, setCopied] = useState(false);

  const orderId = order.order_id || (order.id ? `#${order.id}` : 'ORD-SMC');
  const meta = statusMeta(order.order_status || order.status);
  const isDelivered = meta.label === 'Delivered' ||
    String(order.order_status || order.status || '').toLowerCase().includes('deliver') ||
    String(order.order_status || order.status || '').toLowerCase().includes('complet');
  const items = Array.isArray(order.items)
    ? order.items
    : typeof order.items === 'string'
      ? (() => { try { return JSON.parse(order.items); } catch { return []; } })()
      : [];

  const firstItem = items[0] || {};
  const itemCount = items.length || order.total_items || 1;
  const productImg = resolveImg(order.product_image || firstItem.image || firstItem.product_image);
  const productName = order.product_name || firstItem.name || firstItem.product_name || 'Bespoke Bag Consignment';

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="ud-order-card" onClick={() => onView?.(order)}>
      {/* 1. Thumbnail & Product Info */}
      <div className="ud-order-card__product">
        <div className="ud-order-card__thumb">
          {productImg ? (
            <img src={productImg} alt={productName} loading="lazy" />
          ) : (
            <div className="ud-order-card__thumb-placeholder">
              <ShoppingBagOutlinedIcon />
            </div>
          )}
          {itemCount > 1 && (
            <span className="ud-order-card__item-badge">+{itemCount - 1}</span>
          )}
        </div>

        <div className="ud-order-card__product-info">
          <div className="ud-order-card__id-row">
            <span className="ud-order-card__id">{orderId}</span>
            <Tooltip title={copied ? 'Copied!' : 'Copy Order ID'} arrow>
              <IconButton size="small" onClick={handleCopy} className="ud-order-card__copy-btn">
                {copied ? <CheckOutlinedIcon sx={{ fontSize: 13, color: '#16a34a' }} /> : <ContentCopyOutlinedIcon sx={{ fontSize: 13 }} />}
              </IconButton>
            </Tooltip>
          </div>
          <h4 className="ud-order-card__name" title={productName}>
            {productName}
          </h4>
          <span className="ud-order-card__date">Ordered on {fmtDate(order.created_at)}</span>
        </div>
      </div>

      {/* 2. Amount & Payment */}
      <div className="ud-order-card__price-box">
        <span className="ud-order-card__amount">
          {fmtAmt(order.total_amount || order.total)}
        </span>
        <span className="ud-order-card__payment-method">
          {order.payment_method ? `Via ${order.payment_method}` : 'Online Payment'}
        </span>
      </div>

      {/* 3. Status Badge */}
      <div className="ud-order-card__status-box">
        <span
          className="ud-order-card__status-chip"
          style={{
            backgroundColor: meta.bg,
            color: meta.color,
            borderColor: meta.border,
          }}
        >
          <span className="ud-order-card__status-dot" style={{ backgroundColor: meta.dot }} />
          {meta.label}
        </span>
      </div>

      {/* 4. Action */}
      <div className="ud-order-card__action-box" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {isDelivered && onReview && (
          <Button
            variant="contained"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onReview?.(order);
            }}
            startIcon={
              <svg viewBox="0 0 24 24" fill="#D4AF37" width="13" height="13" style={{ display: 'block' }}>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            }
            sx={{
              bgcolor: '#091122',
              color: '#ffffff',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.74rem',
              textTransform: 'none',
              border: '1px solid rgba(212, 175, 55, 0.45)',
              px: 1.2,
              py: 0.4,
              whiteSpace: 'nowrap',
              '&:hover': { bgcolor: '#001F3F', borderColor: '#D4AF37' },
            }}
          >
            Write Review
          </Button>
        )}
        <Button
          variant="outlined"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onView?.(order);
          }}
          endIcon={<ArrowForwardOutlinedIcon sx={{ fontSize: 14 }} />}
          className="ud-order-card__view-btn"
        >
          View Details
        </Button>
      </div>
    </div>
  );
}

