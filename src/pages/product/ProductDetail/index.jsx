import { useState, useCallback, useEffect } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { RECENTLY_VIEWED } from '../productData';
import BASE_URL from '../../../Config/ApiConfig';
import { MEDIA_BASE } from '../../../Config/UrlsConfig';
import useProductDetail from '../useProductDetail';
import './style.scss';

function resolveApiImage(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const normalized = path.replace(/^\/+/, '');
  if (normalized.startsWith('smc/')) {
    return `${BASE_URL}${normalized}`;
  }
  return `${MEDIA_BASE}${normalized}`;
}

function normalizeColor(color) {
  if (!color) return null;
  if (typeof color === 'string') return color;
  if (typeof color === 'object') {
    return color.hex || color.value || color.code || null;
  }
  return null;
}

function mapProductResponse(product) {
  if (!product) return null;

  const images = Array.isArray(product.images) ? product.images : [];
  const gallery = images.map((img) => {
    const raw = img.image_url || img.url || img.data || img;
    return resolveApiImage(typeof raw === 'string' ? raw : '');
  });
  const primary = resolveApiImage(product.primary_image || (gallery[0] ?? ''));

  const colors = Array.isArray(product.colors)
    ? product.colors.map(normalizeColor).filter(Boolean)
    : typeof product.colors === 'string'
      ? product.colors.split(',').map((v) => normalizeColor(v.trim())).filter(Boolean)
      : [];

  return {
    id: product.product_id || product.id || '',
    name: product.product_name || product.name || 'Product',
    genericName: product.generic_name || null,
    brand: product.brand || null,
    categoryId: product.category_id || null,
    categoryName: product.category_name || null,
    shortDescription: product.short_description || null,
    description: product.full_description || product.description || null,
    price: Number(product.selling_price ?? product.discount_price ?? product.price ?? product.mrp ?? 0),
    originalPrice: Number(product.mrp ?? product.price ?? 0) || null,
    discountPercent: Number(product.discount_percent ?? 0),
    stock: Number(product.stock ?? 0),
    isLive: Boolean(
      product.is_live ??
      (product.status === 'published' || product.status === 'live' || product.is_live === 1)
    ),
    isNewArrival: Boolean(product.is_new_arrival),
    showInCardSlider: Boolean(product.show_in_card_slider),
    size: product.size || null,
    sizes: Array.isArray(product.sizes) ? product.sizes : [],
    outOfSizes: Array.isArray(product.outOfSizes) ? product.outOfSizes : [],
    countryOfOrigin: product.country_of_origin || null,
    material: product.material || null,
    pattern: product.pattern || null,
    gender: product.gender || null,
    bagCapacity: product.bag_capacity || null,
    netWeight: product.net_weight || null,
    recommendedAge: product.recommended_age || null,
    backpackStyle: product.backpack_style || null,
    colors,
    colorNames: product.colorNames || {},
    gallery: gallery.length > 0 ? gallery : [primary],
    primaryImage: primary,
    badge: product.badge || null,
    createdAt: product.created_at || null,
    rating: Number(product.rating ?? 4),
    reviewCount: Number(product.reviewCount ?? product.review_count ?? 0),
    accordion: product.accordion || [],
  };
}

