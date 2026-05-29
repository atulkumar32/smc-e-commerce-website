import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { heroSlides } from '../../homeData';
import './style.scss';

function HeroSection() {
  const [active, setActive] = useState(0);
  const timerRef = useRef(null);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  const goTo = (idx) => {
    clearInterval(timerRef.current);
    setActive(idx);
    startTimer();
  };

  const slide = heroSlides[active];

  return (
    <section className="hero" aria-label="Hero banner">
      <div
        className="hero__bg"
        style={{ backgroundImage: `url('${slide.image}')` }}
        role="img"
        aria-label={slide.alt}
      >
        <div className="hero__overlay" />
        <div className="hero__content">
          <span className="hero__badge">{slide.badge}</span>
          <h1 className="hero__heading">{slide.heading}</h1>
          <p className="hero__subtext">{slide.subtext}</p>
          <div className="hero__actions">
            <Link to="/products" className="hero__btn hero__btn--primary">
              Shop Now
            </Link>
            <Link to="/about" className="hero__btn hero__btn--outline">
              Lookbook
            </Link>
          </div>
        </div>
      </div>

      {/* Dots */}
      {heroSlides.length > 1 && (
        <div className="hero__dots" aria-label="Slide indicators">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              className={`hero__dot${i === active ? ' is-active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default HeroSection;
