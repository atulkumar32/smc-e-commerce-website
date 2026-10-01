import { useState, useEffect, useRef } from 'react';
import slide1 from '../../../assets/auth/auth_school_backpack.jpg';
import slide2 from '../../../assets/auth/auth_slide_2.jpg';
import slide3 from '../../../assets/auth/auth_slide_3.jpg';
import slide4 from '../../../assets/auth/auth_slide_4.jpg';
import slide5 from '../../../assets/hero/banner_school.jpg';

const SLIDES = [
  {
    image: slide1,
    alt: 'Royal blue and black student school backpack with textbooks on school campus',
    caption: 'Ergonomic Spinal Support',
  },
  {
    image: slide2,
    alt: 'Happy student walking outdoors on school campus with comfortable school bag',
    caption: 'Designed for Every Student Journey',
  },
  {
    image: slide3,
    alt: 'Modern backpack on classroom study desk with notes and water bottle',
    caption: 'Classroom & Study Ready',
  },
  {
    image: slide4,
    alt: 'Colorful vibrant school backpacks lineup on display',
    caption: 'Vibrant Colors & Modern Styles',
  },
  {
    image: slide5,
    alt: 'Durable heritage school satchel and backpacks',
    caption: 'Generational Craft & Durability',
  },
];

export default function AuthCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isPaused) return undefined;

    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 3800);

    return () => clearInterval(timerRef.current);
  }, [isPaused]);

  const goToSlide = (idx) => {
    setCurrent(idx);
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  return (
    <div
      className="smc-auth__carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label="School Bags Showcase"
    >
      <div className="smc-auth__carousel-track">
        {SLIDES.map((slide, idx) => {
          const isActive = idx === current;
          return (
            <div
              key={idx}
              className={`smc-auth__carousel-slide${isActive ? ' is-active' : ''}`}
              aria-hidden={!isActive}
            >
              <img
                src={slide.image}
                alt={slide.alt}
                className="smc-auth__carousel-img"
                loading={idx === 0 ? 'eager' : 'lazy'}
              />
              <div className="smc-auth__carousel-caption">
                <span>{slide.caption}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      <button
        type="button"
        className="smc-auth__carousel-nav smc-auth__carousel-nav--prev"
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        ‹
      </button>
      <button
        type="button"
        className="smc-auth__carousel-nav smc-auth__carousel-nav--next"
        onClick={nextSlide}
        aria-label="Next slide"
      >
        ›
      </button>

      {/* Pagination Dots */}
      <div className="smc-auth__carousel-dots" role="tablist">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            type="button"
            role="tab"
            aria-selected={idx === current}
            aria-label={`Go to slide ${idx + 1}`}
            className={`smc-auth__carousel-dot${idx === current ? ' is-active' : ''}`}
            onClick={() => goToSlide(idx)}
          />
        ))}
      </div>
    </div>
  );
}
