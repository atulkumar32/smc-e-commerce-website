import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import bannerWomanBackpack from '../../../../assets/models/banner_woman_backpack.jpg';
import bannerOfficeBrown from '../../../../assets/models/banner_office_brown.jpg';
import bannerOfficeBlack from '../../../../assets/models/banner_office_black.jpg';
import bannerManLaptop from '../../../../assets/models/banner_man_laptop.jpg';
import './style.scss';

const SLIDE_INTERVAL = 5500; // 5.5 seconds autoplay

const SIGNATURE_BANNERS = [
  {
    id: 'sig-woman-backpack',
    eyebrow: 'THE SIGNATURE COLLECTION • EVERYDAY LUXURY',
    title: 'The Modivo Everyday Backpack',
    sub: 'Spacious orthopedic volume, weatherproof durability, and contoured shoulder comfort for work and commute.',
    to: '/products?category_name=Backpacks',
    image: bannerWomanBackpack,
    alt: 'Signature Modivo Everyday Backpack with brand ambassador',
  },
  {
    id: 'sig-office-brown',
    eyebrow: 'THE SIGNATURE COLLECTION • EXECUTIVE LEATHER',
    title: 'The Leather Office Messenger',
    sub: 'Cognac PU leather with padded shoulder comfort & 15.6" laptop protection for executive commutes and boardrooms.',
    to: '/products?category_name=Laptop+Bags',
    image: bannerOfficeBrown,
    alt: 'Signature Cognac Leather Office Messenger bag worn on shoulder by brand ambassador',
  },
  {
    id: 'sig-office-black',
    eyebrow: 'THE SIGNATURE COLLECTION • MODERN TECH',
    title: 'Obsidian Tech Shoulder Bag',
    sub: 'Aerodynamic ultra-slim profile in ballistic water-resistant weave engineered for rapid metropolitan transit.',
    to: '/products?category_name=Laptop+Bags',
    image: bannerOfficeBlack,
    alt: 'Signature Obsidian Black Tech Office Shoulder Bag worn by brand ambassador',
  },
  {
    id: 'sig-man-laptop',
    eyebrow: 'THE SIGNATURE COLLECTION • ARTISANAL WORK',
    title: 'Executive Laptop Briefcase',
    sub: 'Handcrafted luxury leather engineered for boardroom excellence, client presentations, and world travel.',
    to: '/products?category_name=Laptop+Bags',
    image: bannerManLaptop,
    alt: 'Signature Executive Leather Laptop Briefcase with brand ambassador',
  },
];

export default function VSignatureCollection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const total = SIGNATURE_BANNERS.length;
  const current = SIGNATURE_BANNERS[activeIndex];

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
    setAnimKey((k) => k + 1);
  }, [total]);

  const goToPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
    setAnimKey((k) => k + 1);
  }, [total]);

  const goToSlide = (index) => {
    if (index !== activeIndex) {
      setActiveIndex(index);
      setAnimKey((k) => k + 1);
    }
  };

  useEffect(() => {
    if (isPaused) return undefined;
    const timer = setInterval(goToNext, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [isPaused, goToNext]);

  return (
    <section
      className="v-sig-banner"
      aria-label="The Signature Collection Full Screen Banner"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Banner Slides */}
      <div className="v-sig-banner__stage">
        {SIGNATURE_BANNERS.map((banner, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={banner.id}
              className={`v-sig-banner__slide${isActive ? ' is-active' : ''}`}
              aria-hidden={!isActive}
            >
              <img
                src={banner.image}
                alt={banner.alt}
                className="v-sig-banner__img"
                loading={index === 0 ? 'eager' : 'lazy'}
              />
              <div className="v-sig-banner__overlay" />
            </div>
          );
        })}
      </div>

      {/* Content Container (Standardized equal margin @include v-container) */}
      <div className="v-sig-banner__container">
        {/* Left Side Bottom Corner: Content + ONLY 2 Buttons */}
        <div className="v-sig-banner__bottom-left" key={`content-${animKey}`}>
          <span className="v-sig-banner__eyebrow">{current.eyebrow}</span>
          <h2 className="v-sig-banner__title">{current.title}</h2>
          <p className="v-sig-banner__sub">{current.sub}</p>

          <div className="v-sig-banner__actions">
            {/* 1. SHOP NOW BUTTON */}
            <Link
              to={current.to}
              className="v-sig-banner__btn v-sig-banner__btn--shop"
              aria-label={`Shop Now for ${current.title}`}
            >
              <span className="v-sig-banner__btn-sheen" aria-hidden="true" />
              <span className="v-sig-banner__btn-text">Shop Now</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>

            {/* 2. VIEW ALL COLLECTIONS BUTTON */}
            <Link
              to="/products"
              className="v-sig-banner__btn v-sig-banner__btn--view"
              aria-label="View All Collections"
            >
              <span className="v-sig-banner__btn-sheen" aria-hidden="true" />
              <span className="v-sig-banner__btn-text">View All Collections</span>
            </Link>
          </div>
        </div>

        {/* Right Side Bottom Corner: Slider Controls */}
        <div className="v-sig-banner__controls">
          {/* Dash Progress Indicators */}
          <div className="v-sig-banner__dashes" role="tablist">
            {SIGNATURE_BANNERS.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`v-sig-banner__dash${i === activeIndex ? ' is-active' : ''}`}
                onClick={() => goToSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                role="tab"
                aria-selected={i === activeIndex}
              >
                {i === activeIndex && (
                  <span
                    key={`dash-${animKey}`}
                    className={`v-sig-banner__dash-fill${isPaused ? ' is-paused' : ''}`}
                    style={{ animationDuration: `${SLIDE_INTERVAL}ms` }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Navigation Arrows */}
          <div className="v-sig-banner__arrows">
            <button
              type="button"
              className="v-sig-banner__arrow-btn"
              onClick={goToPrev}
              aria-label="Previous signature collection banner"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              className="v-sig-banner__arrow-btn"
              onClick={goToNext}
              aria-label="Next signature collection banner"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
