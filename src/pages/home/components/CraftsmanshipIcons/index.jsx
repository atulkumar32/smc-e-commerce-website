import { craftFeatures } from '../../homeData';
import './style.scss';

// Inline SVG icons keyed by name to avoid Material Symbols CDN dependency
const ICONS = {
  shield: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  water_drop: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2C6 9 4 13.5 4 16a8 8 0 0016 0c0-2.5-2-7-8-14z" />
    </svg>
  ),
  workspace_premium: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="6" />
      <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
    </svg>
  ),
};

function CraftsmanshipIcons() {
  return (
    <section className="craft" aria-labelledby="craft-heading">
      {/* Dot pattern bg */}
      <div className="craft__dots-bg" aria-hidden="true" />

      <div className="craft__container">
        <h2 className="craft__sr-heading" id="craft-heading">
          Our Craftsmanship Promise
        </h2>
        <div className="craft__grid">
          {craftFeatures.map((feat) => (
            <div key={feat.id} className="craft__item">
              <div className="craft__icon-wrap" aria-hidden="true">
                {ICONS[feat.icon]}
              </div>
              <h3 className="craft__title">{feat.title}</h3>
              <p className="craft__desc">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CraftsmanshipIcons;
