import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Box, Typography, Button, IconButton, Skeleton, Tooltip } from '@mui/material';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import StarIcon from '@mui/icons-material/Star';
import { useCart } from '../../../../context/CartContext';
import { useCartDrawer } from '../../../../context/CartDrawerContext';
import { toSlug, toTitleCase } from '../../../../utils/slug';
import { MEDIA_BASE } from '../../../../Config/UrlsConfig';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);

function resolveImg(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const normalized = path.replace(/^\/+/, '');
  return `${MEDIA_BASE}${normalized}`;
}

export default function RecommendedProducts({ products = [], loading = false }) {
  const navigate = useNavigate();
  const { addItem, toggleWishlist, isWishlisted } = useCart();
  const { openDrawer } = useCartDrawer ? useCartDrawer() : { openDrawer: () => {} };

  const handleAddToCart = (e, prod) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(prod);
    openDrawer();
  };

  const handleWishlist = (e, prod) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(prod);
  };

  // Map products into standardized shape
  const displayItems = (products || []).slice(0, 4).map((p) => {
    let img = '';
    if (Array.isArray(p.variants) && p.variants.length > 0) {
      for (const v of p.variants) {
        if (Array.isArray(v.images) && v.images.length > 0) {
          const main = v.images.find((i) => i.is_main) || v.images[0];
          if (main?.image_url) { img = resolveImg(main.image_url); break; }
        }
      }
    }
    if (!img && (p.primary_image || p.image)) {
      img = resolveImg(p.primary_image || p.image);
    }

    const price = Number(p.selling_price ?? p.price ?? 999);
    const mrp = Number(p.mrp ?? p.originalPrice ?? price);

    return {
      id: p.product_id || p.id,
      name: p.product_name || p.name || 'Artisan Backpack',
      brand: p.brand || 'Shree Mahaveer',
      price,
      originalPrice: mrp > price ? mrp : null,
      image: img,
      rating: p.rating || 4.9,
      reviewsCount: p.reviews_count || 18,
    };
  });

  return (
    <Card elevation={0} className="ud-section-card ud-recommended">
      <div className="ud-section-card__header">
        <div>
          <div className="ud-section-card__header-tag">
            <span className="ud-section-card__tag-dot" />
            Personalized For You
          </div>
          <h3 className="ud-section-card__title">Recommended Collections</h3>
          <p className="ud-section-card__subtitle">
            Hand-selected school bags and luxury accessories matched to your tastes.
          </p>
        </div>

        <Button
          variant="text"
          onClick={() => navigate('/products')}
          endIcon={<ArrowForwardOutlinedIcon sx={{ fontSize: 16 }} />}
          className="ud-section-card__action-link"
        >
          View Full Catalog
        </Button>
      </div>

      <div className="ud-recommended__content">
        {loading ? (
          <div className="ud-recommended__grid">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="ud-rec-card-skeleton">
                <Skeleton variant="rectangular" height={220} sx={{ borderRadius: '14px' }} />
                <Skeleton width="40%" height={16} sx={{ mt: 1.5 }} />
                <Skeleton width="85%" height={22} sx={{ mt: 0.5 }} />
                <Skeleton width="50%" height={20} sx={{ mt: 1 }} />
                <Skeleton width="100%" height={36} sx={{ mt: 1.5, borderRadius: '10px' }} />
              </div>
            ))}
          </div>
        ) : displayItems.length === 0 ? null : (
          <div className="ud-recommended__grid">
            {displayItems.map((prod) => {
              const wished = isWishlisted(prod.id);
              const slug = toSlug(prod.name, prod.id);
              const hasDiscount = prod.originalPrice && prod.originalPrice > prod.price;
              const discountPct = hasDiscount
                ? Math.round((1 - prod.price / prod.originalPrice) * 100)
                : 0;

              return (
                <div key={prod.id} className="ud-rec-card">
                  <Link to={`/products/${slug}`} className="ud-rec-card__link">
                    <div className="ud-rec-card__image-box">
                      {prod.image ? (
                        <img src={prod.image} alt={prod.name} loading="lazy" />
                      ) : (
                        <div className="ud-rec-card__placeholder">🎒</div>
                      )}

                      {discountPct > 0 && (
                        <span className="ud-rec-card__discount-badge">
                          {discountPct}% OFF
                        </span>
                      )}

                      <Tooltip title={wished ? 'Remove from Wishlist' : 'Save to Wishlist'} arrow>
                        <IconButton
                          size="small"
                          onClick={(e) => handleWishlist(e, prod)}
                          className={`ud-rec-card__wish-btn ${wished ? 'ud-rec-card__wish-btn--active' : ''}`}
                          aria-label="Wishlist toggle"
                        >
                          {wished ? <FavoriteIcon /> : <FavoriteBorderOutlinedIcon />}
                        </IconButton>
                      </Tooltip>
                    </div>

                    <div className="ud-rec-card__info">
                      {prod.brand && (
                        <span className="ud-rec-card__brand">{prod.brand}</span>
                      )}
                      <h4 className="ud-rec-card__name" title={prod.name}>
                        {toTitleCase(prod.name)}
                      </h4>

                      <div className="ud-rec-card__rating">
                        <StarIcon sx={{ fontSize: 13, color: '#f59e0b' }} />
                        <span>{prod.rating}</span>
                        <span className="ud-rec-card__reviews">({prod.reviewsCount})</span>
                      </div>

                      <div className="ud-rec-card__price-row">
                        <span className="ud-rec-card__price">{fmt(prod.price)}</span>
                        {prod.originalPrice && (
                          <span className="ud-rec-card__mrp">{fmt(prod.originalPrice)}</span>
                        )}
                      </div>

                      <Button
                        variant="contained"
                        size="small"
                        fullWidth
                        startIcon={<ShoppingBagOutlinedIcon fontSize="small" />}
                        onClick={(e) => handleAddToCart(e, prod)}
                        className="ud-rec-card__cart-btn"
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

