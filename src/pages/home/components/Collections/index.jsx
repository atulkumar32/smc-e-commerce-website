import { Link } from 'react-router-dom';
import { collections } from '../../homeData';
import './style.scss';

function Collections() {
  return (
    <section className="collections" aria-labelledby="collections-heading">
      <div className="collections__container">
        <div className="collections__header">
          <span className="collections__eyebrow">Curated Selections</span>
          <h2 className="collections__heading" id="collections-heading">
            Explore Our Collections
          </h2>
        </div>

        <div className="collections__grid">
          {collections.map((col) => (
            <div key={col.id} className="collections__card">
              <img
                src={col.image}
                alt={col.alt}
                className="collections__card-img"
                loading="lazy"
              />
              <div className="collections__card-overlay" aria-hidden="true" />
              <div className="collections__card-body">
                <h3 className="collections__card-title">{col.title}</h3>
                <p className="collections__card-sub">{col.subtitle}</p>
                <Link
                  to={col.to}
                  className="collections__card-btn"
                  aria-label={`View all ${col.title}`}
                >
                  View All
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Collections;
