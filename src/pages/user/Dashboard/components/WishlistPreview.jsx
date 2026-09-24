import { Card, Box, Typography, Button, IconButton, Tooltip } from '@mui/material';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import { useCart } from '../../../../context/CartContext';
import { useCartDrawer } from '../../../../context/CartDrawerContext';
import EmptyState from './EmptyState';
import { toTitleCase } from '../../../../utils/slug';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);

export default function WishlistPreview({ onViewAll, onShop }) {
  const { wishlistItems = [], removeFromWishlist, addItem, isInCart } = useCart();
  const { openDrawer } = useCartDrawer ? useCartDrawer() : { openDrawer: () => {} };

  const handleAddToCart = (e, item) => {
    e.stopPropagation();
    addItem(item);
    openDrawer();
  };

  const handleRemove = (e, item) => {
    e.stopPropagation();
    removeFromWishlist(item.id, item.name);
  };

  return (
    <Card elevation={0} className="ud-section-card ud-wishlist-preview">
      <div className="ud-section-card__header">
        <div>
          <div className="ud-section-card__header-tag">
            <span className="ud-section-card__tag-dot" />
            Curated Favorites
          </div>
          <h3 className="ud-section-card__title">Saved In Wishlist</h3>
          <p className="ud-section-card__subtitle">
            Items you have bookmarked for upcoming purchase or gifting.
          </p>
        </div>

        {wishlistItems.length > 0 && (
          <Button
            variant="text"
            onClick={onViewAll}
            endIcon={<ArrowForwardOutlinedIcon sx={{ fontSize: 16 }} />}
            className="ud-section-card__action-link"
          >
            View All ({wishlistItems.length})
          </Button>
        )}
      </div>

      <div className="ud-wishlist-preview__content">
        {wishlistItems.length === 0 ? (
          <EmptyState
            icon={<FavoriteBorderOutlinedIcon />}
            title="Your wishlist is empty"
            description="Save school bags, backpacks, and accessories you love to revisit or purchase later."
            actionLabel="Explore Products"
            onAction={onShop}
          />
        ) : (
          <div className="ud-wishlist-preview__grid">
            {wishlistItems.slice(0, 4).map((item) => {
              const inCart = isInCart(item.id);
              const hasDiscount = item.originalPrice && item.originalPrice > item.price;
              const discountPct = hasDiscount
                ? Math.round((1 - item.price / item.originalPrice) * 100)
                : 0;

              return (
                <div key={item.id} className="ud-wishlist-card">
                  <div className="ud-wishlist-card__image-box">
                    {item.image ? (
                      <img src={item.image} alt={item.name} loading="lazy" />
                    ) : (
                      <div className="ud-wishlist-card__placeholder">🎒</div>
                    )}

                    {discountPct > 0 && (
                      <span className="ud-wishlist-card__badge">
                        {discountPct}% OFF
                      </span>
                    )}

                    <Tooltip title="Remove from Wishlist" arrow>
                      <IconButton
                        size="small"
                        onClick={(e) => handleRemove(e, item)}
                        className="ud-wishlist-card__remove-btn"
                        aria-label="Remove from wishlist"
                      >
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </div>

                  <div className="ud-wishlist-card__info">
                    {item.brand && (
                      <span className="ud-wishlist-card__brand">{item.brand}</span>
                    )}
                    <h4 className="ud-wishlist-card__title" title={item.name}>
                      {toTitleCase(item.name)}
                    </h4>

                    <div className="ud-wishlist-card__pricing">
                      <span className="ud-wishlist-card__price">{fmt(item.price)}</span>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="ud-wishlist-card__mrp">
                          {fmt(item.originalPrice)}
                        </span>
                      )}
                    </div>

                    <Button
                      variant={inCart ? 'outlined' : 'contained'}
                      fullWidth
                      size="small"
                      startIcon={<ShoppingBagOutlinedIcon fontSize="small" />}
                      onClick={(e) => handleAddToCart(e, item)}
                      className={`ud-wishlist-card__cart-btn ${inCart ? 'ud-wishlist-card__cart-btn--in-cart' : ''}`}
                    >
                      {inCart ? 'In Cart' : 'Move to Cart'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

