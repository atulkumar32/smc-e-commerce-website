import { useRef } from 'react';
import { newDrops } from '../../homeData';
import './style.scss';

function NewSeasonDrops() {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' });
    }
  };

  return (
    <section className="drops" aria-labelledby="drops-heading">
      <div className="drops__container">
        {/* Header row */}
        <div className="drops__header">
          <div className="drops__header-text">
            <span className="drops__eyebrow">Fresh Arrivals</span>
            <h2 className="drops__heading" id="drops-heading">
              New Season Drops
            </h2>
          </div>
          <div className="drops__nav" aria-label="Scroll products">
            <button
              className="drops__nav-btn"
              onClick={() => scroll(-1)}
              aria-label="Scroll left"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
                strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              className="drops__nav-btn"
              onClick={() => scroll(1)}
              aria-label="Scroll right"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
                strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scroll track */}
        <div className="drops__track" ref={scrollRef}>
          {newDrops.map((product) => (
            <div key={product.id} className="drops__card">
              <div className="drops__card-img-wrap">
                <img
                  src={product.image}
                  alt={product.alt}
                  className="drops__card-img"
                  loading="lazy"
                />
                {product.badge && (
                  <span className="drops__card-badge">{product.badge}</span>
                )}
                <button className="drops__card-add" aria-label={`Quick add ${product.name}`}>
                  Quick Add
                </button>
              </div>
              <h4 className="drops__card-name">{product.name}</h4>
              <p className="drops__card-price">{product.price}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default NewSeasonDrops;
