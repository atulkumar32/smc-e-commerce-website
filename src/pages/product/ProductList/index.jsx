import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductListSeo from '../../../components/Seo/ProductListSeo';
import SkeletonCard from '../../../components/SkeletonCard';
import ProductCard from '../../../components/ProductCard';
import { useProductFilter } from '../useProductFilter';
import Breadcrumbs from '../../../components/Breadcrumbs';
import './style.scss';
import './vorano.scss'; // VORANO redesign overrides

// ── Scroll-reveal with Row-by-Row Stagger ─────────────────────────────────────
function useScrollReveal(ref, deps = []) {
  useEffect(() => {
    if (!ref.current || typeof window === 'undefined') return undefined;
    const cards = ref.current.querySelectorAll('.pcard');
    cards.forEach((el, i) => {
      const delay = (i % 6) * 85;
      el.style.setProperty('--stagger-delay', `${delay}ms`);
      el.classList.add('is-visible');
      el.classList.add('stagger-revealed');
    });
    return undefined;
  }, deps);
}

// ── Filter constants ──────────────────────────────────────────────────────────
const TIERS     = ['Borono', 'Exported', 'Generic'];
const CAPACITY  = ['Under 20L', '20L – 35L', '35L – 50L', '50L & above'];
const COLORS    = [
  { name: 'Navy',    hex: '#132A4C' }, { name: 'Black',   hex: '#1B1B1B' },
  { name: 'Grey',    hex: '#8A8F98' }, { name: 'Olive',   hex: '#546A45' },
  { name: 'Mustard', hex: '#C4841F' }, { name: 'Maroon',  hex: '#7D1E1E' },
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
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      <div className="fd__group-body">
        <div className="fd__group-inner">{children}</div>
      </div>
    </div>
  );
}

