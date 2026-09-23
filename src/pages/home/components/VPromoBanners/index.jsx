import { Link } from 'react-router-dom';

const BANNERS = [
  {
    id: 1,
    img: 'https://images.unsplash.com/photo-1570659530254-0d9e7b7e4f88?auto=format&fit=crop&w=1200&q=80',
    heading: 'Back to School',
    sub: 'Stylish. Spacious. Durable.',
    cta: 'EXPLORE SCHOOL BAGS →',
    to: '/products?category_name=School+Bags',
  },
  {
    id: 2,
    img: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80',
    heading: 'Bags for Modern Life',
    sub: 'Professional. Functional. Stylish.',
    cta: 'SHOP LAPTOP BAGS →',
    to: '/products?category_name=Laptop+Bags',
  },
];

export default function VPromoBanners() {
  return (
    <section className="v-section">
      <div className="v-section__container">
        <div className="v-promo__grid">
          {BANNERS.map((b) => (
            <div key={b.id} className="v-promo__banner">
              <img src={b.img} alt={b.heading} className="v-promo__img" loading="lazy" />
              <div className="v-promo__overlay">
                <h2 className="v-promo__heading">{b.heading}</h2>
                <p className="v-promo__sub">{b.sub}</p>
                <Link to={b.to} className="v-hero__cta">{b.cta}</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
