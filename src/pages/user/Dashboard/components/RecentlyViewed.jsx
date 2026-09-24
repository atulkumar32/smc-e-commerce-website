import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Box, Typography, Button, IconButton, Tooltip } from '@mui/material';
import ChevronLeftOutlinedIcon from '@mui/icons-material/ChevronLeftOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import StarIcon from '@mui/icons-material/Star';
import { useCart } from '../../../../context/CartContext';
import { useCartDrawer } from '../../../../context/CartDrawerContext';
import { toSlug, toTitleCase } from '../../../../utils/slug';
import { MEDIA_BASE } from '../../../../Config/UrlsConfig';
import EmptyState from './EmptyState';

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

export default function RecentlyViewed({ fallbackProducts = [] }) {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const { addItem, toggleWishlist, isWishlisted } = useCart();
  const { openDrawer } = useCartDrawer ? useCartDrawer() : { openDrawer: () => {} };

  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('smc_recently_viewed') || '[]');
      if (Array.isArray(stored) && stored.length > 0) {
        setItems(stored);
      } else if (fallbackProducts && fallbackProducts.length > 0) {
        // Fallback to recent products from catalog
        const mapped = fallbackProducts.slice(0, 6).map((p) => {
          let img = '';
          if (Array.isArray(p.variants) && p.variants[0]?.images?.[0]?.image_url) {
            img = resolveImg(p.variants[0].images[0].image_url);
          } else if (p.primary_image || p.image) {
            img = resolveImg(p.primary_image || p.image);
          }
          return {
            id: p.product_id || p.id,
            name: p.product_name || p.name || 'Handcrafted Bag',
            price: Number(p.selling_price ?? p.price ?? 999),
            originalPrice: Number(p.mrp ?? p.originalPrice ?? 1499),
            image: img,
            rating: 4.8,
            brand: p.brand || 'SMC Collection',
          };
        });
        setItems(mapped);
      }
    } catch {
      setItems([]);
    }
  }, [fallbackProducts]);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const distance = 300;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  };

  const handleAddToCart = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(item);
    openDrawer();
  };

  const handleWishlist = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(item);
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <Card elevation={0} className="ud-section-card ud-recently-viewed">
      <div className="ud-section-card__header">
        <div>
          <div className="ud-section-card__header-tag">
            <span className="ud-section-card__tag-dot" />
            Browsing History
          </div>
          <h3 className="ud-section-card__title">Recently Viewed Bags</h3>
          <p className="ud-section-card__subtitle">
            Pick up right where you left off in your shopping session.
          </p>
        </div>

        <div className="ud-recently-viewed__nav-btns">
          <IconButton
            size="small"
            onClick={() => scroll('left')}
            className="ud-recently-viewed__arrow-btn"
            aria-label="Scroll left"
          >
            <ChevronLeftOutlinedIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => scroll('right')}
            className="ud-recently-viewed__arrow-btn"
            aria-label="Scroll right"
          >
            <ChevronRightOutlinedIcon />
          </IconButton>
        </div>
      </div>

      <div className="ud-recently-viewed__carousel" ref={scrollRef}>
        {items.map((prod) => {
          const wished = isWishlisted(prod.id);
          const slug = toSlug(prod.name, prod.id);
          const hasDiscount = prod.originalPrice && prod.originalPrice > prod.price;
          const discountPct = hasDiscount
            ? Math.round((1 - prod.price / prod.originalPrice) * 100)
            : 0;

          return (
            <div key={prod.id} className="ud-product-slide">
              <Link to={`/products/${slug}`} className="ud-product-slide__link">
                <div className="ud-product-slide__image-wrap">
                  {prod.image ? (
                    <img src={prod.image} alt={prod.name} loading="lazy" />
                  ) : (
                    <div className="ud-product-slide__placeholder">🎒</div>
                  )}

                  {discountPct > 0 && (
                    <span className="ud-product-slide__discount-badge">
                      {discountPct}% OFF
                    </span>
                  )}

                  <Tooltip title={wished ? 'Remove from Wishlist' : 'Save to Wishlist'} arrow>
                    <IconButton
                      size="small"
                      onClick={(e) => handleWishlist(e, prod)}
                      className={`ud-product-slide__wish-btn ${wished ? 'ud-product-slide__wish-btn--active' : ''}`}
                    >
                      {wished ? <FavoriteIcon /> : <FavoriteBorderOutlinedIcon />}
                    </IconButton>
                  </Tooltip>
                </div>

                <div className="ud-product-slide__details">
                  {prod.brand && (
                    <span className="ud-product-slide__brand">{prod.brand}</span>
                  )}
                  <h4 className="ud-product-slide__title" title={prod.name}>
                    {toTitleCase(prod.name)}
                  </h4>

                  <div className="ud-product-slide__rating-row">
                    <span className="ud-product-slide__stars">
                      <StarIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
                      <span>{prod.rating || 4.8}</span>
                    </span>
                    <span className="ud-product-slide__stock-pill">In Stock</span>
                  </div>

                  <div className="ud-product-slide__price-row">
                    <span className="ud-product-slide__price">{fmt(prod.price)}</span>
                    {prod.originalPrice && prod.originalPrice > prod.price && (
                      <span className="ud-product-slide__mrp">{fmt(prod.originalPrice)}</span>
                    )}
                  </div>

                  <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    startIcon={<ShoppingBagOutlinedIcon fontSize="small" />}
                    onClick={(e) => handleAddToCart(e, prod)}
                    className="ud-product-slide__cart-btn"
                  >
                    Add to Cart
                  </Button>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

