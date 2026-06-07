import { useEffect, useRef, useState } from 'react';

export function useScrollDirection({ initialDirection = 'up', threshold = 20 } = {}) {
  const [direction, setDirection] = useState(initialDirection);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    lastScrollY.current = window.pageYOffset || document.documentElement.scrollTop || 0;

    const updateDirection = () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      const diff = scrollY - lastScrollY.current;
      if (Math.abs(diff) < threshold) {
        ticking.current = false;
        return;
      }

      setDirection(diff > 0 ? 'down' : 'up');
      lastScrollY.current = scrollY > 0 ? scrollY : 0;
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateDirection);
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return direction;
}
