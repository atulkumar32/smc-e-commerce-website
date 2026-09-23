import { Link } from 'react-router-dom';

const CATS = [
  { label: 'Backpacks',   to: '/products?category_name=Backpacks',   img: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=600&q=80' },
  { label: 'Laptop Bags', to: '/products?category_name=Laptop+Bags',  img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80' },
  { label: 'School Bags', to: '/products?category_name=School+Bags',  img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80' },
  { label: 'Ladies Bags', to: '/products?category_name=Ladies+Bags',  img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80' },
  { label: 'Sling Bags',  to: '/products?category_name=Sling+Bags',   img: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=600&q=80' },
  { label: 'Travel Bags', to: '/products?category_name=Travel+Bags',  img: 'https://images.unsplash.com/photo-1553531384-397c80973a0b?auto=format&fit=crop&w=600&q=80' },
];

export default function VCategories() {
  return (
    <section className="v-section">
      <div className="v-section__container">
        <div className="v-section__header">
          <h2 className="v-section__title">Shop By Category</h2>
          <Link to="/products" className="v-section__view-all">View All →</Link>
        </div>

        <div className="v-cats__grid">
          {CATS.map((cat) => (
            <Link key={cat.label} to={cat.to} className="v-cats__card">
              <div className="v-cats__circle">
                <img
                  src={cat.img}
                  alt={cat.label}
                  className="v-cats__img"
                  loading="lazy"
                />
              </div>
              <p className="v-cats__name">{cat.label}</p>
              <span className="v-cats__sub">Shop Now →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
