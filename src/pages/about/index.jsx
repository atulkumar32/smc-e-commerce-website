import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import heroBanner from '../../assets/about/hero_banner.jpg';
import craftAtelier from '../../assets/about/craft_atelier.jpg';
import ergonomicLab from '../../assets/about/ergonomic_lab.jpg';
import materialsWaterproof from '../../assets/about/materials_waterproof.jpg';
import { useStaggerReveal } from '../../components/StaggerReveal';
import Breadcrumbs from '../../components/Breadcrumbs';
import './style.scss';

const STATS_DATA = [
  { target: 25, suffix: '+', label: 'Years of Mastery', sub: 'Established in 1998' },
  { target: 1000000, display: '1M+', label: 'Happy Journeys', sub: 'Students & Travelers nationwide' },
  { target: 150, suffix: '+', label: 'Artisanal Designs', sub: 'School, Tech & Travel' },
  { target: 100, suffix: '%', label: 'Quality Inspected', sub: '15-point atelier verification' },
];

const HOTSPOTS = [
  {
    id: 1,
    top: '38%',
    left: '26%',
    title: 'Reinforced Bar-Tacking',
    desc: 'Double-locked industrial stitching at every stress joint to withstand 40kg+ daily tension.',
  },
  {
    id: 2,
    top: '64%',
    left: '52%',
    title: 'Waxed Canvas & Ballistic Weave',
    desc: 'Dense, water-repellent weather-proof exterior engineered to endure years of student transit.',
  },
  {
    id: 3,
    top: '76%',
    left: '78%',
    title: 'Solid Brass & YKK Hardware',
    desc: 'Rust-resistant metal buckles and jam-free self-repairing zippers for effortless longevity.',
  },
];

const PILLARS = [
  {
    title: 'Orthopedic Ergonomics',
    desc: 'Engineered with anatomical S-curve straps and weight-dispersion back panels designed to protect growing spines and ensure all-day commuting comfort.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Artisanal Craftsmanship',
    desc: 'Every seam is double-locked, every stress-point reinforced with industrial bar-tacking, and every edge hand-finished for generational durability.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" />
        <path d="M14.31 8l5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16L3.95 6.06M14.31 16H2.83m13.79-4l-5.74 9.94" />
      </svg>
    ),
  },
  {
    title: 'Weatherproof Durability',
    desc: 'Crafted with high-density ballistic nylon and water-repellent canvas, paired with heavy-duty self-repairing zippers that never jam.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
        <path d="M11 13v6M14 15v4" />
      </svg>
    ),
  },
  {
    title: 'Sustainable Longevity',
    desc: 'We stand firmly against disposable fashion. Our bags are designed to accompany you through years of education, career growth, and travel.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      </svg>
    ),
  },
];

const TIMELINE = [
  {
    year: '1998',
    title: 'The Atelier Begins',
    desc: 'Founded in Mumbai as a boutique workshop dedicated to resilient leathercraft and durable school bags.',
  },
  {
    year: '2008',
    title: 'Ergonomic Innovation',
    desc: 'Introduced medical-grade spinal support padding across all student school bag collections.',
  },
  {
    year: '2018',
    title: 'The Executive Series',
    desc: 'Expanded into precision tech backpacks, full-grain leather briefcases, and modular travel carry.',
  },
  {
    year: '2026',
    title: 'A National Benchmark',
    desc: 'Serving millions of conscious students, professionals, and travelers across India with modern functional luxury.',
  },
];

function AnimatedCounter({ target, suffix = '', display = null }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    if (display) {
      setCount(display);
      return;
    }

    let start = 0;
    const duration = 1600;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = target / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target + suffix);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start) + suffix);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [hasStarted, target, suffix, display]);

  return (
    <span ref={ref} className="about-v__stat-val">
      {hasStarted ? (display ? display : count) : `0${suffix}`}
    </span>
  );
}

