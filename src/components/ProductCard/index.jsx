import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useCartDrawer } from '../../context/CartDrawerContext';
import { toSlug, toTitleCase, getProductSlug } from '../../utils/slug';
import './style.scss';

// ── Feature tag icon helpers ──────────────────────────────────────────────────
function CapacityIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="2" y="4" width="16" height="12" rx="2"/>
      <path d="M2 8h16"/>
    </svg>
  );
}
function MaterialIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M10 2l8 4v5a8 8 0 0 1-8 7 8 8 0 0 1-8-7V6l8-4z"/>
    </svg>
  );
}
function DesignIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M7 9l3 3 9-9"/><path d="M19 10v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9"/>
    </svg>
  );
}

/**
 * Unified ProductCard
 * One standard card matching PLP design across the entire application:
 * - PLP (Product List)
 * - Wishlist Page
 * - Home Page (Bestsellers, Featured, New Drops)
 * - Dashboard & Recommendations
 */
export default function ProductCard({ product, index = 0, onRemoveWishlist }) {
  const navigate = useNavigate();
  const { addItem, isInCart, toggleWishlist, isWishlisted } = useCart();
  const cartDrawer = useCartDrawer ? useCartDrawer() : null;
  const openDrawer = cartDrawer?.openDrawer || (() => {});

  if (!product) return null;

  const rawProductId = product.productId || product.product_id || product.id || '';
  const cleanProductId = String(rawProductId).split('__')[0].trim();
  const slug = getProductSlug(product);
  const detailUrl = `/products/${slug}`;

  const imgSrc = product.image || product.img || '';
  const inCart = isInCart(product.id) || isInCart(cleanProductId);
  const wished = isWishlisted(product.id) || isWishlisted(cleanProductId);

  const price = Number(product.price ?? product.sellingPrice ?? 0);
  const originalPrice = product.originalPrice || product.mrp || null;
  const hasDiscount = originalPrice && Number(originalPrice) > price;
  const discountPct = hasDiscount ? Math.round((1 - price / Number(originalPrice)) * 100) : 0;

  // Title-cased base name
  const baseName = toTitleCase(product.name || 'School Bag');
  const nameParts = [
    product.bagCapacity ? product.bagCapacity : null,
    product.material    ? product.material    : null,
    product.pattern     ? product.pattern     : null,
    product.gender      ? product.gender      : null,
  ].filter(Boolean);
  const enrichedName = nameParts.length > 0 ? `${baseName} – ${nameParts.join(', ')}` : baseName;
  const name = enrichedName;

  // Feature tags — capacity / material / style from product data with standardized slots
  const cap = product.bagCapacity || product.capacity || product.volume || '18L';
  const mat = product.material || product.fabric || 'Polyester';
  const des = product.backpackStyle || product.usage || product.gender || 'Unisex';

  const featureTags = [
    { Icon: CapacityIcon, label: cap, sub: 'Capacity' },
    { Icon: MaterialIcon, label: mat, sub: 'Material' },
    { Icon: DesignIcon,   label: des, sub: 'Usage' },
  ];

  // Available colors with fallback to default swatches
  const colorList = (product.colors && product.colors.length > 0)
    ? product.colors
    : (product.color || product.colorHex)
      ? [{ hex: product.colorHex || product.color, name: product.colorName || 'Default' }]
      : [{ hex: '#132A4C', name: 'Navy' }, { hex: '#1B1B1B', name: 'Black' }];

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (inCart) { openDrawer(); return; }
    addItem({
      ...product,
      id: product.id,
      productId: cleanProductId,
      slug,
      name: product.name,
      price,
      originalPrice,
      image: imgSrc,
      category: product.category || '',
      colorName: product.colorName || '',
      brand: product.brand || '',
      stock: product.stock ?? 99,
    });
    openDrawer();
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    navigate(detailUrl);
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (onRemoveWishlist) {
      onRemoveWishlist(product);
      return;
    }
    toggleWishlist({
      ...product,
      id: product.id,
      productId: cleanProductId,
      slug,
      name: product.name,
      price,
      originalPrice,
      image: imgSrc,
      category: product.category || '',
      colorName: product.colorName || '',
      brand: product.brand || '',
    });
  };

  const rowDelay = (index % 6) * 85;

  return (
    <article
      className="pcard is-visible stagger-revealed"
      style={{
        '--stagger-delay': `${rowDelay}ms`,
        transitionDelay: `${rowDelay}ms`,
      }}
      onClick={() => navigate(detailUrl)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(detailUrl)}
    >
      {/* ── Image ─────────────────────────────────────────────── */}
      <div className="pcard__img-wrap">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={name}
            className="pcard__img"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.nextSibling) {
                e.currentTarget.nextSibling.style.display = 'flex';
              }
            }}
          />
        ) : null}
        <div
          className="pcard__img-placeholder"
          style={{ display: imgSrc ? 'none' : 'flex' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M6 8h12l-1 13H7L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>
          </svg>
        </div>

        {/* Wishlist Heart — top-right */}
        <button
          type="button"
          className={`pcard__heart${wished ? ' pcard__heart--on' : ''}`}
          onClick={handleWishlist}
          aria-label={wished ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-pressed={wished}
        >
          <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"
            fill={wished ? 'currentColor' : 'none'}>
            <path d="M12 21s-7.5-4.6-10-9.2C.4 8.4 2 4.5 6 4c2.3-.3 4.2 1 6 3 1.8-2 3.7-3.3 6-3 4 .5 5.6 4.4 4 7.8-2.5 4.6-10 9.2-10 9.2z"/>
          </svg>
        </button>
      </div>

      {/* ── Body ──────────────────────────────────────────────── */}
      <div className="pcard__body">
        {/* Brand */}
        <p className="pcard__brand stagger-text">
          {(product.brand || product.brandName || product.category || 'VORANO').toUpperCase()}
        </p>

        {/* Product name */}
        <h3 className="pcard__name stagger-text">{name}</h3>

        {/* Rating */}
        <div className="pcard__rating stagger-text">
          <span className="pcard__rating-pill">
            <svg viewBox="0 0 10 10" fill="currentColor" width="9" height="9">
              <path d="M5 0l1.12 3.45H10L7.06 5.59l1.12 3.44L5 7 1.82 9.03 2.94 5.59.01 3.45H3.88z"/>
            </svg>
            {product.rating || '4.3'}
          </span>
          <span className="pcard__rating-count">
            ({product.reviewCount || product.reviews || '128'})
          </span>
        </div>

        {/* Price row */}
        <div className="pcard__price-row stagger-text">
          <span className="pcard__price">₹{price.toLocaleString('en-IN')}</span>
          {hasDiscount ? (
            <>
              <span className="pcard__mrp">₹{Number(originalPrice).toLocaleString('en-IN')}</span>
              <span className="pcard__off">{discountPct}% off</span>
            </>
          ) : (
            <span className="pcard__mrp" style={{ visibility: 'hidden' }}>₹{price.toLocaleString('en-IN')}</span>
          )}
        </div>

        {/* Feature tags (Consistent 3-Slot Grid) */}
        <div className="pcard__features">
          {featureTags.map(({ Icon, label, sub }, i) => (
            <span key={i} className="pcard__feature">
              <span className="pcard__feature-ico"><Icon /></span>
              <span className="pcard__feature-text">
                <strong>{label}</strong>
                <em>{sub}</em>
              </span>
            </span>
          ))}
        </div>

        {/* Available Colors (Consistent Slot) */}
        <div className="pcard__avail">
          <span className="pcard__avail-label">Available Colors</span>
          <div className="pcard__avail-row">
            {colorList.slice(0, 3).map((c, i) => (
              <span
                key={i}
                className="pcard__avail-dot"
                style={{ background: c.hex || c }}
                title={c.name || ''}
              />
            ))}
            {colorList.length > 3 && (
              <span className="pcard__avail-more">+{colorList.length - 3} more</span>
            )}
          </div>
        </div>

        {/* CTA row */}
        <div className="pcard__ctas">
          <button
            className={`pcard__btn pcard__btn--cart${inCart ? ' is-in-cart' : ''}`}
            onClick={handleAddToCart}
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 8h12l-1 13H7L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>
            </svg>
            {inCart ? 'In Cart' : 'Add to Cart'}
          </button>
          <button
            className="pcard__btn pcard__btn--buy"
            onClick={handleBuyNow}
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            Buy Now
          </button>
        </div>
      </div>
    </article>
  );
}
