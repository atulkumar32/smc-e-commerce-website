/**
 * RecentlyViewedSlider
 *
 * Auto-playing card slider showing 4 product cards at a time.
 * Fetches live products from the web API.
 * Loops infinitely with a 3-second auto-play interval.
 *
 * Props:
 *   title     – section heading (default "You May Also Like")
 *   exclude   – product_id string to exclude (current product)
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchWebProductList } from '../../Actions/Web/GetProductListAction';
import { toSlug, toTitleCase } from '../../utils/slug';
import { MEDIA_BASE } from '../../Config/UrlsConfig';
import './style.scss';

const VISIBLE  = 4;   // cards visible at once
const INTERVAL = 3000; // ms between auto-slides

// ── Image resolver (same logic as useProductFilter) ───────────────────────────
function resolveImg(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const normalized = path.replace(/^\/+/, '');
  const segments   = normalized.split('/');
  const filename   = segments[segments.length - 1];
  const dir        = segments.slice(0, -1).join('/');
  const encoded    = dir ? `${dir}/${encodeURIComponent(filename)}` : encodeURIComponent(filename);
  return `${MEDIA_BASE}${encoded}`;
}

// ── Map API product → card data ───────────────────────────────────────────────
function mapCard(product) {
  // Grab image from first variant with images, or top-level
  let image = '';
  if (Array.isArray(product.variants)) {
    for (const v of product.variants) {
      const imgs = Array.isArray(v.images) ? v.images : [];
      if (!imgs.length) continue;
      const main = imgs.find((i) => i.is_main) || imgs[0];
      if (main?.image_url) { image = resolveImg(main.image_url); break; }
    }
  }
  if (!image && product.primary_image) image = resolveImg(product.primary_image);

  const firstVariant = Array.isArray(product.variants) && product.variants[0];
  const price = Number(product.selling_price ?? product.price ?? firstVariant?.selling_price ?? 0);
  const mrp   = Number(product.mrp ?? firstVariant?.mrp ?? price);

  return {
    id:        product.product_id || product.id,
    name:      product.product_name || product.name || 'Product',
    brand:     product.brand || '',
    price,
    mrp:       mrp !== price ? mrp : null,
    image,
    slug:      toSlug(product.product_name || product.name || '', product.product_id || product.id),
    badge:     product.badge || (product.is_new_arrival ? 'New' : null),
  };
}

// ── Single slide card ─────────────────────────────────────────────────────────
function SlideCard({ card }) {
  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  return (
    <Link to={`/products/${card.slug}`} className="rvs__card">
      <div className="rvs__card-img">
        {card.image
          ? <img src={card.image} alt={toTitleCase(card.name)} loading="lazy" />
          : <div className="rvs__card-img-placeholder">🎒</div>
        }
        {card.badge && (
          <span className={`rvs__card-badge rvs__card-badge--${card.badge.toLowerCase()}`}>
            {card.badge}
          </span>
        )}
      </div>
      <div className="rvs__card-body">
        {card.brand && <p className="rvs__card-brand">{card.brand}</p>}
        <h3 className="rvs__card-name">{toTitleCase(card.name)}</h3>
        <div className="rvs__card-pricing">
          <span className="rvs__card-price">{fmt(card.price)}</span>
          {card.mrp && <span className="rvs__card-mrp">{fmt(card.mrp)}</span>}
        </div>
      </div>
    </Link>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
function RecentlyViewedSlider({ title = 'You May Also Like', exclude = '' }) {
  const [cards,   setCards]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [index,   setIndex]   = useState(0);  // first visible card index
  const timerRef = useRef(null);

  // Fetch products on mount
  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchWebProductList(null)
      .then((data) => {
        if (!active) return;
        const products = Array.isArray(data.products) ? data.products : [];
        const mapped   = products
          .filter((p) => (p.product_id || p.id) !== exclude)
          .map(mapCard)
          .filter((c) => c.price > 0); // skip unpriceable
        setCards(mapped);
      })
      .catch(() => { if (active) setCards([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [exclude]);

  // Auto-play
  const next = useCallback(() => {
    setIndex((i) => (cards.length <= VISIBLE ? 0 : (i + 1) % (cards.length - VISIBLE + 1)));
  }, [cards.length]);

  const prev = useCallback(() => {
    setIndex((i) => (i === 0 ? Math.max(0, cards.length - VISIBLE) : i - 1));
  }, [cards.length]);

  useEffect(() => {
    if (cards.length <= VISIBLE) return;
    timerRef.current = setInterval(next, INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [cards.length, next]);

  const pauseAuto = () => clearInterval(timerRef.current);
  const resumeAuto = useCallback(() => {
    if (cards.length <= VISIBLE) return;
    timerRef.current = setInterval(next, INTERVAL);
  }, [cards.length, next]);

  if (!loading && cards.length === 0) return null;

  const visibleCards = cards.slice(index, index + VISIBLE);
  // Pad with null if fewer than VISIBLE
  const padded = [...visibleCards, ...Array(Math.max(0, VISIBLE - visibleCards.length)).fill(null)];

  return (
    <section className="rvs" aria-labelledby="rvs-heading">
      <div className="rvs__header">
        <h2 className="rvs__title" id="rvs-heading">{title}</h2>
        {cards.length > VISIBLE && (
          <div className="rvs__controls">
            <button className="rvs__ctrl" onClick={prev} aria-label="Previous">‹</button>
            <button className="rvs__ctrl" onClick={next} aria-label="Next">›</button>
          </div>
        )}
      </div>

      <div
        className="rvs__track"
        onMouseEnter={pauseAuto}
        onMouseLeave={resumeAuto}
      >
        {loading
          ? Array.from({ length: VISIBLE }).map((_, i) => (
              <div key={i} className="rvs__skeleton" aria-hidden="true">
                <div className="rvs__skeleton-img" />
                <div className="rvs__skeleton-line" />
                <div className="rvs__skeleton-line rvs__skeleton-line--short" />
              </div>
            ))
          : padded.map((card, i) =>
              card
                ? <SlideCard key={card.id} card={card} />
                : <div key={`empty-${i}`} className="rvs__card rvs__card--empty" />
            )
        }
      </div>

      {/* Dot indicators */}
      {!loading && cards.length > VISIBLE && (
        <div className="rvs__dots" aria-hidden="true">
          {Array.from({ length: cards.length - VISIBLE + 1 }).map((_, i) => (
            <button key={i}
              className={`rvs__dot${i === index ? ' rvs__dot--active' : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default RecentlyViewedSlider;
