import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import bannerBackpack from '../../../../assets/hero/banner_backpack.jpg';
import bannerLeather from '../../../../assets/hero/banner_leather.jpg';
import bannerSchool from '../../../../assets/hero/banner_school.jpg';
import './style.scss';

const SLIDE_DURATION = 5500; // 5.5 seconds per slide

const SLIDES = [
  {
    id: 'slide-backpack',
    eyebrow: 'AUTUMN / WINTER 2026 COLLECTION',
    heading: 'CARRY YOUR WORLD.',
    sub: 'ENGINEERED FOR SCHOOL, WORK, TRAVEL & EVERYTHING IN BETWEEN',
    primaryCta: {
      text: 'EXPLORE BACKPACKS',
      to: '/products?category_name=Backpacks',
    },
    secondaryCta: {
      text: 'VIEW BEST SELLERS',
      to: '/products',
    },
    image: bannerBackpack,
    alt: 'Autumn Winter 2026 Minimalist Luxury Backpack',
  },
  {
    id: 'slide-leather',
    eyebrow: 'EXECUTIVE SERIES',
    heading: 'WORK. ORGANIZED.',
    sub: 'PRECISION TECH BACKPACKS & FULL-GRAIN LEATHER BRIEFCASES',
    primaryCta: {
      text: 'SHOP OFFICE COLLECTION',
      to: '/products?category_name=Laptop+Bags',
    },
    secondaryCta: {
      text: 'VIEW BEST SELLERS',
      to: '/products',
    },
    image: bannerLeather,
    alt: 'Executive luxury precision tech backpacks and leather briefcases',
  },
  {
    id: 'slide-school',
    eyebrow: 'BACK TO SCHOOL 2026',
    heading: 'READY FOR EVERY SCHOOL DAY.',
    sub: 'ORTHOPEDIC SPINE PROTECTION & WATERPROOF DURABILITY FOR STUDENTS',
    primaryCta: {
      text: 'SHOP SCHOOL BAGS',
      to: '/products?category_name=School+Bags',
    },
    secondaryCta: {
      text: 'VIEW BEST SELLERS',
      to: '/products',
    },
    image: bannerSchool,
    alt: 'Orthopedic ergonomic school and college backpacks for students',
  },
];

const FEATURES = [
  {
    title: 'Stylish Designs',
    sub: 'Contemporary & Elegant',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z" />
      </svg>
    ),
  },
  {
    title: 'Durable Material',
    sub: 'Built for Daily Rigor',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: 'Spacious & Functional',
    sub: 'Smart Compartments',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
        <path d="M16 7V5a2 2 0 00-4 0v2" />
      </svg>
    ),
  },
  {
    title: 'Made for Every Journey',
    sub: 'School, Work & Travel',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M22 2l-7 20-4-9-9-4z" />
      </svg>
    ),
  },
];

export default function VHero() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const touchStartX = useRef(null);

  const goToNext = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
    setAnimKey((k) => k + 1);
  }, []);

  const goToPrev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    setAnimKey((k) => k + 1);
  }, []);

  const goToSlide = useCallback((index) => {
    if (index !== current) {
      setCurrent(index);
      setAnimKey((k) => k + 1);
    }
  }, [current]);

  // Autoplay with hover pause & resume
  useEffect(() => {
    if (isPaused) return undefined;

    const timer = setInterval(() => {
      goToNext();
    }, SLIDE_DURATION);

    return () => clearInterval(timer);
  }, [isPaused, goToNext]);

  // Touch Swipe for Mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    if (diffX > 45) {
      goToPrev();
    } else if (diffX < -45) {
      goToNext();
    }
    touchStartX.current = null;
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      goToNext();
    } else if (e.key === 'ArrowLeft') {
      goToPrev();
    }
  };

  const activeSlide = SLIDES[current];

  return (
    <section
      className="v-hero-carousel"
      aria-roledescription="carousel"
      aria-label="Featured Collections Carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="v-hero-carousel__stage">
        {/* ── Slides ── */}
        {SLIDES.map((slide, index) => {
          const isActive = index === current;
          return (
            <div
              key={slide.id}
              className={`v-hero-carousel__slide${isActive ? ' is-active' : ''}`}
              aria-hidden={!isActive}
            >
              {/* Background Image Layer */}
              <div
                className="v-hero-carousel__bg"
                style={{ backgroundImage: `url(${slide.image})` }}
                role="img"
                aria-label={slide.alt}
              />

              {/* Gradient Scrim Overlay for perfect legibility */}
              <div className="v-hero-carousel__overlay" />

              {/* Content Box */}
              {isActive && (
                <div className="v-hero-carousel__container">
                  <div className="v-hero-carousel__content">
                    {/* Eyebrow */}
                    <p
                      key={`eyebrow-${animKey}`}
                      className="v-hero-carousel__eyebrow v-hero-carousel__anim-1"
                    >
                      {activeSlide.eyebrow}
                    </p>

                    {/* Heading */}
                    <h1
                      key={`heading-${animKey}`}
                      className="v-hero-carousel__heading v-hero-carousel__anim-2"
                    >
                      {activeSlide.heading}
                    </h1>

                    {/* Subtitle */}
                    <p
                      key={`sub-${animKey}`}
                      className="v-hero-carousel__sub v-hero-carousel__anim-3"
                    >
                      {activeSlide.sub}
                    </p>

                    {/* Action CTAs */}
                    <div
                      key={`actions-${animKey}`}
                      className="v-hero-carousel__actions v-hero-carousel__anim-4"
                    >
                      <Link
                        to={activeSlide.primaryCta.to}
                        className="v-hero-carousel__btn v-hero-carousel__btn--primary"
                      >
                        {activeSlide.primaryCta.text}
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </Link>

                      <Link
                        to={activeSlide.secondaryCta.to}
                        className="v-hero-carousel__btn v-hero-carousel__btn--secondary"
                      >
                        {activeSlide.secondaryCta.text}
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* ── Carousel Bottom Controls (Dashes Left, Arrows Right, constrained to container) ── */}
        <div className="v-hero-carousel__controls">
          <div className="v-hero-carousel__controls-inner">
            {/* ── Dash Progress Indicators (Bottom Left) ── */}
            <div className="v-hero-carousel__dashes" role="tablist" aria-label="Slide indicators">
              {SLIDES.map((slide, index) => {
                const isActive = index === current;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`Go to slide ${index + 1}: ${slide.heading}`}
                    className={`v-hero-carousel__dash${isActive ? ' v-hero-carousel__dash--active' : ''}`}
                    onClick={() => goToSlide(index)}
                  >
                    {isActive && (
                      <span
                        key={`dash-${animKey}`}
                        className={`v-hero-carousel__dash-fill is-animating${
                          isPaused ? ' is-paused' : ''
                        }`}
                        style={{ animationDuration: `${SLIDE_DURATION}ms` }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── Circular Arrow Navigation (Bottom Right) ── */}
            <div className="v-hero-carousel__arrows">
              <button
                type="button"
                className="v-hero-carousel__arrow"
                onClick={goToPrev}
                aria-label="Previous slide"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                type="button"
                className="v-hero-carousel__arrow"
                onClick={goToNext}
                aria-label="Next slide"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Brand Trust & Value Pillars Strip ── */}
      <div className="v-hero-carousel__strip">
        <div className="v-hero-carousel__strip-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="v-hero-carousel__strip-item">
              <span className="v-hero-carousel__strip-icon">{f.icon}</span>
              <div className="v-hero-carousel__strip-text">
                <strong>{f.title}</strong>
                <span>{f.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
