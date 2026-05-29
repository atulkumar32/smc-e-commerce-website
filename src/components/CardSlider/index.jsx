import { useEffect, useRef, useState, useCallback } from 'react';
import './style.scss';

/**
 * CardSlider — infinite auto-scrolling carousel
 *
 * Strategy: clone the items array 3× so the track is always wider than
 * the viewport. We scroll pixel-by-pixel via requestAnimationFrame.
 * When the offset reaches the end of the first clone set we silently
 * jump back to the start — creating a seamless infinite loop.
 *
 * Props:
 *  children     – React nodes (each becomes one slide)
 *  speedPx      – pixels per second (default 60)
 *  gap          – px gap between cards (default 24)
 *  cardWidth    – px width of one card (default 300)
 *  eyebrow      – small label above heading
 *  heading      – section heading text
 *  headingId    – id for aria-labelledby
 *  pauseOnHover – pause on hover (default true)
 */
function CardSlider({
  children,
  speedPx      = 60,
  gap          = 24,
  cardWidth    = 300,
  eyebrow,
  heading,
  headingId,
  pauseOnHover = true,
}) {
  const items      = Array.isArray(children) ? children : [children];
  const count      = items.length;
  const step       = cardWidth + gap;           // px per card slot
  const setWidth   = count * step;              // px for one full set

  const trackRef   = useRef(null);
  const rafRef     = useRef(null);
  const offsetRef  = useRef(0);                 // current scroll offset (px)
  const lastTsRef  = useRef(null);
  const pausedRef  = useRef(false);

  // Manual nav state (dot + arrows)
  const [dotIndex, setDotIndex] = useState(0);

  // ── Animation loop ────────────────────────────────────────────
  const animate = useCallback((ts) => {
    if (lastTsRef.current === null) lastTsRef.current = ts;
    const delta = ts - lastTsRef.current;
    lastTsRef.current = ts;

    if (!pausedRef.current) {
      offsetRef.current += (speedPx * delta) / 1000;

      // Seamless reset: when we've scrolled one full set, jump back
      if (offsetRef.current >= setWidth) {
        offsetRef.current -= setWidth;
      }

      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(-${offsetRef.current}px)`;
      }

      // Update dot indicator based on which card is most visible
      const idx = Math.round(offsetRef.current / step) % count;
      setDotIndex(idx < 0 ? 0 : idx);
    }

    rafRef.current = requestAnimationFrame(animate);
  }, [speedPx, setWidth, step, count]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate]);

  // ── Pause / resume ────────────────────────────────────────────
  const pause  = () => { if (pauseOnHover) { pausedRef.current = true;  lastTsRef.current = null; } };
  const resume = () => { if (pauseOnHover) { pausedRef.current = false; lastTsRef.current = null; } };

  // ── Manual prev / next ────────────────────────────────────────
  const jumpBy = (dir) => {
    offsetRef.current += dir * step;
    if (offsetRef.current < 0)         offsetRef.current += setWidth;
    if (offsetRef.current >= setWidth) offsetRef.current -= setWidth;
    lastTsRef.current = null;
  };

  // ── Dot click ─────────────────────────────────────────────────
  const jumpTo = (i) => {
    offsetRef.current = i * step;
    lastTsRef.current = null;
  };

  // Build 3 clones so the track is always wider than any viewport
  const cloned = [...items, ...items, ...items];

  return (
    <div
      className="cslider"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
      role="region"
      aria-roledescription="carousel"
      aria-label={heading || 'Product slider'}
    >
      {/* ── Header ── */}
      {(eyebrow || heading) && (
        <div className="cslider__header">
          <div className="cslider__header-text">
            {eyebrow && <span className="cslider__eyebrow">{eyebrow}</span>}
            {heading && (
              <h2 className="cslider__heading" id={headingId}>{heading}</h2>
            )}
          </div>

          <div className="cslider__nav" aria-label="Slider navigation">
            <button
              className="cslider__nav-btn"
              onClick={() => jumpBy(-1)}
              aria-label="Previous"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
                strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              className="cslider__nav-btn"
              onClick={() => jumpBy(1)}
              aria-label="Next"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
                strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Viewport ── */}
      <div className="cslider__viewport">
        {/* No CSS transition — RAF drives the transform directly */}
        <div
          ref={trackRef}
          className="cslider__track"
          style={{ gap: `${gap}px` }}
          aria-live="off"
        >
          {cloned.map((child, i) => (
            <div
              key={i}
              className="cslider__slide"
              style={{ minWidth: `${cardWidth}px`, width: `${cardWidth}px` }}
              aria-hidden={i >= count}   // only first set is "real"
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* ── Dot indicators (based on original items) ── */}
      <div className="cslider__dots" role="tablist" aria-label="Slide indicators">
        {items.map((_, i) => (
          <button
            key={i}
            role="tab"
            className={`cslider__dot${i === dotIndex ? ' is-active' : ''}`}
            onClick={() => jumpTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-selected={i === dotIndex}
          />
        ))}
      </div>
    </div>
  );
}

export default CardSlider;
