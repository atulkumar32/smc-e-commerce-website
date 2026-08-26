/**
 * HeroSlider — Flipkart-style double-panel auto-playing hero banner
 *
 * Left panel  : main large slide (auto-plays every 4s)
 * Right panel : two stacked smaller slides (auto-play independently)
 *
 * Dummy data until CMS/API provides real banners.
 */
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './index.scss';

// ── Dummy slides ──────────────────────────────────────────────────────────────
const MAIN_SLIDES = [
  {
    id: 1,
    bg: 'linear-gradient(135deg, #001F3F 0%, #0d3b6e 100%)',
    badge: 'NEW ARRIVALS',
    headline: 'Back to School\nCollection 2026',
    sub: 'Lightweight, durable & stylish bags for every student',
    cta: 'Shop Now',
    ctaTo: '/products/school-bags',
    accent: '#D4AF37',
    img: null,
  },
  {
    id: 2,
    bg: 'linear-gradient(135deg, #1a3a1a 0%, #2e7d32 100%)',
    badge: 'UP TO 40% OFF',
    headline: 'Premium Laptop\nBags & Backpacks',
    sub: 'Professional style meets everyday comfort',
    cta: 'Explore Deals',
    ctaTo: '/products',
    accent: '#ffd54f',
    img: null,
  },
  {
    id: 3,
    bg: 'linear-gradient(135deg, #4a0a2a 0%, #880e4f 100%)',
    badge: 'TRENDING',
    headline: 'Luxury Purses &\nHandbags',
    sub: 'Crafted with care — elegance for every occasion',
    cta: 'View Collection',
    ctaTo: '/products',
    accent: '#D4AF37',
    img: null,
  },
];

const SIDE_TOP = [
  { id: 1, bg: '#e3f2fd', text: '🎒 School Bags — Flat ₹200 Off', sub: 'On orders above ₹999', to: '/products/school-bags', color: '#1565c0' },
  { id: 2, bg: '#fff3e0', text: '💼 Laptop Bags — New Arrivals', sub: 'Starting from ₹799', to: '/products', color: '#e65100' },
];

const SIDE_BOTTOM = [
  { id: 1, bg: '#fce4ec', text: '👛 Purses & Wallets Sale', sub: 'Up to 30% off', to: '/products', color: '#880e4f' },
  { id: 2, bg: '#e8f5e9', text: '🚚 Free Delivery Above ₹999', sub: 'Pan India shipping', to: '/products', color: '#1b5e20' },
];

// ── Single slide component ────────────────────────────────────────────────────
function MainSlide({ slide }) {
  return (
    <div className="hs__main-slide" style={{ background: slide.bg }}>
      <div className="hs__main-content">
        <span className="hs__badge" style={{ background: slide.accent, color: '#001F3F' }}>
          {slide.badge}
        </span>
        <h2 className="hs__headline">
          {slide.headline.split('\n').map((line, i) => (
            <span key={i}>{line}<br /></span>
          ))}
        </h2>
        <p className="hs__sub">{slide.sub}</p>
        <Link to={slide.ctaTo} className="hs__cta" style={{ background: slide.accent, color: '#001F3F' }}>
          {slide.cta} →
        </Link>
      </div>
    </div>
  );
}

function SideSlide({ slide }) {
  return (
    <Link to={slide.to} className="hs__side-slide" style={{ background: slide.bg }}>
      <p className="hs__side-text" style={{ color: slide.color }}>{slide.text}</p>
      <p className="hs__side-sub">{slide.sub}</p>
    </Link>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
function HeroSlider() {
  const [mainIdx,    setMainIdx]    = useState(0);
  const [topIdx,     setTopIdx]     = useState(0);
  const [bottomIdx,  setBottomIdx]  = useState(0);

  // Auto-play main slide every 4s
  useEffect(() => {
    const t = setInterval(() => {
      setMainIdx((i) => (i + 1) % MAIN_SLIDES.length);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  // Auto-play side slides every 3s (staggered)
  useEffect(() => {
    const t = setInterval(() => {
      setTopIdx((i) => (i + 1) % SIDE_TOP.length);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setBottomIdx((i) => (i + 1) % SIDE_BOTTOM.length);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="hs" aria-label="Featured promotions">
      <div className="hs__inner">

        {/* Main large panel */}
        <div className="hs__main">
          <MainSlide slide={MAIN_SLIDES[mainIdx]} />

          {/* Dot indicators */}
          <div className="hs__dots" aria-label="Slide indicators">
            {MAIN_SLIDES.map((_, i) => (
              <button key={i}
                className={`hs__dot${i === mainIdx ? ' hs__dot--active' : ''}`}
                onClick={() => setMainIdx(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Side two-panel column */}
        <div className="hs__side">
          <div className="hs__side-slot">
            <SideSlide slide={SIDE_TOP[topIdx]} />
          </div>
          <div className="hs__side-slot">
            <SideSlide slide={SIDE_BOTTOM[bottomIdx]} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSlider;
