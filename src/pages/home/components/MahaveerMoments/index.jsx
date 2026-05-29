import { useState } from 'react';
import { moments } from '../../homeData';
import './style.scss';

function MahaveerMoments() {
  const [hovered, setHovered] = useState(null);

  return (
    <section className="moments" aria-labelledby="moments-heading">
      <div className="moments__container">
        <div className="moments__header">
          <span className="moments__eyebrow">#MahaveerMoments</span>
          <h2 className="moments__heading" id="moments-heading">
            Join the Heritage
          </h2>
          <p className="moments__subtext">
            See how our community carries their Mahaveer pieces around the world.
          </p>
        </div>

        <div className="moments__grid">
          {moments.map((item) => (
            <div
              key={item.id}
              className="moments__cell"
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <img
                src={item.image}
                alt={item.alt}
                className="moments__img"
                loading="lazy"
              />
              <div
                className={`moments__overlay${hovered === item.id ? ' is-visible' : ''}`}
                aria-hidden="true"
              >
                {/* Heart icon */}
                <svg width="24" height="24" viewBox="0 0 24 24"
                  fill="currentColor" aria-hidden="true">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default MahaveerMoments;