// ── Price slider ──────────────────────────────────────────────────────────────
function PriceSlider({ minVal, maxVal, onChange }) {
  const [lo, setLo] = useState(minVal ?? PRICE_MIN);
  const [hi, setHi] = useState(maxVal ?? PRICE_MAX);
  useEffect(() => { setLo(minVal ?? PRICE_MIN); setHi(maxVal ?? PRICE_MAX); }, [minVal, maxVal]);
  const pct = (v) => ((v - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const commit = (nl, nh) => onChange(nl === PRICE_MIN ? null : nl, nh === PRICE_MAX ? null : nh);

  return (
    <div className="fd__price">
      <div className="fd__price-row">
        <div className="fd__price-box"><span className="fd__price-label">Min</span><span className="fd__price-val">₹{lo.toLocaleString()}</span></div>
        <div className="fd__price-dash"/>
        <div className="fd__price-box"><span className="fd__price-label">Max</span><span className="fd__price-val">₹{hi.toLocaleString()}</span></div>
      </div>
      <div className="fd__track-wrap">
        <div className="fd__track-bg"/>
        <div className="fd__track-fill" style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}/>
        <input type="range" min={PRICE_MIN} max={PRICE_MAX} step={100} value={lo} className="fd__thumb"
          onChange={(e) => { const v = Math.min(Number(e.target.value), hi - 100); setLo(v); commit(v, hi); }} aria-label="Min price"/>
        <input type="range" min={PRICE_MIN} max={PRICE_MAX} step={100} value={hi} className="fd__thumb"
          onChange={(e) => { const v = Math.max(Number(e.target.value), lo + 100); setHi(v); commit(lo, v); }} aria-label="Max price"/>
      </div>
    </div>
  );
}

// ── Filter Drawer ─────────────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, activeCategory, onCategory, sortBy, onSort, localFilters, onLocal, onReset }) {
  const [openSec, setOpenSec] = useState({
    tier: true, category: true, price: true, capacity: true, color: true, material: true, sort: true,
  });
  const tog = (k) => setOpenSec((p) => ({ ...p, [k]: !p[k] }));

  const toggleArr = (key, val) => {
    const arr = localFilters[key] || [];
    onLocal(key, arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const activeCount =
    (localFilters.tiers?.length || 0) + (localFilters.capacities?.length || 0) +
    (localFilters.colors?.length || 0) + (localFilters.materials?.length || 0) +
    (localFilters.minPrice != null || localFilters.maxPrice != null ? 1 : 0) +
    (activeCategory && activeCategory !== 'all' ? 1 : 0);

  const CATS = ['All Bags','Backpacks','Laptop Bags','Trolley Bags','Duffle Bags','Sling Bags','Tote Bags','Pouches','Waist Bags','School Bags','Gym Bags','Camera Bags'];

  return (
    <>
      <div className={`fd-overlay${open ? ' fd-overlay--show' : ''}`} onClick={onClose} aria-hidden="true"/>
      <aside className={`fd${open ? ' fd--open' : ''}`} role="dialog" aria-modal="true" aria-label="Filters">
        <div className="fd__head">
          <div className="fd__head-left">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
              <circle cx="9" cy="6" r="1.5" fill="currentColor"/><circle cx="15" cy="12" r="1.5" fill="currentColor"/><circle cx="9" cy="18" r="1.5" fill="currentColor"/>
            </svg>
            <span>Filters</span>
            {activeCount > 0 && <em className="fd__badge">{activeCount}</em>}
          </div>
          <div className="fd__head-right">
            {activeCount > 0 && <button className="fd__clear" onClick={onReset} type="button">Clear all</button>}
            <button className="fd__close" onClick={onClose} aria-label="Close" type="button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="fd__body">
          <Accordion title="Product Tier" open={openSec.tier} onToggle={() => tog('tier')}>
            {TIERS.map((t) => (
              <label key={t} className="fd__check">
                <input type="checkbox" checked={(localFilters.tiers||[]).includes(t)} onChange={() => toggleArr('tiers', t)}/>
                <span>{t}</span>
              </label>
            ))}
          </Accordion>

          <Accordion title="Category" open={openSec.category} onToggle={() => tog('category')}>
            {CATS.map((c) => (
              <label key={c} className="fd__check">
                <input type="checkbox"
                  checked={
                    c === 'All Bags'
                      ? (!activeCategory || activeCategory === 'all' || activeCategory === 'All Bags')
                      : String(activeCategory || '').toLowerCase().replace(/[\s\-_+]+/g, '') === c.toLowerCase().replace(/[\s\-_+]+/g, '')
                  }
                  onChange={() => onCategory(c === 'All Bags' ? 'all' : c)}/>
                <span>{c}</span>
              </label>
            ))}
          </Accordion>

          <Accordion title="Price Range" open={openSec.price} onToggle={() => tog('price')}>
            <PriceSlider minVal={localFilters.minPrice} maxVal={localFilters.maxPrice}
              onChange={(min, max) => { onLocal('minPrice', min); onLocal('maxPrice', max); }}/>
          </Accordion>

          <Accordion title="Capacity" open={openSec.capacity} onToggle={() => tog('capacity')}>
            {CAPACITY.map((c) => (
              <label key={c} className="fd__check">
                <input type="checkbox" checked={(localFilters.capacities||[]).includes(c)} onChange={() => toggleArr('capacities', c)}/>
                <span>{c}</span>
              </label>
            ))}
          </Accordion>

          <Accordion title="Color" open={openSec.color} onToggle={() => tog('color')}>
            <div className="fd__swatches">
              {COLORS.map((col) => {
                const on = (localFilters.colors||[]).includes(col.name);
                return (
                  <button key={col.name} type="button" className={`fd__swatch${on ? ' fd__swatch--on' : ''}`}
                    onClick={() => toggleArr('colors', col.name)} aria-pressed={on}>
                    <span className="fd__swatch-dot" style={{ background: col.hex }}/>
                    <span>{col.name}</span>
                  </button>
                );
              })}
            </div>
          </Accordion>

          <Accordion title="Material" open={openSec.material} onToggle={() => tog('material')}>
            {MATERIALS.map((m) => (
              <label key={m} className="fd__check">
                <input type="checkbox" checked={(localFilters.materials||[]).includes(m)} onChange={() => toggleArr('materials', m)}/>
                <span>{m}</span>
              </label>
            ))}
          </Accordion>

          <Accordion title="Sort By" open={openSec.sort} onToggle={() => tog('sort')}>
            {[['recommended','Recommended'],['newest','Newest First'],['price-asc','Price: Low to High'],['price-desc','Price: High to Low']].map(([val, label]) => (
              <label key={val} className="fd__check">
                <input type="radio" name="fd-sort" checked={sortBy === val} onChange={() => onSort(val)}/>
                <span>{label}</span>
              </label>
            ))}
          </Accordion>
        </div>

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

// ── Sort options ──────────────────────────────────────────────────────────────
const SORT_OPTS = [
  { value: 'recommended', label: 'Popularity' },
  { value: 'newest',      label: 'Newest First' },
  { value: 'price-asc',   label: 'Price: Low → High' },
  { value: 'price-desc',  label: 'Price: High → Low' },
];

const INIT_LOCAL = { tiers: [], capacities: [], colors: [], materials: [], minPrice: null, maxPrice: null };

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ProductList() {
  const [filterOpen,   setFilterOpen]   = useState(false);
  const [localFilters, setLocalFilters] = useState(INIT_LOCAL);
  const gridRef = useRef(null);
  const sidebarRef = useRef(null);

  // Isolate scroll so wheeling on the filter sidebar never scrolls the right side box or page
  useEffect(() => {
    const el = sidebarRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      if (e.deltaY === 0) return;

      const { scrollTop, scrollHeight, clientHeight } = el;
      const maxScroll = scrollHeight - clientHeight;

      if (maxScroll <= 0) {
        e.preventDefault();
        return;
      }

      const delta = e.deltaY;

      if (delta > 0 && scrollTop + delta >= maxScroll) {
        el.scrollTop = maxScroll;
        e.preventDefault();
      } else if (delta < 0 && scrollTop + delta <= 0) {
        el.scrollTop = 0;
        e.preventDefault();
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const {
    products, totalCount, visibleCount, hasMore,
    loadMore, activeCategory, activeCategoryName, changeCategory,
    sortBy, changeSort, pageTitle, loading,
  } = useProductFilter();

  // Client-side filter on top of API results
  const filteredProducts = products.filter((p) => {
    if (localFilters.tiers.length > 0 &&
      !localFilters.tiers.some((t) => String(p.tier || p.brand || '').toLowerCase().includes(t.toLowerCase()))) return false;
    if (localFilters.colors.length > 0 &&
      !localFilters.colors.some((c) => (p.colorName || '').toLowerCase().includes(c.toLowerCase()))) return false;
    if (localFilters.materials.length > 0 &&
      !localFilters.materials.some((m) => (p.material || '').toLowerCase().includes(m.toLowerCase()))) return false;
    if (localFilters.minPrice != null && p.price < localFilters.minPrice) return false;
    if (localFilters.maxPrice != null && p.price > localFilters.maxPrice) return false;
    return true;
  });

  const progressPct = totalCount > 0 ? Math.round((visibleCount / totalCount) * 100) : 0;
  const handleLocal = (key, val) => setLocalFilters((prev) => ({ ...prev, [key]: val }));
  const handleReset = () => { setLocalFilters(INIT_LOCAL); changeCategory('all'); };
  const handleCategoryChange = (cat) => { changeCategory(cat); if (cat === 'all') setLocalFilters(INIT_LOCAL); };

  const activeCategoryLabel = activeCategoryName || activeCategory;
  const activeFilterCount =
    localFilters.tiers.length + localFilters.capacities.length +
    localFilters.colors.length + localFilters.materials.length +
    (localFilters.minPrice != null || localFilters.maxPrice != null ? 1 : 0) +
    (activeCategory && activeCategory !== 'all' ? 1 : 0);

  const chips = [
    ...(activeCategory && activeCategory !== 'all'
      ? [{ key: 'cat', label: activeCategoryLabel, onRemove: () => handleCategoryChange('all') }] : []),
    ...localFilters.tiers.map((t)      => ({ key: `t-${t}`, label: `Tier: ${t}`,  onRemove: () => handleLocal('tiers',      localFilters.tiers.filter((x) => x !== t)) })),
    ...localFilters.colors.map((c)     => ({ key: `c-${c}`, label: `Color: ${c}`, onRemove: () => handleLocal('colors',     localFilters.colors.filter((x) => x !== c)) })),
    ...localFilters.materials.map((m)  => ({ key: `m-${m}`, label: m,             onRemove: () => handleLocal('materials',  localFilters.materials.filter((x) => x !== m)) })),
    ...localFilters.capacities.map((c) => ({ key: `p-${c}`, label: c,             onRemove: () => handleLocal('capacities', localFilters.capacities.filter((x) => x !== c)) })),
    ...(localFilters.minPrice != null || localFilters.maxPrice != null
      ? [{ key: 'price', label: `₹${localFilters.minPrice ?? 0}–₹${localFilters.maxPrice ?? '10k'}`,
           onRemove: () => { handleLocal('minPrice', null); handleLocal('maxPrice', null); } }] : []),
  ];

  useScrollReveal(gridRef, [filteredProducts, loading]);

  useEffect(() => {
    if (filterOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflowX = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflowX = '';
    }
    return () => { document.body.style.overflow = ''; document.documentElement.style.overflowX = ''; };
  }, [filterOpen]);

  return (
    <div className="pl">
      <ProductListSeo pageTitle={pageTitle} category={activeCategory} totalCount={totalCount}/>

      {/* ── Page head — breadcrumb + title only ── */}
      <div className="pl__head">
        {/* Breadcrumb */}
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            activeCategory && activeCategory !== 'all' && activeCategory !== 'All Bags'
              ? { label: 'All Collections', to: '/products' }
              : null,
            { label: pageTitle },
          ].filter(Boolean)}
        />

        <div className="pl__head-row">
          <div>
            {/* <h1 className="pl__title">{pageTitle}</h1> */}
            {/* <p className="pl__subtitle">Stylish, Durable &amp; Comfortable Bags for Every School Day</p> */}
          </div>
          {/* Old toolbar commented out — toolbar now lives inside pl__shop-layout */}
          {/*
          <div className="pl__toolbar">
            <button className={`pl__filter-btn${filterOpen ? ' pl__filter-btn--on' : ''}`} onClick={() => setFilterOpen((v) => !v)} aria-pressed={filterOpen}>
              Filters
              {activeFilterCount > 0 && <span className="pl__filter-badge">{activeFilterCount}</span>}
            </button>
            <div className="pl__sort-wrap">
              <span className="pl__sort-label">Sort by:</span>
              <div className="pl__sort-select-wrap">
                <select value={sortBy} onChange={(e) => changeSort(e.target.value)}>
                  {SORT_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
          </div>
          */}
        </div>

        {/* Active filter chips — commented out (sidebar has Clear All instead) */}
        {/*
        {chips.length > 0 && (
          <div className="pl__chips">
            {chips.map((chip) => (
              <button key={chip.key} className="pl__chip" onClick={chip.onRemove} type="button">
                {chip.label}
              </button>
            ))}
            <button className="pl__chip pl__chip--clear" onClick={handleReset} type="button">Clear all</button>
          </div>
        )}
        */}
      </div>

      {/* ── Shop layout: sidebar + grid ── */}
      <div className="pl__shop-layout">

        {/* ── Left sidebar (desktop) ── */}
        <aside className="pl__sidebar" ref={sidebarRef}>
          <div className="pl__sidebar-head">
            <strong>FILTERS</strong>
            {activeFilterCount > 0 && (
              <button className="pl__sidebar-clear" onClick={handleReset} type="button">Clear All</button>
            )}
          </div>

          {/* Category */}
          <div className="pl__sidebar-group">
            <p className="pl__sidebar-title">Category</p>
            {['All Bags','Backpacks','Laptop Bags','School Bags','Ladies Bags','Sling Bags','Travel Bags'].map((c) => (
              <label key={c} className="pl__sidebar-check">
                <input type="checkbox"
                  checked={
                    c === 'All Bags'
                      ? (!activeCategory || activeCategory === 'all' || activeCategory === 'All Bags')
                      : String(activeCategory || '').toLowerCase().replace(/[\s\-_+]+/g, '') === c.toLowerCase().replace(/[\s\-_+]+/g, '')
                  }
                  onChange={() => handleCategoryChange(c === 'All Bags' ? 'all' : c)}/>
                <span>{c}</span>
              </label>
            ))}
          </div>

          {/* Price Range */}
          <div className="pl__sidebar-group">
            <p className="pl__sidebar-title">Price Range</p>
            <PriceSlider minVal={localFilters.minPrice} maxVal={localFilters.maxPrice}
              onChange={(min, max) => { handleLocal('minPrice', min); handleLocal('maxPrice', max); }}/>
          </div>

          {/* Color */}
          <div className="pl__sidebar-group">
            <p className="pl__sidebar-title">Color</p>
            <div className="fd__swatches">
              {COLORS.map((col) => {
                const on = (localFilters.colors||[]).includes(col.name);
                return (
                  <button key={col.name} type="button" className={`fd__swatch${on ? ' fd__swatch--on' : ''}`}
                    onClick={() => {
                      const arr = localFilters.colors || [];
                      handleLocal('colors', arr.includes(col.name) ? arr.filter(x => x !== col.name) : [...arr, col.name]);
                    }} aria-pressed={on}>
                    <span className="fd__swatch-dot" style={{ background: col.hex }}/>
                    <span>{col.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Material */}
          <div className="pl__sidebar-group">
            <p className="pl__sidebar-title">Material</p>
            {MATERIALS.map((m) => (
              <label key={m} className="pl__sidebar-check">
                <input type="checkbox"
                  checked={(localFilters.materials||[]).includes(m)}
                  onChange={() => {
                    const arr = localFilters.materials || [];
                    handleLocal('materials', arr.includes(m) ? arr.filter(x => x !== m) : [...arr, m]);
                  }}/>
                <span>{m}</span>
              </label>
            ))}
          </div>
        </aside>

        {/* ── Right: toolbar + grid ── */}
        <div className="pl__main">
          {/* Toolbar */}
          <div className="pl__toolbar-bar">
            <span className="pl__toolbar-count">
              <strong>{filteredProducts.length}</strong> Products
            </span>
            <div className="pl__sort-wrap">
              <span className="pl__sort-label">Sort By</span>
              <div className="pl__sort-select-wrap">
                <select value={sortBy} onChange={(e) => changeSort(e.target.value)} aria-label="Sort products">
                  {SORT_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Mobile filter + sort buttons */}
          <div className="pl__mobile-controls">
            <button className="pl__mobile-btn" onClick={() => setFilterOpen(v => !v)} type="button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
            <div className="pl__sort-select-wrap">
              <select value={sortBy} onChange={(e) => changeSort(e.target.value)}>
                {SORT_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>

          {/* Products */}
          {loading && filteredProducts.length === 0 ? (
            <div className="pl__grid">
              <SkeletonCard count={12} />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="pl__empty">
              <h3>No products found</h3>
              <p>Try adjusting your filters or browse all products.</p>
              <button onClick={handleReset}>View All Products</button>
            </div>
          ) : (
            <div className="pl__grid" ref={gridRef}>
              {filteredProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i}/>
              ))}
            </div>
          )}

          {filteredProducts.length > 0 && (
            <div className="pl__load-more">
              <p className="pl__load-text">Showing {Math.min(visibleCount, totalCount)} of {totalCount} products</p>
              <div className="pl__progress"><div className="pl__progress-fill" style={{ width: `${progressPct}%` }}/></div>
              {hasMore && <button className="pl__more-btn" onClick={loadMore}>Load more products</button>}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <FilterDrawer
        open={filterOpen} onClose={() => setFilterOpen(false)}
        activeCategory={activeCategory} onCategory={handleCategoryChange}
        sortBy={sortBy} onSort={changeSort}
        localFilters={localFilters} onLocal={handleLocal} onReset={handleReset}
      />
    </div>
  );
}
