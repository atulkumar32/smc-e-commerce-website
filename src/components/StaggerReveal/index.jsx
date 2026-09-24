import { useEffect, useRef } from 'react';
import './style.scss';

/**
 * useStaggerReveal — React Hook for scroll-triggered staggered animation.
 *
 * When the container enters the viewport, each matching child animates
 * in sequentially ("one by one") with a configurable delay.
 *
 * @param {Object} options
 * @param {string} options.selector - CSS selector for child items to stagger (default: direct children or .stagger-item)
 * @param {number} options.staggerDelay - delay in ms between consecutive items (default: 80)
 * @param {number} options.threshold - IntersectionObserver threshold (default: 0.1)
 * @param {string} options.rootMargin - IntersectionObserver rootMargin (default: '0px 0px -40px 0px')
 * @param {boolean} options.triggerOnce - whether animation should only trigger once (default: true)
 * @returns {React.RefObject} - attach to container DOM node
 */
export function useStaggerReveal({
  selector = null,
  staggerDelay = 80,
  threshold = 0.08,
  rootMargin = '0px 0px -40px 0px',
  triggerOnce = true,
  deps = [],
} = {}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof window === 'undefined') return undefined;

    // Check prefers-reduced-motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const items = selector ? el.querySelectorAll(selector) : Array.from(el.children);
      items.forEach((item) => {
        item.classList.add('stagger-revealed');
      });
      return undefined;
    }

    const getItems = () => {
      if (selector) {
        return Array.from(el.querySelectorAll(selector));
      }
      return Array.from(el.children).filter(
        (child) => !child.classList.contains('stagger-ignore')
      );
    };

    const applyStagger = () => {
      const items = getItems();
      items.forEach((item, idx) => {
        const delay = idx * staggerDelay;
        item.style.setProperty('--stagger-delay', `${delay}ms`);
        item.style.transitionDelay = `${delay}ms`;
        // Trigger class on next animation frame
        requestAnimationFrame(() => {
          item.classList.add('stagger-revealed');
          item.classList.add('is-visible');
        });
      });
    };

    if (!('IntersectionObserver' in window)) {
      applyStagger();
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            applyStagger();
            if (triggerOnce) {
              observer.unobserve(entry.target);
            }
          } else if (!triggerOnce) {
            const items = getItems();
            items.forEach((item) => {
              item.classList.remove('stagger-revealed');
              item.classList.remove('is-visible');
            });
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selector, staggerDelay, threshold, rootMargin, triggerOnce, ...deps]);

  return containerRef;
}

/**
 * StaggerContainer — Component wrapper that reveals children one by one
 * as soon as it scrolls into view.
 */
export function StaggerContainer({
  children,
  className = '',
  selector = null,
  staggerDelay = 85,
  threshold = 0.08,
  rootMargin = '0px 0px -40px 0px',
  as: Component = 'div',
  deps = [],
  ...props
}) {
  const containerRef = useStaggerReveal({
    selector,
    staggerDelay,
    threshold,
    rootMargin,
    deps,
  });

  return (
    <Component
      ref={containerRef}
      className={`stagger-container ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  );
}

/**
 * StaggerItem — Optional explicit wrapper for a single card or element.
 */
export function StaggerItem({
  children,
  index = 0,
  staggerDelay = 85,
  className = '',
  as: Component = 'div',
  ...props
}) {
  const delay = index * staggerDelay;
  return (
    <Component
      className={`stagger-item ${className}`.trim()}
      style={{
        '--stagger-delay': `${delay}ms`,
        transitionDelay: `${delay}ms`,
      }}
      {...props}
    >
      {children}
    </Component>
  );
}

export default StaggerContainer;
