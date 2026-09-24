import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import bannerWomanBackpack from '../../../../assets/models/banner_woman_backpack.jpg';
import bannerOfficeBrown from '../../../../assets/models/banner_office_brown.jpg';
import bannerOfficeBlack from '../../../../assets/models/banner_office_black.jpg';
import bannerManLaptop from '../../../../assets/models/banner_man_laptop.jpg';
import './style.scss';

const AUTOPLAY_INTERVAL = 6000;

const SPOTLIGHT_BANNERS = [
   {
    id: 'man-laptop',
    modelBadge: 'HERITAGE ATELIER',
    categoryName: 'Executive Briefcase',
    title: 'Executive Laptop Briefcase',
    tagline: 'Full-Grain Texture • Padded Protection',
    sub: 'Sophisticated executive shoulder bag tailored for senior leadership, business travels, and meetings.',
    features: [
      'Full-Grain Leather Touch Finish',
      'Reinforced Padded Shoulder Sling',
      'Organized Document Dividers',
      'Heavy-Duty Brass Hardware',
    ],
    ctaText: 'SHOP EXECUTIVE BRIEFCASES',
    ctaLink: '/products?category_name=Laptop+Bags',
    image: bannerManLaptop,
    alt: 'Brand ambassador with executive laptop briefcase leaning on car',
  },
  {
    id: 'woman-backpack',
    modelBadge: 'MODIVO EVERYDAY',
    categoryName: 'Everyday Backpack',
    title: 'The Modivo Office Backpack',
    tagline: 'Ergonomic Spine Support • Fits 15.6" Laptop',
    sub: 'Contoured shoulder comfort and weatherproof fabric crafted for daily office, campus, and city commutes.',
    features: [
      '15.6" Padded Tech Compartment',
      'Contoured Orthopedic Shoulder Straps',
      'Water-Repellent Ballistic Poly',
      'Dual Quick-Access Bottle Pockets',
    ],
    ctaText: 'SHOP OFFICE BACKPACKS',
    ctaLink: '/products?category_name=Backpacks',
    image: bannerWomanBackpack,
    alt: 'Brand ambassador with Modivo everyday office backpack',
  },
  {
    id: 'office-brown',
    modelBadge: 'GOOFI EXECUTIVE',
    categoryName: 'Leather Messenger',
    title: 'The Leather Office Messenger',
    tagline: 'Cognac PU Leather • Fits 15.6" Laptop',
    sub: 'Padded shoulder comfort for daily executive commutes, board meetings, and client presentations.',
    features: [
      '15.6" Padded Laptop Sleeve',
      'Ergonomic Leather Shoulder Strap',
      'Water-Resistant PU Shell',
      'Dual Quick-Access Zip Compartments',
    ],
    ctaText: 'SHOP LEATHER MESSENGERS',
    ctaLink: '/products?category_name=Laptop+Bags',
    image: bannerOfficeBrown,
    alt: 'Brand ambassador with cognac brown PU leather office messenger bag on shoulder',
  },
  {
    id: 'office-black',
    modelBadge: 'MODERN TECH',
    categoryName: 'Tech Shoulder Bag',
    title: 'Sleek Black Office Bag',
    tagline: 'Ultra-Slim Profile • Ballistic Water-Resistant Fabric',
    sub: 'Streamlined cross-body shoulder comfort designed for tech professionals and rapid city commuting.',
    features: [
      'Ultra-Slim Lightweight Profile',
      'Ballistic Water-Resistant Fabric',
      'Ergonomic Wide Shoulder Strap',
      'Dedicated Tablet & Charger Sleeves',
    ],
    ctaText: 'SHOP TECH BAGS',
    ctaLink: '/products?category_name=Laptop+Bags',
    image: bannerOfficeBlack,
    alt: 'Brand ambassador with sleek obsidian black tech office shoulder bag',
  },
 
];

