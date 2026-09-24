/**
 * SkeletonCard — modern shimmer placeholder for products and categories.
 *
 * Props:
 *  count     – number of skeleton cards to render (default 8)
 *  className – optional wrapper class
 */
import './style.scss';

export function SkeletonCardItem({ index = 0 }) {
  return (
    <div
      className="skel-card skel-stagger-item"
      style={{ '--skel-delay': `${index * 60}ms` }}
      aria-hidden="true"
    >
      {/* Image area */}
      <div className="skel-card__img skel-card__pulse" />

      <div className="skel-card__body">
        {/* Brand placeholder */}
        <div className="skel-card__line skel-card__line--brand skel-card__pulse" />

        {/* Product title — 2 lines */}
        <div className="skel-card__line skel-card__line--name skel-card__pulse" />
        <div className="skel-card__line skel-card__line--name-short skel-card__pulse" />

        {/* Rating pill */}
        <div className="skel-card__rating-row">
          <div className="skel-card__rating skel-card__pulse" />
        </div>

        {/* Price & Discount */}
        <div className="skel-card__price-row">
          <div className="skel-card__line skel-card__line--price skel-card__pulse" />
          <div className="skel-card__line skel-card__line--mrp skel-card__pulse" />
          <div className="skel-card__line skel-card__line--badge skel-card__pulse" />
        </div>

        {/* Delivery line */}
        <div className="skel-card__line skel-card__line--delivery skel-card__pulse" />

        {/* Action button */}
        <div className="skel-card__btns">
          <div className="skel-card__btn skel-card__pulse" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonCategoryItem({ index = 0 }) {
  return (
    <div
      className="skel-cat skel-stagger-item"
      style={{ '--skel-delay': `${index * 50}ms` }}
      aria-hidden="true"
    >
      <div className="skel-cat__circle skel-card__pulse" />
      <div className="skel-cat__label skel-card__pulse" />
      <div className="skel-cat__sublabel skel-card__pulse" />
    </div>
  );
}

export function SkeletonCategoryGrid({ count = 6, className = '' }) {
  return (
    <div className={`v-cats__grid ${className}`.trim()} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCategoryItem key={i} index={i} />
      ))}
    </div>
  );
}

export function SkeletonProductGrid({ count = 8, className = '' }) {
  return (
    <div className={`pl__grid ${className}`.trim()} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCardItem key={i} index={i} />
      ))}
    </div>
  );
}

export default function SkeletonCard({ count = 8, className = '' }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCardItem key={i} index={i} />
      ))}
    </>
  );
}
