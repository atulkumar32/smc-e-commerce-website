import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './style.scss';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n);

function WishlistItem({ item }) {
  const { removeFromWishlist, moveToCart } = useCart();

  return (
    <div className="wl-item">
      <Link to={`/products/${item.id}`} className="wl-item__img-wrap">
        <img src={item.image} alt={item.name} className="wl-item__img" loading="lazy" />
      </Link>

      <div className="wl-item__body">
        <div className="wl-item__top">
          <div>
            <h3 className="wl-item__name">
              <Link to={`/products/${item.id}`}>{item.name}</Link>
            </h3>
            <p className="wl-item__price">{fmt(item.price)}</p>
          </div>
          <button
            className="wl-item__remove"
            onClick={() => removeFromWishlist(item.id, item.name)}
            aria-label={`Remove ${item.name} from wishlist`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="wl-item__actions">
          <button
            className="wl-item__cart-btn"
            onClick={() => moveToCart(item)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6" />
            </svg>
            Move to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

function WishlistPage() {
  const { wishlistItems } = useCart();

  return (
    <div className="wl-page">
      <div className="wl-page__inner">
        {/* Header */}
        <div className="wl-page__header">
          <div>
            <h1 className="wl-page__title">My Wishlist</h1>
            <p className="wl-page__count">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
          <Link to="/products" className="wl-page__shop-btn">
            Continue Shopping
          </Link>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="wl-page__empty">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.2"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
            <p>Your wishlist is empty.</p>
            <Link to="/products" className="wl-page__empty-btn">
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="wl-page__grid">
            {wishlistItems.map((item) => (
              <WishlistItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WishlistPage;