export default function VBrandSpotlight() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const activeBanner = SPOTLIGHT_BANNERS[activeIndex];

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % SPOTLIGHT_BANNERS.length);
    setAnimKey((k) => k + 1);
  }, []);

  const goToPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + SPOTLIGHT_BANNERS.length) % SPOTLIGHT_BANNERS.length);
    setAnimKey((k) => k + 1);
  }, []);

  const selectBanner = (index) => {
    if (index !== activeIndex) {
      setActiveIndex(index);
      setAnimKey((k) => k + 1);
    }
  };

  // Autoplay with hover pause
  useEffect(() => {
    if (isPaused) return undefined;
    const timer = setInterval(goToNext, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [isPaused, goToNext]);

  return (
    <section
      className="v-section v-spotlight"
      aria-label="Brand Ambassador Office Bag Showcase"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="v-spotlight__container">
        {/* Section Header */}
        <div className="v-spotlight__head">
          <div className="v-spotlight__head-left">
            <span className="v-spotlight__eyebrow">OFFICIAL BRAND AMBASSADOR • EXECUTIVE SERIES</span>
            <h2 className="v-spotlight__title">The Office &amp; Laptop Bag Collection</h2>
            <p className="v-spotlight__desc">
              Engineered for modern professionals. Worn on the shoulder with ergonomic comfort, premium leather, and all-weather durability.
            </p>
          </div>
          <div className="v-spotlight__nav-controls">
            <button
              type="button"
              className="v-spotlight__nav-btn"
              onClick={goToPrev}
              aria-label="Previous office bag banner"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <span className="v-spotlight__counter">
              <strong>{String(activeIndex + 1).padStart(2, '0')}</strong>
              <small>/ {String(SPOTLIGHT_BANNERS.length).padStart(2, '0')}</small>
            </span>
            <button
              type="button"
              className="v-spotlight__nav-btn"
              onClick={goToNext}
              aria-label="Next office bag banner"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Featured Showcase Stage */}
        <div className="v-spotlight__stage">
          <div
            className="v-spotlight__banner-img-wrap"
            role="img"
            aria-label={activeBanner.alt}
          >
            <img
              key={`img-${animKey}`}
              src={activeBanner.image}
              alt={activeBanner.alt}
              className="v-spotlight__banner-img"
              loading="lazy"
            />
            {/* Ambient Gradient Scrim */}
            <div className="v-spotlight__scrim" />
          </div>

          {/* Bottom Left Corner: ONLY Title & 2 Highlighted Buttons */}
          <div className="v-spotlight__bottom-left" key={`content-${animKey}`}>
            <span className="v-spotlight__eyebrow-badge">{activeBanner.modelBadge}</span>
            <h3 className="v-spotlight__card-title">{activeBanner.title}</h3>

            <div className="v-spotlight__actions">
              {/* 1. Shop Now Button with Highlighted Movement */}
              <Link
                to={activeBanner.ctaLink}
                className="v-spotlight__btn v-spotlight__btn--shop"
                aria-label={`Shop Now for ${activeBanner.title}`}
              >
                <span className="v-spotlight__btn-sheen" aria-hidden="true" />
                <span className="v-spotlight__btn-text">Shop Now</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>

              {/* 2. View All Collections Button with Highlighted Movement */}
              <Link
                to="/products"
                className="v-spotlight__btn v-spotlight__btn--view"
                aria-label="View All Collections"
              >
                <span className="v-spotlight__btn-sheen" aria-hidden="true" />
                <span className="v-spotlight__btn-text">View All Collections</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 4-Thumbnail Selector Strip — Different Bag Each Time */}
        <div className="v-spotlight__thumbs-grid">
          {SPOTLIGHT_BANNERS.map((banner, index) => {
            const isSelected = index === activeIndex;
            return (
              <button
                key={banner.id}
                type="button"
                className={`v-spotlight__thumb${isSelected ? ' is-active' : ''}`}
                onClick={() => selectBanner(index)}
                aria-selected={isSelected}
                aria-label={`Show ${banner.title}`}
              >
                <div className="v-spotlight__thumb-img-box">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="v-spotlight__thumb-img"
                    loading="lazy"
                  />
                  <span className="v-spotlight__thumb-pill">{banner.modelBadge}</span>
                </div>
                <div className="v-spotlight__thumb-info">
                  <span className="v-spotlight__thumb-cat">{banner.categoryName}</span>
                  <strong className="v-spotlight__thumb-title">{banner.title}</strong>
                </div>
                {isSelected && (
                  <span
                    key={`progress-${animKey}`}
                    className={`v-spotlight__thumb-progress${isPaused ? ' is-paused' : ''}`}
                    style={{ animationDuration: `${AUTOPLAY_INTERVAL}ms` }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
