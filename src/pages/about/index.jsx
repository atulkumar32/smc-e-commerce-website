import { Link } from 'react-router-dom';
import craftAtelier from '../../assets/about/craft_atelier.jpg';
import { useStaggerReveal } from '../../components/StaggerReveal';
import './style.scss';

const STATS = [
  { value: '25+', label: 'Years of Mastery', sub: 'Established in 1998' },
  { value: '1M+', label: 'Happy Journeys', sub: 'Students & Travelers nationwide' },
  { value: '150+', label: 'Artisanal Designs', sub: 'School, Tech & Travel' },
  { value: '100%', label: 'Quality Inspected', sub: '15-point atelier verification' },
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

function AboutPage() {
  const statsRef = useStaggerReveal({ selector: '.about-v__stat', staggerDelay: 80 });
  const pillarsRef = useStaggerReveal({ selector: '.about-v__pillar-card', staggerDelay: 90 });
  const timelineRef = useStaggerReveal({ selector: '.about-v__milestone', staggerDelay: 100 });

  return (
    <div className="about-v">
      {/* ── Page Hero Header ── */}
      <section className="about-v__hero">
        <div className="about-v__hero-inner">
          <nav className="about-v__breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="about-v__bc-sep">/</span>
            <span className="about-v__bc-current">About Us</span>
          </nav>

          <span className="about-v__eyebrow">EST. 1998 • HERITAGE &amp; INNOVATION</span>

          <h1 className="about-v__title">
            Designed for Every Journey.<br />
            Built for Everyday Confidence.
          </h1>

          <p className="about-v__subtitle">
            For over two decades, Shree Mahaveer Collections has united classical Indian
            craftsmanship with modern ergonomic engineering to create bags that endure life&apos;s
            greatest adventures.
          </p>
        </div>
      </section>

      {/* ── Stats Highlight Ribbon ── */}
      <section className="about-v__stats-section">
        <div className="about-v__container">
          <div className="about-v__stats-grid" ref={statsRef}>
            {STATS.map((s, i) => (
              <div key={i} className="about-v__stat">
                <span className="about-v__stat-val">{s.value}</span>
                <span className="about-v__stat-label">{s.label}</span>
                <span className="about-v__stat-sub">{s.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Story Section (Artisan & Heritage) ── */}
      <section className="about-v__story-section">
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

            {/* Right Story Visual */}
            <div className="about-v__story-visual">
              <div className="about-v__img-frame">
                <img
                  src={craftAtelier}
                  alt="Master craftsman hand-stitching a durable heritage backpack"
                  className="about-v__img"
                  loading="lazy"
                />
                <div className="about-v__img-badge">
                  <strong>100%</strong>
                  <span>Atelier Verified Quality</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── The Four Pillars ── */}
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Evolution & Milestones ── */}
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Brand Call to Action Banner ── */}
      <section className="about-v__cta-banner">
        <div className="about-v__container">
          <div className="about-v__cta-card">
            <div className="about-v__cta-text">
              <span className="about-v__cta-tag">EXPERIENCE THE CRAFT</span>
              <h2 className="about-v__cta-title">Find Your Perfect Bag Today</h2>
              <p className="about-v__cta-sub">
                Explore our full spectrum of student school bags, executive laptop carry, and weekend duffles.
              </p>
            </div>
            <div className="about-v__cta-actions">
              <Link to="/products" className="about-v__btn about-v__btn--gold">
                EXPLORE ALL COLLECTIONS →
              </Link>
              <Link to="/contact" className="about-v__btn about-v__btn--ghost">
                CONTACT OUR ATELIER
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