// ── Star rating ───────────────────────────────────────────────────────────────
function StarRating({ rating }) {
  return (
    <div className="pd-stars" aria-label={`Rating: ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = rating >= n;
        const half = !filled && rating >= n - 0.5;
        return (
          <svg key={n} width="16" height="16" viewBox="0 0 24 24"
            fill={filled ? 'currentColor' : 'none'}
            stroke="currentColor" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
            className={`pd-stars__star${filled ? ' is-filled' : half ? ' is-half' : ''}`}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      })}
    </div>
  );
}

// ── Accordion item ────────────────────────────────────────────────────────────
function AccordionItem({ item, isOpen, onToggle }) {
  return (
    <div className="pd-accordion__item">
      <button
        className="pd-accordion__trigger"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`acc-${item.id}`}
      >
        <span className="pd-accordion__label">{item.title}</span>
        <svg
          className={`pd-accordion__chevron${isOpen ? ' is-open' : ''}`}
          width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div
        id={`acc-${item.id}`}
        className={`pd-accordion__body${isOpen ? ' is-open' : ''}`}
        role="region"
      >
        <div className="pd-accordion__content">
          {item.list ? (
            <ul className="pd-accordion__list">
              {item.list.map((li) => <li key={li}>{li}</li>)}
            </ul>
          ) : (
            <p>{item.content}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
function ProductDetail() {
  const { slug } = useParams();
  const { search } = useLocation();
  const navigate = useNavigate();
  const { addItem, toggleWishlist, isWishlisted } = useCart();

  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [openAcc, setOpenAcc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const productId = new URLSearchParams(search).get('product_id') || slug;

  // use shared hook to fetch and normalize product
  const { product: fetchedProduct, loading: fetchedLoading, error: fetchedError } = useProductDetail(productId);

  useEffect(() => {
    if (fetchedProduct) {
      setProduct(fetchedProduct);
      setSelectedColor(fetchedProduct.colors?.[0] ?? null);
      setSelectedSize(fetchedProduct.sizes?.[0] ?? null);
    }
  }, [fetchedProduct]);

  useEffect(() => {
    if (fetchedError) setError(fetchedError);
  }, [fetchedError]);

  useEffect(() => {
    setLoading(fetchedLoading);
  }, [fetchedLoading]);

  const wished = product ? isWishlisted(product.id) : false;

  const formatPrice = (n) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0,
    }).format(n);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    addItem({ ...product, selectedColor, selectedSize });
  }, [product, addItem, selectedColor, selectedSize]);

  const handleWishlist = useCallback(() => {
    if (!product) return;
    toggleWishlist(product);
  }, [product, toggleWishlist]);

  const handleBuyNow = useCallback(() => {
    if (!product) return;
    addItem({ ...product, selectedColor, selectedSize });
    navigate('/cart');
  }, [product, addItem, selectedColor, selectedSize, navigate]);

  if (loading) {
    return (
      <div className="pd-not-found">
        <h2>Loading product details…</h2>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pd-not-found">
        <h2>{error || 'Product not found'}</h2>
        <Link to="/products" className="pd-not-found__link">← Back to Products</Link>
      </div>
    );
  }

  const colorName = product.colorNames?.[selectedColor] ?? selectedColor;

  return (
    <div className="pd">
      <div className="pd__inner">

        {/* ── Main grid ── */}
        <div className="pd__grid">

          {/* ── LEFT: Gallery ── */}
          <div className="pd__gallery">
            {/* Vertical thumbnails — left column */}
            <div className="pd__thumbs" role="list" aria-label="Product images">
              {product.gallery.map((src, i) => (
                <button
                  key={i}
                  role="listitem"
                  className={`pd__thumb${i === activeImg ? ' is-active' : ''}`}
                  onClick={() => setActiveImg(i)}
                  aria-label={`View image ${i + 1}`}
                  aria-pressed={i === activeImg}
                >
                  <img src={src} alt={`${product.name} view ${i + 1}`} loading="lazy" />
                </button>
              ))}
            </div>

            {/* Main image */}
            <div className="pd__main-img-wrap">
              <img
                key={activeImg}
                src={product.gallery[activeImg]}
                alt={product.name}
                className="pd__main-img"
              />
              {product.badge && (
                <span className={`pd__badge pd__badge--${product.badge.toLowerCase()}`}>
                  {product.badge}
                </span>
              )}
            </div>
          </div>

          {/* ── RIGHT: Info ── */}
          <div className="pd__info">
            {/* Breadcrumb */}
            <nav className="pd__breadcrumb" aria-label="Breadcrumb">
              <Link to="/products" className="pd__breadcrumb-link">Bags</Link>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <span className="pd__breadcrumb-current">{product.name}</span>
            </nav>

            {/* Title + rating */}
            <h1 className="pd__title">{product.name}</h1>
            <div className="pd__rating">
              <StarRating rating={product.rating} />
              <span className="pd__rating-count">({product.reviewCount} Reviews)</span>
            </div>

            {/* Price */}
            <div className="pd__pricing">
              <span className="pd__price">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="pd__original">{formatPrice(product.originalPrice)}</span>
              )}
            </div>

            {/* Description */}
            <p className="pd__desc">{product.description}</p>

            {/* Color selector */}
            {product.colors?.length > 0 && (
              <div className="pd__variant-group">
                <span className="pd__variant-label">
                  COLOR: <strong>{colorName}</strong>
                </span>
                <div className="pd__colors">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      className={`pd__color-btn${selectedColor === c ? ' is-active' : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setSelectedColor(c)}
                      aria-label={product.colorNames?.[c] ?? c}
                      aria-pressed={selectedColor === c}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size selector */}
            {product.sizes?.length > 0 && (
              <div className="pd__variant-group">
                <span className="pd__variant-label">SIZE</span>
                <div className="pd__sizes">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      className={`pd__size-btn${selectedSize === s ? ' is-active' : ''}`}
                      onClick={() => setSelectedSize(s)}
                      aria-pressed={selectedSize === s}
                    >
                      {s}
                    </button>
                  ))}
                  {product.outOfSizes?.map((s) => (
                    <button key={s} className="pd__size-btn pd__size-btn--oos" disabled aria-label={`${s} out of stock`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CTA buttons */}
            <div className="pd__cta">
              <button
                className="pd__btn pd__btn--cart"
                onClick={handleAddToCart}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
                  strokeLinejoin="round" aria-hidden="true">
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6" />
                </svg>
                Add to Cart
              </button>
              <button className="pd__btn pd__btn--buy" onClick={handleBuyNow}>
                Buy Now
              </button>
              <button
                className={`pd__btn pd__btn--wish${wished ? ' is-wished' : ''}`}
                onClick={handleWishlist}
                aria-pressed={wished}
                aria-label={wished ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24"
                  fill={wished ? 'currentColor' : 'none'}
                  stroke="currentColor" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
                {wished ? 'Wishlisted' : 'Save to Wishlist'}
              </button>
            </div>

            {/* Accordion specs */}
            {product.accordion?.length > 0 && (
              <div className="pd__accordion" role="list">
                {product.accordion.map((item) => (
                  <AccordionItem
                    key={item.id}
                    item={item}
                    isOpen={openAcc === item.id}
                    onToggle={() => setOpenAcc(openAcc === item.id ? null : item.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Recently Viewed ── */}
        <section className="pd__recent" aria-labelledby="recent-heading">
          <h2 className="pd__recent-title" id="recent-heading">Recently Viewed</h2>
          <div className="pd__recent-track">
            {RECENTLY_VIEWED.map((item) => (
              <div key={item.id} className="pd__recent-card">
                <div className="pd__recent-img-wrap">
                  <img src={item.image} alt={item.name} loading="lazy" className="pd__recent-img" />
                </div>
                <div className="pd__recent-body">
                  <p className="pd__recent-cat">{item.category}</p>
                  <h3 className="pd__recent-name">{item.name}</h3>
                  <p className="pd__recent-price">{formatPrice(item.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

export default ProductDetail;
