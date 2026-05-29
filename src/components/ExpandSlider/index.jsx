import { useState } from 'react';
import { Link } from 'react-router-dom';
import './style.scss';

/**
 * ExpandSlider
 * Collapsed: vertical rotated title + "+" icon
 * Expanded:  horizontal title + subtitle + "Buy Now" + "−" icon
 *
 * Props:
 *  items   – [{ id, image, label, sub, to?, icon? }]
 *  heading – section heading
 *  eyebrow – eyebrow label
 */
function ExpandSlider({ items = [], heading, eyebrow }) {
  const [active, setActive] = useState(0);

  const toggle = (i) => setActive(i === active ? -1 : i);

  return (
    <section className="exslider" aria-labelledby={heading ? 'exslider-heading' : undefined}>
      {(eyebrow || heading) && (
        <div className="exslider__header">
          {eyebrow && <span className="exslider__eyebrow">{eyebrow}</span>}
          {heading && <h2 className="exslider__heading" id="exslider-heading">{heading}</h2>}
        </div>
      )}

      <div className="exslider__options" role="list">
        {items.map((item, i) => {
          const isActive = i === active;

          return (
            <div
              key={item.id}
              role="listitem"
              className={`exslider__option${isActive ? ' is-active' : ''}`}
              style={{ '--option-bg': `url(${item.image})` }}
              aria-expanded={isActive}
              aria-label={item.label}
            >
              {/* Gradient overlay */}
              <div className="exslider__shadow" aria-hidden="true" />

              {/* ── COLLAPSED label: vertical rotated title ── */}
              <div className="exslider__collapsed-label" aria-hidden={isActive}>
                <span className="exslider__collapsed-title">{item.label}</span>
              </div>

              {/* ── EXPANDED content ── */}
              <div className="exslider__expanded-content" aria-hidden={!isActive}>
                <div className="exslider__expanded-text">
                  {item.icon && (
                    <div className="exslider__icon" aria-hidden="true">{item.icon}</div>
                  )}
                  <div>
                    <div className="exslider__main">{item.label}</div>
                    <div className="exslider__sub">{item.sub}</div>
                  </div>
                </div>
                {item.to && (
                  <Link
                    to={item.to}
                    className="exslider__buy-btn"
                    tabIndex={isActive ? 0 : -1}
                  >
                    Shop Now
                  </Link>
                )}
              </div>

              {/* ── Toggle button (+ / −) ── */}
              <button
                className="exslider__toggle"
                onClick={() => toggle(i)}
                aria-label={isActive ? `Collapse ${item.label}` : `Expand ${item.label}`}
              >
                <span className={`exslider__toggle-icon${isActive ? ' is-open' : ''}`}>
                  {/* Horizontal bar always visible */}
                  <span className="exslider__toggle-h" />
                  {/* Vertical bar rotates to 0 when open (becomes −) */}
                  <span className="exslider__toggle-v" />
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default ExpandSlider;
