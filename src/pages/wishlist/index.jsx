import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import Breadcrumbs from '../../components/Breadcrumbs';
import ProductCard from '../../components/ProductCard';
import './style.scss';

function WishlistPage() {
  const { wishlistItems, removeFromWishlist } = useCart();

  return (
    <div className="wl-page">
      <div className="wl-page__inner">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Saved Wishlist' },
          ]}
        />

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
            {wishlistItems.map((item, index) => (
              <ProductCard
                key={item.id || index}
                product={item}
                index={index}
                onRemoveWishlist={() => removeFromWishlist(item.id, item.name)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WishlistPage;
