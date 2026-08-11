/**
 * SkeletonProductDetail — matches the layout of the ProductDetail page.
 * Shows shimmer placeholders for gallery, info panel, and pincode section.
 */
import './style.scss';

function SkeletonProductDetail() {
  return (
    <div className="skel-pd" aria-hidden="true">
      <div className="skel-pd__grid">

        {/* ── LEFT: Gallery skeleton ── */}
        <div className="skel-pd__gallery">
          {/* Thumbs column */}
          <div className="skel-pd__thumbs">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="skel-pd__thumb skel-pd__pulse" />
            ))}
          </div>
          {/* Main image */}
          <div className="skel-pd__main-img skel-pd__pulse" />
        </div>

        {/* ── RIGHT: Info skeleton ── */}
        <div className="skel-pd__info">
          {/* Breadcrumb */}
          <div className="skel-pd__line skel-pd__line--breadcrumb skel-pd__pulse" />

          {/* Title */}
          <div className="skel-pd__line skel-pd__line--title skel-pd__pulse" />
          <div className="skel-pd__line skel-pd__line--title-short skel-pd__pulse" />

          {/* Stars */}
          <div className="skel-pd__stars skel-pd__pulse" />

          {/* Price */}
          <div className="skel-pd__line skel-pd__line--price skel-pd__pulse" />

          {/* Description */}
          <div className="skel-pd__line skel-pd__line--desc skel-pd__pulse" />
          <div className="skel-pd__line skel-pd__line--desc skel-pd__pulse" />
          <div className="skel-pd__line skel-pd__line--desc-short skel-pd__pulse" />

          {/* Color swatches */}
          <div className="skel-pd__swatch-row">
            <div className="skel-pd__line skel-pd__line--label skel-pd__pulse" />
            <div className="skel-pd__swatches">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="skel-pd__swatch skel-pd__pulse" />
              ))}
            </div>
          </div>

          {/* CTA buttons */}
          <div className="skel-pd__btns">
            <div className="skel-pd__btn skel-pd__pulse" />
            <div className="skel-pd__btn skel-pd__pulse" />
            <div className="skel-pd__btn skel-pd__btn--wish skel-pd__pulse" />
          </div>

          {/* Pincode block */}
          <div className="skel-pd__pincode">
            <div className="skel-pd__line skel-pd__line--label skel-pd__pulse" />
            <div className="skel-pd__pincode-row">
              <div className="skel-pd__pincode-input skel-pd__pulse" />
              <div className="skel-pd__pincode-btn skel-pd__pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SkeletonProductDetail;
