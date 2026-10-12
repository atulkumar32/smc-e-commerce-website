import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './style.scss';

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const location = useLocation();

  useEffect(() => {
    let ticking = false;

    const calculateProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (scrollHeight > 4) {
        const pct = Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100));
        setProgress(pct);
      } else {
        setProgress(0);
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(calculateProgress);
        ticking = true;
      }
    };

    calculateProgress();
    const timer = setTimeout(calculateProgress, 100);

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [location.pathname, location.search]);

  return (
    <div
      className={`v-scroll-progress-line${progress > 0.3 ? ' is-visible' : ''}`}
      role="progressbar"
      aria-label="Page scroll progress"
      aria-valuenow={Math.round(progress)}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-hidden="true"
    >
      <div
        className="v-scroll-progress-line__fill"
        style={{ width: `${progress}%` }}
      >
        <span className="v-scroll-progress-line__head" />
      </div>
    </div>
  );
}
