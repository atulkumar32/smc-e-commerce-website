 import { Link } from 'react-router-dom';

const features = [
  { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z"/></svg>, label: 'Stylish', sub: 'Designs' },
  { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, label: 'Durable', sub: 'Material' },
  { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 7V5a2 2 0 00-4 0v2"/></svg>, label: 'Spacious &', sub: 'Functional' },
  { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 2l-7 20-4-9-9-4z"/></svg>, label: 'Made for', sub: 'Every Journey' },
];

export default function VHero() {
  return (
    <section className="v-hero">
      <div className="v-hero__content">

        {/* ── Text ── */}
        <div className="v-hero__text">
          <p className="v-hero__eyebrow">Bags for a brighter tomorrow</p>

          <h1 className="v-hero__heading">
            Carry Your<br />
            Style.<br />
            Everywhere.
          </h1>

          <p className="v-hero__sub">
            Premium bags designed for school,<br />
            work, travel &amp; everyday life.
          </p>

          <Link to="/products" className="v-hero__cta">
            SHOP NOW
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </Link>

          <div className="v-hero__features">
            {features.map((f, i) => (
              <div key={i} className="v-hero__feature">
                <span className="v-hero__feature-icon">{f.icon}</span>
                <span>{f.label}<br />{f.sub}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Image ── */}
        <div className="v-hero__image" role="img" aria-label="Premium school bag" />
      </div>
    </section>
  );
}
