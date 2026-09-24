import { Card, Box, Typography, Button } from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CheckIcon from '@mui/icons-material/Check';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';

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

export default function OrderTracking({ order, onViewOrder }) {
  if (!order) return null;

  const orderId = order.order_id || (order.id ? `#${order.id}` : 'ORD-SMC');
  const statusStr = String(order.order_status || order.status || '').toLowerCase();
  const isCancelled = statusStr.includes('cancel') || statusStr.includes('reject');

  // Milestone definition mapping actual API order lifecycle
  const steps = [
    {
      id: 'placed',
      label: 'Order Placed',
      desc: fmtDate(order.created_at),
      done: true,
      current: !isCancelled && !statusStr.includes('confirm') && !statusStr.includes('pack') && !statusStr.includes('ship') && !statusStr.includes('transit') && !statusStr.includes('deliver'),
    },
    {
      id: 'confirmed',
      label: 'Confirmed',
      desc: 'Order verified',
      done: !isCancelled && (statusStr.includes('confirm') || statusStr.includes('accept') || statusStr.includes('pack') || statusStr.includes('ship') || statusStr.includes('transit') || statusStr.includes('deliver') || statusStr.includes('complet')),
      current: !isCancelled && (statusStr.includes('confirm') || statusStr.includes('accept')),
    },
    {
      id: 'packed',
      label: 'Packed',
      desc: 'White-glove care',
      done: !isCancelled && (statusStr.includes('pack') || statusStr.includes('ship') || statusStr.includes('transit') || statusStr.includes('deliver') || statusStr.includes('complet')),
      current: !isCancelled && statusStr.includes('pack'),
    },
    {
      id: 'shipped',
      label: 'Shipped',
      desc: order.tracking_id ? `AWB: ${order.tracking_id}` : 'In Transit',
      done: !isCancelled && (statusStr.includes('ship') || statusStr.includes('transit') || statusStr.includes('deliver') || statusStr.includes('complet')),
      current: !isCancelled && (statusStr.includes('ship') || statusStr.includes('transit')),
    },
    {
      id: 'out_for_delivery',
      label: 'Out for Delivery',
      desc: 'Courier on the way',
      done: !isCancelled && statusStr.includes('deliver') && !statusStr.includes('complet'),
      current: !isCancelled && statusStr.includes('out'),
    },
    {
      id: 'delivered',
      label: 'Delivered',
      desc: 'Package handed over',
      done: !isCancelled && (statusStr.includes('deliver') || statusStr.includes('complet')),
      current: !isCancelled && (statusStr.includes('deliver') || statusStr.includes('complet')),
    },
  ];

  return (
    <Card elevation={0} className="ud-tracking-card">
      <div className="ud-tracking-card__header">
        <div className="ud-tracking-card__header-left">
          <div className="ud-tracking-card__pulse-badge">
            <span className="ud-tracking-card__radar" />
            <span className="ud-tracking-card__pulse-label">
              {isCancelled ? 'Order Cancelled' : 'Active Delivery Progress'}
            </span>
          </div>

          <h3 className="ud-tracking-card__title">
            Order <span className="ud-tracking-card__id">{orderId}</span>
          </h3>

          <p className="ud-tracking-card__meta">
            Placed on {fmtDate(order.created_at)} &bull; Total: <strong>{fmtAmt(order.total_amount || order.total)}</strong> &bull; Delivering to: {[order.city, order.state].filter(Boolean).join(', ') || 'Your Address'}
          </p>
        </div>

        <Button
          variant="outlined"
          onClick={() => onViewOrder?.(order)}
          endIcon={<ArrowForwardOutlinedIcon />}
          className="ud-tracking-card__action-btn"
        >
          Track All Orders
        </Button>
      </div>

      {isCancelled ? (
        <div className="ud-tracking-card__cancelled-alert">
          This order was cancelled and is no longer moving through the fulfillment pipeline.
        </div>
      ) : (
        <div className="ud-tracking-card__timeline-wrap">
          <div className="ud-tracking-card__timeline">
            {steps.map((step, idx) => {
              const isPast = step.done && !step.current;
              const isCurrent = step.current;
              return (
                <div
                  key={step.id}
                  className={`ud-tracking-step ${isPast ? 'ud-tracking-step--done' : ''} ${isCurrent ? 'ud-tracking-step--current' : ''}`}
                >
                  <div className="ud-tracking-step__node">
                    <div className="ud-tracking-step__circle">
                      {isPast ? (
                        <CheckIcon className="ud-tracking-step__check" />
                      ) : isCurrent ? (
                        <span className="ud-tracking-step__active-dot" />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>
                    {idx < steps.length - 1 && <div className="ud-tracking-step__line" />}
                  </div>

                  <div className="ud-tracking-step__info">
                    <span className="ud-tracking-step__label">{step.label}</span>
                    <span className="ud-tracking-step__desc">{step.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}

