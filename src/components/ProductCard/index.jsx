import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './style.scss';

/**
 * ProductCard
 * One card = one variant. Each card links to the product detail page
 * with the correct product_id so the detail page can load all variants.
 *
 * Props:
 *  product  – variant-card object from expandProductToVariantCards
 *  animate  – boolean, adds entrance animation class
 */
function ProductCard({ product, animate = false }) {
  const { addItem, toggleWishlist, isWishlisted } = useCart();
  const navigate = useNavigate();

  // productId is the master product ID; id is unique per variant card
  const productId = product.productId || product.id;
  const wished    = isWishlisted(product.id);

  const detailUrl = `/products/${encodeURIComponent(product.name)}?product_id=${encodeURIComponent(productId)}`;

  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem({
      ...product,
      id:            productId,
      selectedColor: product.colorHex  || '',
      selectedSize:  product.size      || '',
      variantId:     product.variantId || null,
    });
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    navigate(detailUrl);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    toggleWishlist(product);
  };

  const formatPrice = (n) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0,
    }).format(n);

  // Color swatches — all sibling variants for this product
  const swatches = Array.isArray(product.colors) ? product.colors : [];

  return (
    <article className={`pcard${animate ? ' pcard--animate' : ''}`}>
      <Link to={detailUrl} className="pcard__img-wrap">
        <img
          src={product.image}
          alt={product.colorName ? `${product.name} – ${product.colorName}` : product.name}
          className="pcard__img"
          loading="lazy"
          onError={(e) => {
            console.warn(`%c[ProductCard] ❌ img failed`, 'color:red', product.image);
            e.currentTarget.src = '';
            e.currentTarget.style.background = '#f3f4f6';
          }}
        />

        {/* Badge */}
        {product.badge && (
          <span className={`pcard__badge pcard__badge--${product.badge.toLowerCase()}`}>
            {product.badge}
          </span>
        )}

        {/* Out of stock overlay */}
        {product.stock === 0 && product.stock !== undefined && (
          <span style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em',
          }}>
            OUT OF STOCK
          </span>
        )}

        {/* Wishlist heart */}
        <button
          className={`pcard__wish${wished ? ' is-wished' : ''}`}
          onClick={handleWishlist}
          aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={wished}
        >
          <svg width="18" height="18" viewBox="0 0 24 24"
            fill={wished ? 'currentColor' : 'none'}
            stroke="currentColor" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>
      </Link>

      {/* Card body */}
      <div className="pcard__body">
        {/* Color swatches — highlight the active variant's swatch */}
        {swatches.length > 0 && (
          <div className="pcard__colors" aria-label="Available colours">
            {swatches.map((c) => (
              <span
                key={c.hex}
                className={`pcard__color${c.hex === product.colorHex ? ' pcard__color--active' : ''}`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
                aria-label={c.name}
              />
            ))}
          </div>
        )}

        {/* Show active color name if available */}
        {product.colorName && (
          <div className="pcard__color-name"
            style={{ fontSize: '0.72rem', color: '#6b7280', marginBottom: 2 }}>
            {product.colorName}
          </div>
        )}

        <h3 className="pcard__name">
          <Link to={detailUrl}>{product.name}</Link>
        </h3>

        {product.brand && <div className="pcard__brand">{product.brand}</div>}

        <div className="pcard__pricing">
          <span className="pcard__price">{formatPrice(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="pcard__original">{formatPrice(product.originalPrice)}</span>
          )}
        </div>

        <div className="pcard__actions">
          <button className="pcard__btn pcard__btn--cart"
            onClick={handleAddToCart}
            disabled={product.stock === 0 && product.stock !== undefined}>
            Add to Cart
          </button>
          <button className="pcard__btn pcard__btn--buy" onClick={handleBuyNow}>
            Buy Now
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
