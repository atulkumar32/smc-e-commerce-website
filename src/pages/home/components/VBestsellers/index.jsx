import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../../../context/CartContext';

// ── Heart icon ────────────────────────────────────────────────
const HeartIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
    <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 10-7.8 7.8L12 22l8.8-9.6a5.5 5.5 0 000-7.8z"/>
  </svg>
);
const CheckCircle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const PRODUCTS = [
  { id: 'bs1', name: 'Classic 30L Backpack for Boys & Girls',          brand: 'SMC', badge: 'Best Seller', price: 999,  mrp: 1999, rating: 4.7, reviews: '1,248', img: 'https://images.unsplash.com/photo-1622560480654-d96214fdc887?auto=format&fit=crop&w=700&q=80' },
  { id: 'bs2', name: 'Korean Style School Backpack for Girls',         brand: 'SMC', badge: 'New Arrival', price: 799,  mrp: 1499, rating: 4.6, reviews: '856',   img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=80' },
  { id: 'bs3', name: 'Premium Laptop Backpack up to 15.6 Inch',        brand: 'SMC', badge: 'Trending',    price: 1299, mrp: 2499, rating: 4.8, reviews: '642',   img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=700&q=80' },
  { id: 'bs4', name: 'Elegant Tote Bag for Office & Daily Use',        brand: 'SMC', badge: 'Best Seller', price: 899,  mrp: 1799, rating: 4.6, reviews: '421',   img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=700&q=80' },
];

const Stars = ({ n }) => (
  <span className="v-card__rating">
    {'★'.repeat(Math.floor(n))}{'☆'.repeat(5 - Math.floor(n))}
    <span>{n} ({PRODUCTS.find(p => p.rating === n)?.reviews ?? ''})</span>
  </span>
);

const fmt = (v) => `₹${Number(v).toLocaleString('en-IN')}`;
const disc = (p, m) => Math.round((1 - p / m) * 100);

export default function VBestsellers() {
  const { addItem, toggleWishlist, isWishlisted } = useCart();
  const [added, setAdded] = useState({});

  const handleAdd = (p) => {
    addItem({ ...p, id: p.id, price: p.price, image: p.img, quantity: 1 });
    setAdded(prev => ({ ...prev, [p.id]: true }));
    setTimeout(() => setAdded(prev => ({ ...prev, [p.id]: false })), 1800);
  };

  return (
    <section className="v-section" style={{ paddingTop: 20 }}>
      <div className="v-section__container">
        <div className="v-section__header">
          <h2 className="v-section__title">Bestsellers</h2>
          <Link to="/products" className="v-section__view-all">View All →</Link>
        </div>

        <div className="v-products__grid">
          {PRODUCTS.map((p) => {
            const wished = isWishlisted(p.id);
            const justAdded = added[p.id];
            return (
              <article key={p.id} className="v-card">
                <div className="v-card__img-wrap">
                  {p.badge && <span className="v-card__badge">{p.badge}</span>}
                  <button
                    className={`v-card__wish${wished ? ' v-card__wish--on' : ''}`}
                    onClick={() => toggleWishlist({ id: p.id, name: p.name, price: p.price, image: p.img })}
                    aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <HeartIcon filled={wished} />
                  </button>
                  <img src={p.img} alt={p.name} className="v-card__img" loading="lazy" />
                  <Link to="/products" className="v-card__quick">QUICK VIEW</Link>
                </div>

                <div className="v-card__body">
                  <p className="v-card__brand">{p.brand}</p>
                  <p className="v-card__name">{p.name}</p>
                  <div className="v-card__rating">
                    {'★'.repeat(Math.floor(p.rating))}
                    <span>{p.rating} ({p.reviews})</span>
                  </div>
                  <div className="v-card__price">
                    <strong className="v-card__current">{fmt(p.price)}</strong>
                    <span className="v-card__mrp">{fmt(p.mrp)}</span>
                    <span className="v-card__off">{disc(p.price, p.mrp)}% OFF</span>
                  </div>
                  <p className="v-card__delivery">
                    <CheckCircle /> Free Delivery
                  </p>
                  <button
                    className="v-card__add"
                    onClick={() => handleAdd(p)}
                  >
                    {justAdded ? '✓ ADDED' : 'ADD TO CART'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
