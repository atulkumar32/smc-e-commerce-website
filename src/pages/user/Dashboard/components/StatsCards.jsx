import { Card, Box, Typography, Skeleton } from '@mui/material';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';

function SingleStatCard({ icon, label, value, subtext, accent, onClick, loading, isLive }) {
  return (
    <Card
      elevation={0}
      onClick={onClick}
      className={`ud-stat-card ${onClick ? 'ud-stat-card--clickable' : ''}`}
      style={{ '--stat-accent': accent }}
    >
      <div className="ud-stat-card__top">
        <div className="ud-stat-card__icon-box">
          {icon}
        </div>
        {isLive && (
          <div className="ud-stat-card__live-pill">
            <span className="ud-stat-card__live-dot" />
            LIVE
          </div>
        )}
      </div>

      <div className="ud-stat-card__body">
        {loading ? (
          <>
            <Skeleton width="50%" height={32} />
            <Skeleton width="75%" height={18} sx={{ mt: 0.5 }} />
          </>
        ) : (
          <>
            <Typography variant="h4" className="ud-stat-card__value">
              {value}
            </Typography>
            <Typography variant="body2" className="ud-stat-card__label">
              {label}
            </Typography>
            {subtext && (
              <Typography variant="caption" className="ud-stat-card__subtext">
                {subtext}
              </Typography>
            )}
          </>
        )}
      </div>

      {onClick && !loading && (
        <div className="ud-stat-card__arrow">
          <ArrowForwardOutlinedIcon />
        </div>
      )}
    </Card>
  );
}

export default function StatsCards({
  stats,
  wishlistCount = 0,
  addressCount = 1,
  loading = false,
  onNavigateOrders,
  onNavigateWishlist,
  onNavigateAddresses,
}) {
  const totalOrders = stats?.total ?? 0;
  const pendingOrders = stats?.pending ?? 0;
  const deliveredOrders = stats?.delivered ?? 0;

  return (
    <section className="ud-stats-section" aria-label="Account Statistics">
      <div className="ud-stats-grid">
        <SingleStatCard
          icon={<ShoppingBagOutlinedIcon />}
          label="Total Orders"
          value={totalOrders}
          subtext="Lifetime consignment history"
          accent="#001F3F"
          loading={loading}
          onClick={onNavigateOrders}
        />

        <SingleStatCard
          icon={<PendingActionsOutlinedIcon />}
          label="Pending Orders"
          value={pendingOrders}
          subtext="Processing in fulfillment"
          accent="#d97706"
          isLive={pendingOrders > 0}
          loading={loading}
          onClick={() => onNavigateOrders?.('pending')}
        />

        <SingleStatCard
          icon={<CheckCircleOutlineOutlinedIcon />}
          label="Delivered Orders"
          value={deliveredOrders}
          subtext="Successfully delivered"
          accent="#16a34a"
          loading={loading}
          onClick={() => onNavigateOrders?.('delivered')}
        />

        <SingleStatCard
          icon={<FavoriteBorderOutlinedIcon />}
          label="Saved Wishlist"
          value={wishlistCount}
          subtext="Items curated for later"
          accent="#dc2626"
          loading={loading}
          onClick={onNavigateWishlist}
        />

        <SingleStatCard
          icon={<PlaceOutlinedIcon />}
          label="Saved Addresses"
          value={addressCount}
          subtext="Verified shipping locations"
          accent="#0284c7"
          loading={loading}
          onClick={onNavigateAddresses}
        />
      </div>
    </section>
  );
}

