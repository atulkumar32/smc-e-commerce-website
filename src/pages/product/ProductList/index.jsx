import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductListSeo from '../../../components/Seo/ProductListSeo';
import { useProductFilter } from '../useProductFilter';
import { useCart } from '../../../context/CartContext';
import { useCartDrawer } from '../../../context/CartDrawerContext';
import { toSlug, toTitleCase } from '../../../utils/slug';
import './style.scss';

// ── Category icon SVGs ────────────────────────────────────────────────────────
const CAT_ICONS = {
  'All Bags': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 8h12l-1 13H7L6 8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>,
  'Backpacks': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M7 9a5 5 0 0 1 10 0v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z" /><path d="M9 6a3 3 0 0 1 6 0" /><rect x="9" y="13" width="6" height="4" rx="0.5" /></svg>,
  'Laptop Bags': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="7" width="18" height="12" rx="1.5" /><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" /></svg>,
  'Trolley Bags': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="6" y="6" width="12" height="15" rx="1.5" /><path d="M10 6V4h4v2" /><circle cx="9" cy="22" r="0.8" fill="currentColor" /><circle cx="15" cy="22" r="0.8" fill="currentColor" /></svg>,
  'Duffle Bags': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="9" width="18" height="9" rx="4" /><path d="M8 9V7a1.5 1.5 0 0 1 1.5-1.5h5A1.5 1.5 0 0 1 16 7v2" /></svg>,
  'Sling Bags': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M8 10h8l1.5 9h-11z" /><path d="M6 4l6 6 6-6" /></svg>,
  'Tote Bags': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 9h14l-1 12H6z" /><path d="M8 9V7a4 4 0 0 1 8 0v2" /></svg>,
  'Pouches': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="5" y="8" width="14" height="11" rx="3" /><path d="M9 8V6.5A1.5 1.5 0 0 1 10.5 5h3A1.5 1.5 0 0 1 15 6.5V8" /></svg>,
  'Waist Bags': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 13c2-3 14-3 16 0-1 3-15 3-16 0z" /><path d="M2 13h2M20 13h2" /></svg>,
  'School Bags': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M7 9a5 5 0 0 1 10 0v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z" /><path d="M9 6a3 3 0 0 1 6 0" /><circle cx="12" cy="15" r="1.4" /></svg>,
  'Gym Bags': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="9" width="18" height="9" rx="4" /><path d="M8 9V7a1.5 1.5 0 0 1 1.5-1.5h5A1.5 1.5 0 0 1 16 7v2" /><path d="M12 12v3" /></svg>,
  'Camera Bags': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="8" width="18" height="11" rx="2" /><circle cx="12" cy="13.5" r="3.2" /><path d="M9 8l1-2h4l1 2" /></svg>,
};

function getCatIcon(name) {
  return CAT_ICONS[name] || CAT_ICONS['All Bags'];
}

// ── Scroll-reveal hook ────────────────────────────────────────────────────────
function useScrollReveal(ref) {
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }
      }),
      { threshold: 0.06 }
    );
    ref.current.querySelectorAll('.pcard').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  });
}

// ── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({ product, index }) {
  const navigate = useNavigate();
  const { addItem, isInCart } = useCart();
  const { toggleWishlist, isWishlisted } = useCart();
  const { openDrawer } = useCartDrawer();

  const slug = toSlug(product.name, product.productId || product.id);
  const imgSrc = product.image || '';
  const name = toTitleCase(product.name);
  const inCart = isInCart(product.id);
  const wished = isWishlisted(product.id);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (inCart) { openDrawer(); return; }
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice || null,
      image: product.image || '',
      category: product.category || '',
      colorName: product.colorName || '',
      brand: product.brand || '',
      stock: product.stock ?? 99,
    });
    openDrawer();
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice || null,
      image: product.image || '',
      category: product.category || '',
      colorName: product.colorName || '',
      brand: product.brand || '',
    });
  };

  return (
    <article
      className="pcard"
      style={{ transitionDelay: `${Math.min(index * 50, 400)}ms` }}
      onClick={() => navigate(`/products/${slug}`)}
      role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/products/${slug}`)}
    >
      <div className="pcard__media">
        {imgSrc
          ? <img src={imgSrc} alt={name} className="pcard__img" loading="lazy"
            onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          : <div className="pcard__placeholder">{getCatIcon(product.category || 'All Bags')}</div>
        }
        {/* // background strip color  */}
        {/* {product.badge && (
          <span className={`pcard__badge pcard__badge--${product.badge.toLowerCase()}`}>
            {product.badge}
          </span>
        )} */}

        <span className="pcard__tier-pill">{product.colorName || 'SMC'}</span>

        {/* Wishlist heart — real toggle */}
        <button
          className={`pcard__wish${wished ? ' pcard__wish--on' : ''}`}
          onClick={handleWishlist}
          aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={wished}
          title={wished ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"
            fill={wished ? 'currentColor' : 'none'}>
            <path d="M12 21s-7.5-4.6-10-9.2C.4 8.4 2 4.5 6 4c2.3-.3 4.2 1 6 3 1.8-2 3.7-3.3 6-3 4 .5 5.6 4.4 4 7.8-2.5 4.6-10 9.2-10 9.2z" />
          </svg>
          
        </button>

        {/* Add to Cart */}
        <button
          className={`pcard__add${inCart ? ' pcard__add--in-cart' : ''}`}
          onClick={handleAddToCart}
          aria-label={inCart ? 'View in cart' : 'Add to cart'}
        >
          {inCart ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              In Cart · View
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 8h12l-1 13H7L6 8z" />
                <path d="M9 8V6a3 3 0 0 1 6 0v2" />
              </svg>
              Add to Cart
            </>
          )}
        </button>
      </div>

      <div className="pcard__info">
        {product.category && <div className="pcard__cat">{product.category}</div>}
        <h3 className="pcard__name">{name}</h3>
        {product.brand && <div className="pcard__brand">{product.brand}</div>}

        {product.colors?.length > 0 && (
          <div className="pcard__dots">
            {product.colors.slice(0, 5).map((c) => (
              <span key={c.hex || c} className="pcard__dot" style={{ background: c.hex || c }} />
            ))}
          </div>
        )}

        <div className="pcard__foot">
          <div className="pcard__prices">
            {product.originalPrice && product.originalPrice > product.price ? (
              <>
                <span className="pcard__mrp">₹{product.originalPrice}</span>
                <span className="pcard__sp">₹{product.price}</span>
              </>
            ) : (
              <span className="pcard__sp">₹{product.price || '—'}</span>
            )}
          </div>
          <div className="pcard__stars">{'★'.repeat(4)}<span>☆</span></div>
        </div>
      </div>
    </article>
  );
}

// ── Filter panel constants ────────────────────────────────────────────────────
const TIERS = ['Borono', 'Exported', 'Generic'];
const CAPACITY = ['Under 20L', '20L – 35L', '35L – 50L', '50L & above'];
const COLORS = [
  { name: 'Navy', hex: '#132A4C' },
  { name: 'Black', hex: '#1B1B1B' },
  { name: 'Grey', hex: '#8A8F98' },
  { name: 'Olive', hex: '#546A45' },
  { name: 'Mustard', hex: '#C4841F' },
  { name: 'Maroon', hex: '#7D1E1E' },
];
const MATERIALS = ['Polyester', 'Nylon', 'Canvas', 'PU Leather', 'Ballistic Nylon'];
const PRICE_MIN = 0;
const PRICE_MAX = 10000;

// ── Accordion ─────────────────────────────────────────────────────────────────
function Accordion({ title, open, onToggle, children }) {
  return (
    <div className={`fd__group${open ? ' fd__group--open' : ''}`}>
      <button className="fd__group-head" onClick={onToggle} type="button">
        <span>{title}</span>
        <svg className="fd__group-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div className="fd__group-body">
        <div className="fd__group-inner">{children}</div>
      </div>
    </div>
  );
}

// ── Dual range price slider ───────────────────────────────────────────────────
function PriceSlider({ minVal, maxVal, onChange }) {
  const [lo, setLo] = useState(minVal ?? PRICE_MIN);
  const [hi, setHi] = useState(maxVal ?? PRICE_MAX);

  useEffect(() => {
    setLo(minVal ?? PRICE_MIN);
    setHi(maxVal ?? PRICE_MAX);
  }, [minVal, maxVal]);

  const pct = (v) => ((v - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  const commit = (newLo, newHi) =>
    onChange(newLo === PRICE_MIN ? null : newLo, newHi === PRICE_MAX ? null : newHi);

  return (
    <div className="fd__price">
      <div className="fd__price-row">
        <div className="fd__price-box">
          <span className="fd__price-label">Min</span>
          <span className="fd__price-val">₹{lo.toLocaleString()}</span>
        </div>
        <div className="fd__price-dash" />
        <div className="fd__price-box">
          <span className="fd__price-label">Max</span>
          <span className="fd__price-val">₹{hi.toLocaleString()}</span>
        </div>
      </div>

      <div className="fd__track-wrap">
        <div className="fd__track-bg" />
        <div className="fd__track-fill"
          style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }} />
        <input type="range" min={PRICE_MIN} max={PRICE_MAX} step={100}
          value={lo} className="fd__thumb"
          onChange={(e) => {
            const v = Math.min(Number(e.target.value), hi - 100);
            setLo(v); commit(v, hi);
          }}
          aria-label="Minimum price"
        />
        <input type="range" min={PRICE_MIN} max={PRICE_MAX} step={100}
          value={hi} className="fd__thumb"
          onChange={(e) => {
            const v = Math.max(Number(e.target.value), lo + 100);
            setHi(v); commit(lo, v);
          }}
          aria-label="Maximum price"
        />
      </div>
    </div>
  );
}

// ── Filter Drawer — always a right-side overlay on all screen sizes ───────────
function FilterDrawer({
  open, onClose,
  activeCategory, onCategory,
  sortBy, onSort,
  localFilters, onLocal, onReset,
}) {
  const [openSec, setOpenSec] = useState({
    tier: true, category: true, price: true,
    capacity: true, color: true, material: true, sort: true,
  });
  const tog = (k) => setOpenSec((p) => ({ ...p, [k]: !p[k] }));
  const cats = Object.keys(CAT_ICONS);

  const toggleArr = (key, val) => {
    const arr = localFilters[key] || [];
    onLocal(key, arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const activeCount =
    (localFilters.tiers?.length || 0) +
    (localFilters.capacities?.length || 0) +
    (localFilters.colors?.length || 0) +
    (localFilters.materials?.length || 0) +
    (localFilters.minPrice != null || localFilters.maxPrice != null ? 1 : 0) +
    (activeCategory && activeCategory !== 'all' ? 1 : 0);

  return (
    <>
      {/* Dark overlay behind the drawer */}
      <div
        className={`fd-overlay${open ? ' fd-overlay--show' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        className={`fd${open ? ' fd--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Product Filters"
      >
        {/* Header */}
        <div className="fd__head">
          <div className="fd__head-left">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
              <circle cx="9" cy="6" r="1.5" fill="currentColor" />
              <circle cx="15" cy="12" r="1.5" fill="currentColor" />
              <circle cx="9" cy="18" r="1.5" fill="currentColor" />
            </svg>
            <span>Filters</span>
            {activeCount > 0 && <em className="fd__badge">{activeCount}</em>}
          </div>
          <div className="fd__head-right">
            {activeCount > 0 && (
              <button className="fd__clear" onClick={onReset} type="button">Clear all</button>
            )}
            <button className="fd__close" onClick={onClose} aria-label="Close filters" type="button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="fd__body">

          <Accordion title="Product Tier" open={openSec.tier} onToggle={() => tog('tier')}>
            {TIERS.map((t) => (
              <label key={t} className="fd__check">
                <input type="checkbox"
                  checked={(localFilters.tiers || []).includes(t)}
                  onChange={() => toggleArr('tiers', t)}
                />
                <span>{t}</span>
              </label>
            ))}
          </Accordion>

          <Accordion title="Category" open={openSec.category} onToggle={() => tog('category')}>
            {cats.map((c) => (
              <label key={c} className="fd__check">
                <input type="checkbox"
                  checked={c === 'All Bags'
                    ? (!activeCategory || activeCategory === 'all')
                    : activeCategory === c}
                  onChange={() => onCategory(c === 'All Bags' ? 'all' : c)}
                />
                <span>{c}</span>
              </label>
            ))}
          </Accordion>

          <Accordion title="Price Range" open={openSec.price} onToggle={() => tog('price')}>
            <PriceSlider
              minVal={localFilters.minPrice}
              maxVal={localFilters.maxPrice}
              onChange={(min, max) => { onLocal('minPrice', min); onLocal('maxPrice', max); }}
            />
          </Accordion>

          <Accordion title="Capacity" open={openSec.capacity} onToggle={() => tog('capacity')}>
            {CAPACITY.map((c) => (
              <label key={c} className="fd__check">
                <input type="checkbox"
                  checked={(localFilters.capacities || []).includes(c)}
                  onChange={() => toggleArr('capacities', c)}
                />
                <span>{c}</span>
              </label>
            ))}
          </Accordion>

          <Accordion title="Color" open={openSec.color} onToggle={() => tog('color')}>
            <div className="fd__swatches">
              {COLORS.map((col) => {
                const on = (localFilters.colors || []).includes(col.name);
                return (
                  <button key={col.name} type="button"
                    className={`fd__swatch${on ? ' fd__swatch--on' : ''}`}
                    onClick={() => toggleArr('colors', col.name)}
                    aria-pressed={on} title={col.name}
                  >
                    <span className="fd__swatch-dot" style={{ background: col.hex }} />
                    <span>{col.name}</span>
                  </button>
                );
              })}
            </div>
          </Accordion>

          <Accordion title="Material" open={openSec.material} onToggle={() => tog('material')}>
            {MATERIALS.map((m) => (
              <label key={m} className="fd__check">
                <input type="checkbox"
                  checked={(localFilters.materials || []).includes(m)}
                  onChange={() => toggleArr('materials', m)}
                />
                <span>{m}</span>
              </label>
            ))}
          </Accordion>

          <Accordion title="Sort By" open={openSec.sort} onToggle={() => tog('sort')}>
            {[
              ['recommended', 'Recommended'],
              ['newest', 'Newest First'],
              ['price-asc', 'Price: Low to High'],
              ['price-desc', 'Price: High to Low'],
            ].map(([val, label]) => (
              <label key={val} className="fd__check">
                <input type="radio" name="fd-sort"
                  checked={sortBy === val}
                  onChange={() => onSort(val)}
                />
                <span>{label}</span>
              </label>
            ))}
          </Accordion>
        </div>

        {/* Footer — always visible */}
        <div className="fd__foot">
          <button className="fd__foot-reset" onClick={onReset} type="button">Reset</button>
          <button className="fd__foot-apply" onClick={onClose} type="button">
            Show Results
            {activeCount > 0 && <span className="fd__foot-badge">{activeCount}</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

const SORT_OPTS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
];

const INIT_LOCAL = {
  tiers: [], capacities: [], colors: [], materials: [],
  minPrice: null, maxPrice: null,
};

export default function ProductList() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(INIT_LOCAL);
  const gridRef = useRef(null);

  const {
    products, totalCount, visibleCount, hasMore,
    loadMore, activeCategory, changeCategory,
    sortBy, changeSort, pageTitle, loading,
  } = useProductFilter();

  // ── Local client-side filtering ───────────────────────────────────────────
  const filteredProducts = products.filter((p) => {
    if (localFilters.tiers.length > 0 &&
      !localFilters.tiers.some((t) => String(p.tier || p.brand || '').toLowerCase().includes(t.toLowerCase())))
      return false;
    if (localFilters.colors.length > 0 &&
      !localFilters.colors.some((c) => (p.colorName || '').toLowerCase().includes(c.toLowerCase())))
      return false;
    if (localFilters.materials.length > 0 &&
      !localFilters.materials.some((m) => (p.material || '').toLowerCase().includes(m.toLowerCase())))
      return false;
    if (localFilters.minPrice != null && p.price < localFilters.minPrice) return false;
    if (localFilters.maxPrice != null && p.price > localFilters.maxPrice) return false;
    return true;
  });

  const progressPct = totalCount > 0 ? Math.round((visibleCount / totalCount) * 100) : 0;

  const handleLocal = (key, val) => setLocalFilters((prev) => ({ ...prev, [key]: val }));

  const handleReset = () => {
    setLocalFilters(INIT_LOCAL);
    changeCategory('all');
  };

  const handleCategoryChange = (cat) => {
    changeCategory(cat);
    if (cat === 'all') setLocalFilters(INIT_LOCAL);
  };

  const activeFilterCount =
    localFilters.tiers.length +
    localFilters.capacities.length +
    localFilters.colors.length +
    localFilters.materials.length +
    (localFilters.minPrice != null || localFilters.maxPrice != null ? 1 : 0) +
    (activeCategory && activeCategory !== 'all' ? 1 : 0);

  const chips = [
    ...(activeCategory && activeCategory !== 'all'
      ? [{ key: 'cat', label: activeCategory, onRemove: () => handleCategoryChange('all') }] : []),
    ...localFilters.tiers.map((t) => ({ key: `t-${t}`, label: `Tier: ${t}`, onRemove: () => handleLocal('tiers', localFilters.tiers.filter((x) => x !== t)) })),
    ...localFilters.colors.map((c) => ({ key: `c-${c}`, label: `Color: ${c}`, onRemove: () => handleLocal('colors', localFilters.colors.filter((x) => x !== c)) })),
    ...localFilters.materials.map((m) => ({ key: `m-${m}`, label: `Mat: ${m}`, onRemove: () => handleLocal('materials', localFilters.materials.filter((x) => x !== m)) })),
    ...localFilters.capacities.map((c) => ({ key: `p-${c}`, label: c, onRemove: () => handleLocal('capacities', localFilters.capacities.filter((x) => x !== c)) })),
    ...(localFilters.minPrice != null || localFilters.maxPrice != null
      ? [{
        key: 'price', label: `₹${localFilters.minPrice ?? 0}–₹${localFilters.maxPrice ?? '10k'}`,
        onRemove: () => { handleLocal('minPrice', null); handleLocal('maxPrice', null); }
      }]
      : []),
  ];

  useScrollReveal(gridRef);

  // Lock body scroll + prevent x-axis scrollbar when filter drawer is open
  useEffect(() => {
    if (filterOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflowX = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflowX = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflowX = '';
    };
  }, [filterOpen]);

  return (
    <div className="pl">
      <ProductListSeo pageTitle={pageTitle} category={activeCategory} totalCount={totalCount} />

      {/* ── Page header ── */}
      <div className="pl__page-head">
        <div className="pl__page-head-inner">
          <div>
            <h1 className="pl__title">All Products</h1>
            <p className="pl__subtitle"><strong>{totalCount}</strong> products found</p>
          </div>

          <div className="pl__toolbar">
            <button
              className={`pl__filter-btn${filterOpen ? ' pl__filter-btn--active' : ''}`}
              onClick={() => setFilterOpen((v) => !v)}
              aria-pressed={filterOpen}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
                <circle cx="9" cy="6" r="1.5" fill="currentColor" />
                <circle cx="15" cy="12" r="1.5" fill="currentColor" />
                <circle cx="9" cy="18" r="1.5" fill="currentColor" />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="pl__filter-count">{activeFilterCount}</span>
              )}
            </button>

            <div className="pl__sort">
              <select value={sortBy} onChange={(e) => changeSort(e.target.value)} aria-label="Sort products">
                {SORT_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </div>

        {chips.length > 0 && (
          <div className="pl__chips-row">
            {chips.map((chip) => (
              <button key={chip.key} className="pl__chip" onClick={chip.onRemove} type="button">
                {chip.label}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            ))}
            <button className="pl__chip pl__chip--clear" onClick={handleReset} type="button">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Grid ── */}
      <div className="pl__grid-wrap">
        {loading && filteredProducts.length === 0 ? (
          <div className="pl__grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="pcard pcard--skeleton is-visible" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="pl__empty">
            <div className="pl__empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M6 8h12l-1 13H7L6 8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" />
              </svg>
            </div>
            <h3>No products found</h3>
            <p>Try adjusting your filters or browse all products.</p>
            <button onClick={handleReset}>View All Products</button>
          </div>
        ) : (
          <div className="pl__grid" ref={gridRef}>
            {filteredProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}          </div>
        )}

        {filteredProducts.length > 0 && (
          <div className="pl__load-more">
            <p className="pl__load-text">
              Showing {Math.min(visibleCount, totalCount)} of {totalCount} products
            </p>
            <div className="pl__progress">
              <div className="pl__progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            {hasMore && (
              <button className="pl__more-btn" onClick={loadMore}>
                Load more products
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Filter drawer (right-side overlay, all screens) ── */}
      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        activeCategory={activeCategory}
        onCategory={handleCategoryChange}
        sortBy={sortBy}
        onSort={changeSort}
        localFilters={localFilters}
        onLocal={handleLocal}
        onReset={handleReset}
      />
    </div>
  );
}
