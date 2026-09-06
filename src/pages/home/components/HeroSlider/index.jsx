import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import banner1 from '../../../../assets/homeimages/banner_1.png';
import banner2 from '../../../../assets/homeimages/banner_2.png';
import './index.scss';

const SLIDES = [
  {
    id: 1,
    img: banner1,
    imgAlt: 'Stylish school bags — Shree Mahaveer Collections',
    badge: '🔥 Trending Now',
    badgeBg: '#FFF3C4',
    badgeColor: '#92400E',
    h1: 'Stylish School Bags',
    h2: 'for a',
    h2Blue: 'Brighter',
    h3: 'Tomorrow',
    h3Color: '#E07B00',
    headlineColor: '#0F2137',
    blueWord: '#1561C7',
    sub: 'Comfort, durability and style — because every student deserves the best.',
    subColor: '#2D3748',
    ctaText: 'Shop Now',
    ctaTo: '/products',
    ctaBg: '#F59E0B',
    ctaColor: '#1C1C1C',
    watermark: 'More Colors\nMore Smiles →',
  },
  {
    id: 2,
    img: banner2,
    imgAlt: 'Premium travel bags — Shree Mahaveer Collections',
    badge: '✨ New Arrivals',
    badgeBg: '#DCFCE7',
    badgeColor: '#14532D',
    h1: 'Premium Laptop &',
    h2: 'Travel Bags for',
    h2Blue: 'Every',
    h3: 'Journey',
    h3Color: '#16A34A',
    headlineColor: '#0F2137',
    blueWord: '#1561C7',
    sub: 'Built tough, designed smart — your perfect travel companion across India.',
    subColor: '#2D3748',
    ctaText: 'Explore Now',
    ctaTo: '/products',
    ctaBg: '#16A34A',
    ctaColor: '#FFFFFF',
    watermark: 'More Style\nMore Miles →',
  },
];

const CARDS = [
  {
    id: 1,
    bg: '#EFF6FF',
    iconBg: '#DBEAFE',
    iconColor: '#1D4ED8',
    arrowBg: '#3B82F6',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 8h12l-1 13H7L6 8z"/>
        <path d="M9 8V6a3 3 0 0 1 6 0v2"/>
      </svg>
    ),
    title: 'School Bags',
    hl: 'Flat ₹200 Off',
    sub: 'On orders above ₹999',
    to: '/products',
  },
  {
    id: 2,
    bg: '#F0FDF4',
    iconBg: '#DCFCE7',
    iconColor: '#16A34A',
    arrowBg: '#22C55E',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="1" y="3" width="15" height="13" rx="1"/>
        <path d="M16 8h4l3 5v3h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
    title: 'Free Delivery',
    hl: 'Above ₹999',
    sub: 'On all orders',
    to: '/products',
  },
  {
    id: 3,
    bg: '#FEFCE8',
    iconBg: '#FEF9C3',
    iconColor: '#D97706',
    arrowBg: '#F59E0B',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: 'Safe & Secure',
    hl: 'Payments',
    sub: '100% Secure Checkout',
    to: '/products',
  },
];

const TRUST = [
  {
    id: 1,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    label: 'Premium Quality', sub: 'Long Lasting',
  },
  {
    id: 2,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
    label: 'Fast Delivery', sub: 'Across India',
  },
  {
    id: 3,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    label: 'Trusted by', sub: '1L+ Happy Customers',
  },
];

export default function HeroSlider() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((i) => (i + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const s = SLIDES[active];

  return (
    <section className="hs" aria-label="Hero banner">

      {/* ── Banner (full-bleed image bg) ────────────────────── */}
      <div className="hs__banner">

        {/* Background image layers */}
        {SLIDES.map((sl, i) => (
          <div key={sl.id}
            className={`hs__bg${i === active ? ' hs__bg--on' : ''}`}
            style={{ backgroundImage: `url(${sl.img})` }}
            role="img" aria-label={sl.imgAlt} aria-hidden={i !== active}
          />
        ))}

        {/* White-to-transparent gradient for text readability */}
        <div className="hs__grad" />
        {/* Watermark — top-right */}
        <span className="hs__watermark" key={`wm-${s.id}`}>

          {s.watermark.split('\n').map((l, i) => <span key={i}>{l}</span>)}
        </span>

        {/* ── Inner layout: badge+headline+sub TOP, cta+trust BOTTOM ── */}
        <div className="hs__inner" key={`ct-${s.id}`}>

          {/* TOP section: badge, headline, subtitle */}
          <div className="hs__top">
            <span className="hs__badge"
              style={{ background: s.badgeBg, color: s.badgeColor }}>
              {s.badge}
            </span>

            <h1 className="hs__headline" style={{ marginTop: '20px' }}>
              {/* Line 1 — e.g. "Stylish School Bags" */}
              <span className="hs__hl" style={{ color: s.headlineColor }}>{s.h1}</span>
              {/* Line 2 — "for a Brighter Tomorrow" all on one line */}
              <span className="hs__hl">
                <span style={{ color: s.headlineColor }}>{s.h2}&nbsp;</span>
                <span style={{ color: s.blueWord }}>{s.h2Blue}</span>
                <span style={{ color: s.h3Color }}>&nbsp;{s.h3}</span>
              </span>
            </h1>

            <p className="hs__sub" style={{ color: s.subColor }}>{s.sub}</p>
          </div>

          {/* BOTTOM section: CTA + trust strip + dots — all above image */}
          <div className="hs__bottom">
            <div className="hs__bottom-row">
              {/* CTA button */}
              <Link to={s.ctaTo} className="hs__cta"
                style={{ background: s.ctaBg, color: s.ctaColor }}>
                {s.ctaText}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>

              {/* Trust strip — inline with CTA on desktop */}
              <div className="hs__trust">
                {TRUST.map((t) => (
                  <div key={t.id} className="hs__trust-item">
                    <span className="hs__trust-ico">{t.icon}</span>
                    <span className="hs__trust-txt">
                      <strong>{t.label}</strong>
                      <em>{t.sub}</em>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Slide dots */}
            <div className="hs__dots">
              {SLIDES.map((_, i) => (
                <button key={i}
                  className={`hs__dot${i === active ? ' hs__dot--on' : ''}`}
                  onClick={() => setActive(i)}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

    
    </section>
  );
}