function AboutPage() {
  const statsRef = useStaggerReveal({ selector: '.about-v__stat', staggerDelay: 90 });
  const pillarsRef = useStaggerReveal({ selector: '.about-v__pillar-card', staggerDelay: 100 });
  const timelineRef = useStaggerReveal({ selector: '.about-v__milestone', staggerDelay: 120 });
  const showcaseRef = useStaggerReveal({ selector: '.about-v__lab-card', staggerDelay: 130 });

  const [activeHotspot, setActiveHotspot] = useState(null);

  return (
    <div className="about-v">
      {/* ── 1. Animated Hero Section with Cinematic Banner ── */}
      <section className="about-v__hero">
        <div className="about-v__hero-media" aria-hidden="true">
          <img
            src={heroBanner}
            alt="Students and travelers on an urban journey carrying Shree Mahaveer handcrafted backpacks"
            className="about-v__hero-bg-img"
          />
          <div className="about-v__hero-overlay" />
          <div className="about-v__hero-particles" />
        </div>

        <div className="about-v__hero-inner">
          <Breadcrumbs
            variant="dark"
            items={[
              { label: 'Home', to: '/' },
              { label: 'About Us' },
            ]}
          />

          <div className="about-v__hero-badge-wrap">
            <span className="about-v__eyebrow">
              <span className="about-v__eyebrow-dot" />
              EST. 1998 • HERITAGE &amp; INNOVATION
            </span>
          </div>

          <h1 className="about-v__title">
            Designed for Every Journey.<br />
            <span>Built for Everyday Confidence.</span>
          </h1>

          <p className="about-v__subtitle">
            For over two decades, Shree Mahaveer Collections has united classical Indian
            craftsmanship with modern ergonomic engineering to create backpacks and travel carry
            that endure life&apos;s greatest adventures.
          </p>

          <div className="about-v__hero-actions">
            <a href="#atelier-story" className="about-v__btn about-v__btn--gold">
              EXPLORE OUR CRAFT ↓
            </a>
            <Link to="/products" className="about-v__btn about-v__btn--ghost">
              VIEW NEW COLLECTIONS →
            </Link>
          </div>

          {/* Floating Trust Card */}
          <div className="about-v__hero-floating-card">
            <div className="about-v__floating-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <div>
              <strong>India’s Premier Atelier</strong>
              <span>100% Orthopedic &amp; Bar-Tack Certified</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Animated Stats Highlight Ribbon ── */}
      <section className="about-v__stats-section">
        <div className="about-v__container">
          <div className="about-v__stats-grid" ref={statsRef}>
            {STATS_DATA.map((s, i) => (
              <div key={i} className="about-v__stat">
                <AnimatedCounter target={s.target} suffix={s.suffix} display={s.display} />
                <span className="about-v__stat-label">{s.label}</span>
                <span className="about-v__stat-sub">{s.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Interactive Story & Atelier Craftsmanship ── */}
      <section id="atelier-story" className="about-v__story-section">
        <div className="about-v__container">
          <div className="about-v__story-grid">
            {/* Left Story Text */}
            <div className="about-v__story-content">
              <span className="about-v__section-tag">THE MAHAVEER LEGACY</span>
              <h2 className="about-v__section-heading">
                Where Artisanal Mastery Meets Everyday Purpose
              </h2>

              <p className="about-v__lead">
                In 1998, Shree Mahaveer Collections started with a simple belief:
                a bag is not just an accessory; it is your everyday companion that carries your ambitions,
                books, tech, and memories.
              </p>

              <p>
                What began as a small Mumbai workshop crafting durable school satchels has grown into
                one of India’s most trusted lifestyle luggage and backpack brands. Every piece that leaves
                our atelier reflects thousands of hours spent perfecting ergonomics, material stress
                testing, and precision stitching.
              </p>

              <blockquote className="about-v__quote">
                &ldquo;We don&apos;t build bags for seasons; we build them for chapters of life.&rdquo;
                <cite>— Master Craftsman, Shree Mahaveer Collections</cite>
              </blockquote>

              <div className="about-v__story-badges">
                <div className="about-v__badge-item">
                  <span className="about-v__badge-dot" />
                  <span>Hypoallergenic &amp; Breathable Fabrics</span>
                </div>
                <div className="about-v__badge-item">
                  <span className="about-v__badge-dot" />
                  <span>Reinforced YKK-Grade Hardware</span>
                </div>
                <div className="about-v__badge-item">
                  <span className="about-v__badge-dot" />
                  <span>Orthopedic Spine-Safety Tested</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Visual with Hotspots */}
            <div className="about-v__story-visual">
              <div className="about-v__img-frame">
                <img
                  src={craftAtelier}
                  alt="Master artisans hand-stitching a durable heritage backpack in the atelier"
                  className="about-v__img"
                  loading="lazy"
                />

                {/* Interactive Hotspot Pins */}
                {HOTSPOTS.map((pin) => {
                  const isActive = activeHotspot === pin.id;
                  return (
                    <div
                      key={pin.id}
                      className={`about-v__hotspot${isActive ? ' is-active' : ''}`}
                      style={{ top: pin.top, left: pin.left }}
                      onMouseEnter={() => setActiveHotspot(pin.id)}
                      onMouseLeave={() => setActiveHotspot(null)}
                      onClick={() => setActiveHotspot(isActive ? null : pin.id)}
                    >
                      <button
                        type="button"
                        className="about-v__hotspot-btn"
                        aria-label={pin.title}
                      >
                        <span className="about-v__hotspot-ring" />
                        <span className="about-v__hotspot-core" />
                      </button>

                      <div className="about-v__hotspot-card">
                        <strong className="about-v__hotspot-title">{pin.title}</strong>
                        <p className="about-v__hotspot-desc">{pin.desc}</p>
                      </div>
                    </div>
                  );
                })}

                <div className="about-v__img-badge">
                  <strong>100%</strong>
                  <span>Atelier Verified Quality</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Engineering & Innovation Multi-Banner Dual Showcase ── */}
      <section className="about-v__lab-showcase">
        <div className="about-v__container">
          <div className="about-v__lab-header">
            <span className="about-v__section-tag">PRECISION ENGINEERING</span>
            <h2 className="about-v__section-heading">Science Behind Every Seam</h2>
            <p className="about-v__section-sub">
              From orthopedic spinal alignment to weatherproof ballistic membranes, explore how our laboratory tests guarantee lifelong endurance.
            </p>
          </div>

          <div className="about-v__lab-grid" ref={showcaseRef}>
            {/* Banner Card 1: Ergonomic Lab */}
            <div className="about-v__lab-card">
              <div className="about-v__lab-media">
                <img
                  src={ergonomicLab}
                  alt="Engineering showcase of ergonomic spinal suspension and S-curve straps"
                  className="about-v__lab-img"
                  loading="lazy"
                />
                <span className="about-v__lab-pill">01 / ERGONOMICS</span>
              </div>
              <div className="about-v__lab-content">
                <h3 className="about-v__lab-title">Medical-Grade Spine Protection</h3>
                <p className="about-v__lab-desc">
                  Featuring anatomical S-curve straps, multi-density memory foam, and central Ergo-Flow airflow channels that distribute load evenly across thoracic and lumbar spine zones.
                </p>
                <ul className="about-v__lab-features">
                  <li>
                    <span className="about-v__check-icon">✓</span>
                    <span>35% Spinal Pressure Relief for Students</span>
                  </li>
                  <li>
                    <span className="about-v__check-icon">✓</span>
                    <span>AeroMesh 3D Ventilation Technology</span>
                  </li>
                  <li>
                    <span className="about-v__check-icon">✓</span>
                    <span>Anatomical Weight-Dispersing Chest Clip</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Banner Card 2: Materials & Durability */}
            <div className="about-v__lab-card">
              <div className="about-v__lab-media">
                <img
                  src={materialsWaterproof}
                  alt="Close-up macro of waterproof ballistic canvas with beaded water droplets and brass zipper"
                  className="about-v__lab-img"
                  loading="lazy"
                />
                <span className="about-v__lab-pill">02 / MATERIALS</span>
              </div>
              <div className="about-v__lab-content">
                <h3 className="about-v__lab-title">Weatherproof Ballistic Weave</h3>
                <p className="about-v__lab-desc">
                  Engineered with 1680D ballistic poly-nylon paired with hydrophobic nano-coating. Sudden monsoon showers roll right off, keeping textbooks, laptops, and essentials bone-dry.
                </p>
                <ul className="about-v__lab-features">
                  <li>
                    <span className="about-v__check-icon">✓</span>
                    <span>IPX4 Hydrophobic Rain Barrier</span>
                  </li>
                  <li>
                    <span className="about-v__check-icon">✓</span>
                    <span>Self-Healing Dual Direction Zippers</span>
                  </li>
                  <li>
                    <span className="about-v__check-icon">✓</span>
                    <span>Abrasion-Resistant Reinforced Base</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. The Four Pillars Section ── */}
      <section className="about-v__pillars-section">
        <div className="about-v__container">
          <div className="about-v__pillars-header">
            <span className="about-v__section-tag">OUR CORE PILLARS</span>
            <h2 className="about-v__section-heading">Engineered with Purpose, Crafted with Pride</h2>
            <p className="about-v__section-sub">
              Every design decision is rooted in scientific comfort and timeless durability.
            </p>
          </div>

          <div className="about-v__pillars-grid" ref={pillarsRef}>
            {PILLARS.map((p, i) => (
              <div key={i} className="about-v__pillar-card">
                <span className="about-v__pillar-icon">{p.icon}</span>
                <h3 className="about-v__pillar-title">{p.title}</h3>
                <p className="about-v__pillar-desc">{p.desc}</p>
                <div className="about-v__pillar-glow" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Evolution & Heritage Timeline ── */}
      <section className="about-v__timeline-section">
        <div className="about-v__container">
          <div className="about-v__timeline-header">
            <span className="about-v__section-tag">JOURNEY THROUGH TIME</span>
            <h2 className="about-v__section-heading">25+ Years of Dedicated Innovation</h2>
          </div>

          <div className="about-v__timeline-grid" ref={timelineRef}>
            {TIMELINE.map((item, i) => (
              <div key={i} className="about-v__milestone">
                <span className="about-v__milestone-year">{item.year}</span>
                <h4 className="about-v__milestone-title">{item.title}</h4>
                <p className="about-v__milestone-desc">{item.desc}</p>
                <div className="about-v__milestone-node" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Brand Call to Action Banner ── */}
      <section className="about-v__cta-banner">
        <div className="about-v__container">
          <div className="about-v__cta-card">
            <div className="about-v__cta-text">
              <span className="about-v__cta-tag">EXPERIENCE THE CRAFT</span>
              <h2 className="about-v__cta-title">Find Your Perfect Everyday Companion</h2>
              <p className="about-v__cta-sub">
                Explore our full spectrum of student school bags, executive laptop carry, and weekend duffles.
              </p>
            </div>
            <div className="about-v__cta-actions">
              <Link to="/products" className="about-v__btn about-v__btn--gold">
                EXPLORE ALL COLLECTIONS →
              </Link>
              <Link to="/contact" className="about-v__btn about-v__btn--ghost">
                VISIT OUR SHOWROOM
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
