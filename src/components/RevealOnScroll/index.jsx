import { useEffect } from 'react';
import './style.scss';

// Mount this once (near the app layout) to enable reveal-on-scroll for
// all top-level sections (and any element with class `reveal`).
export default function RevealOnScroll() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          if (entry.isIntersecting) {
            el.classList.add('reveal--visible');
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.12 }
    );

    const nodes = Array.from(document.querySelectorAll('main > * , .reveal'));
    nodes.forEach((el, idx) => {
      if (!el.classList.contains('reveal')) el.classList.add('reveal');
      // staggered entrance
      el.style.transitionDelay = `${Math.min(idx, 8) * 80}ms`;
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
