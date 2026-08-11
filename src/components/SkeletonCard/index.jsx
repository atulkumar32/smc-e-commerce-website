/**
 * SkeletonCard — matches the exact layout of ProductCard.
 *
 * Props:
 *  count  – number of skeleton cards to render (default 8)
 *  className – optional wrapper class
 */
import './style.scss';

function SkeletonCardItem() {
  return (
    <div className="skel-card" aria-hidden="true">
      {/* Image area — 4:5 ratio matching pcard__img-wrap */}
      <div className="skel-card__img skel-card__pulse" />

      <div className="skel-card__body">
        {/* Color swatches row */}
        <div className="skel-card__swatches">
          <span className="skel-card__swatch skel-card__pulse" />
          <span className="skel-card__swatch skel-card__pulse" />
          <span className="skel-card__swatch skel-card__pulse" />
        </div>

        {/* Color name */}
        <div className="skel-card__color-name skel-card__pulse" />

        {/* Product name — 2 lines */}
        <div className="skel-card__line skel-card__line--name skel-card__pulse" />
        <div className="skel-card__line skel-card__line--name-short skel-card__pulse" />

        {/* Brand */}
        <div className="skel-card__line skel-card__line--brand skel-card__pulse" />

        {/* Price */}
        <div className="skel-card__line skel-card__line--price skel-card__pulse" />

        {/* Buttons */}
        <div className="skel-card__btns">
          <div className="skel-card__btn skel-card__pulse" />
          <div className="skel-card__btn skel-card__pulse" />
        </div>
      </div>
    </div>
  );
}

function SkeletonCard({ count = 8, className = '' }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCardItem key={i} />
      ))}
    </>
  );
}

export default SkeletonCard;
