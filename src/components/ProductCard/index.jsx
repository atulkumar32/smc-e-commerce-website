import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './style.scss';

/**
 * ProductCard
 * Reusable card — ProductList, Home new-drops, search results, etc.
 *
 * Props:
 *  product  – product object
 *  animate  – boolean, adds entrance animation class
 */
function ProductCard({ product, animate = false }) {
  const { addItem, toggleWishlist, isWishlisted } = useCart();
  const navigate = useNavigate();

  const wished = isWishlisted(product.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem(product);
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    navigate(`/products/${product.name}`);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    toggleWishlist(product);
  };

  const formatPrice = (n) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0,
    }).format(n);

  return (
    <article className={`pcard${animate ? ' pcard--animate' : ''}`}>
      <Link to={`/products/${product.name}`} className="pcard__img-wrap">
        <img
          src={product.image}
          alt={product.name}
          className="pcard__img"
          loading="lazy"
        />

        {/* Size badges */}
        {/* {product.sizes?.length > 0 && (
          <div className="pcard__sizes" aria-label="Available sizes">
            {product.sizes.map((s) => (
              <span key={s} className="pcard__size">{s}</span>
            ))}
            {product.outOfSizes?.map((s) => (
              <span key={s} className="pcard__size pcard__size--oos"
                aria-label={`${s} out of stock`}>{s}</span>
            ))}
          </div>
        )} */}

        {/* Badge */}
        {product.badge && (
          <span className={`pcard__badge pcard__badge--${product.badge.toLowerCase()}`}>
            {product.badge}
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

        {/* Quick Add overlay */}
        {/* <button
          className="pcard__quick-add"
          onClick={handleAddToCart}
          aria-label={`Add ${product.name} to cart`}
        >
          Add to Cart
        </button> */}
      </Link>

      {/* Card body */}
      <div className="pcard__body">
        {/* Color swatches */}
        {product.colors?.length > 0 && (
          <div className="pcard__colors" aria-label="Available colours">
            {product.colors.map((c) => (
              <span key={c} className="pcard__color"
                style={{ backgroundColor: c }} aria-label={c} />
            ))}
          </div>
        )}

        <h3 className="pcard__name">
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </h3>

        {product.brand && (
          <div className="pcard__brand">{product.brand}</div>
        )}

        {product.shortDescription && (
          <p className="pcard__short">{product.shortDescription}</p>
        )}

        <div className="pcard__pricing">
          <span className="pcard__price">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="pcard__original">{formatPrice(product.originalPrice)}</span>
          )}
        </div>

        <div className="pcard__actions">
          <button className="pcard__btn pcard__btn--cart" onClick={handleAddToCart}>
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
