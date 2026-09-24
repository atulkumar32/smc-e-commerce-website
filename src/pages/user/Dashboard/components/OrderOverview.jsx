import { Card, Box, Typography, Button, Skeleton } from '@mui/material';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import OrderCard from './OrderCard';
import EmptyState from './EmptyState';

export default function OrderOverview({
  orders = [],
  loading = false,
  onViewAll,
  onViewOrder,
  onShop,
  onReview,
}) {
  return (
    <Card elevation={0} className="ud-section-card ud-orders-overview">
      <div className="ud-section-card__header">
        <div>
          <h3 className="ud-section-card__title">Recent Consignments & Orders</h3>
          <p className="ud-section-card__subtitle">
            Your latest purchases, payment status, and delivery milestones.
          </p>
        </div>

        <Button
          variant="text"
          onClick={onViewAll}
          endIcon={<ArrowForwardOutlinedIcon sx={{ fontSize: 16 }} />}
          className="ud-section-card__action-link"
        >
          View All Orders
        </Button>
      </div>

      <div className="ud-orders-overview__content">
        {loading ? (
          <div className="ud-orders-overview__loading">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="ud-orders-overview__skeleton-row">
                <Skeleton variant="rectangular" width={64} height={64} sx={{ borderRadius: '12px' }} />
                <div style={{ flex: 1 }}>
                  <Skeleton width="40%" height={22} />
                  <Skeleton width="60%" height={16} sx={{ mt: 0.5 }} />
                </div>
                <Skeleton width={90} height={32} sx={{ borderRadius: '20px' }} />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={<ShoppingBagOutlinedIcon />}
            title="No orders yet"
            description="Start shopping our luxury school bags, backpacks, and accessories to see your orders here."
            actionLabel="Explore Collections"
            onAction={onShop}
          />
        ) : (
          <div className="ud-orders-overview__list">
            {orders.slice(0, 5).map((order) => (
              <OrderCard
                key={order.order_id || order.id}
                order={order}
                onView={onViewOrder}
                onReview={onReview}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

