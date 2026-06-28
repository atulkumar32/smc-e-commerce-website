import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { heroSlides } from '../../homeData';
import './style.scss';

function HeroSection() {
  const [active, setActive]       = useState(0);
  const [animating, setAnimating] = useState(false); // cross-fade in progress
  const timerRef = useRef(null);

  // ── Auto-advance ──────────────────────────────────────────────
  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      advance();
    }, 5500);
  };

  const advance = () => {
    if (heroSlides.length <= 1) return;
    setAnimating(true);
    setTimeout(() => {
      setActive((prev) => (prev + 1) % heroSlides.length);
      setAnimating(false);
    }, 400); // half of the CSS fade duration
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = (idx) => {
    if (idx === active) return;
    clearInterval(timerRef.current);
    setAnimating(true);
    setTimeout(() => {
      setActive(idx);
      setAnimating(false);
      startTimer();
    }, 400);
  };

  const slide = heroSlides[active];

  return (
    <section className="hero" aria-label="Hero banner">
      {/* ── Background images (all stacked, only active is visible) ── */}
      {heroSlides.map((s, i) => (
        <div
          key={s.id}
          className={`hero__bg${i === active ? ' is-active' : ''}`}
          style={{ backgroundImage: `url('${s.image}')` }}
          role="img"
          aria-label={s.alt}
          aria-hidden={i !== active}
        />
      ))}

      <div className="hero__overlay" />

      {/* ── Content — entrance animation on page load, fade on slide change ── */}
      <div
        className={`hero__content${animating ? ' is-fading' : ''}`}
        key={active} // re-mounts component → triggers CSS entrance animation
      >
        <span className="hero__badge hero__anim-1">{slide.badge}</span>
        <h1 className="hero__heading hero__anim-2">{slide.heading}</h1>
        <p className="hero__subtext hero__anim-3">{slide.subtext}</p>
        <div className="hero__actions hero__anim-4">
          <Link to="/products" className="hero__btn hero__btn--primary">
            Shop Now
          </Link>
          <Link to="/about" className="hero__btn hero__btn--outline">
            Lookbook
          </Link>
        </div>
      </div>

      {/* ── Slide dots ── */}
      {heroSlides.length > 1 && (
        <div className="hero__dots" aria-label="Slide indicators">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              className={`hero__dot${i === active ? ' is-active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === active ? 'true' : undefined}
            />
          ))}
        </div>
      )}

      {/* ── Prev / Next arrows ── */}
      {heroSlides.length > 1 && (
        <>
          <button
            className="hero__arrow hero__arrow--prev"
            onClick={() => goTo((active - 1 + heroSlides.length) % heroSlides.length)}
            aria-label="Previous slide"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
              strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            className="hero__arrow hero__arrow--next"
            onClick={() => goTo((active + 1) % heroSlides.length)}
            aria-label="Next slide"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
              strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}
    </section>
  );
}

export default HeroSection;
