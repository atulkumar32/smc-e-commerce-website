import { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../../components/ProductCard';
import NavDrawer from '../../../components/NavDrawer';
import { useProductFilter } from '../useProductFilter';
import { SORT_OPTIONS } from '../productData';
import './style.scss';

function ProductList() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const {
    products,
    totalCount,
    visibleCount,
    hasMore,
    loadMore,
    activeCategory,
    changeCategory,
    sortBy,
    setSortBy,
    pageTitle,
  } = useProductFilter();

  const progressPct = totalCount > 0 ? Math.round((visibleCount / totalCount) * 100) : 0;

  return (
    <div className="product-list">
      {/* ── Drawer ── */}
      <NavDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeCategory={activeCategory}
        onCategory={changeCategory}
      />

      <div className="product-list__inner">
        {/* ── Category Header ── */}
        <section className="product-list__cat-header">
          <div>
            <nav className="product-list__breadcrumb" aria-label="Breadcrumb">
              <Link to="/" className="product-list__breadcrumb-link">Home</Link>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <span className="product-list__breadcrumb-current">{pageTitle}</span>
            </nav>
            <h1 className="product-list__title">{pageTitle}</h1>
            <p className="product-list__count">{totalCount} Premium Quality Products Found</p>
          </div>
        </section>

        {/* ── Filter & Sort Bar ── */}
        <div className="product-list__toolbar" role="toolbar" aria-label="Filter and sort">
          <button
            className="product-list__filter-btn"
            onClick={() => setDrawerOpen(true)}
            aria-expanded={drawerOpen}
            aria-controls="nav-drawer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
              strokeLinejoin="round" aria-hidden="true">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="20" y2="12" />
              <line x1="12" y1="18" x2="20" y2="18" />
            </svg>
            <span>Filters</span>
          </button>

          <div className="product-list__sort">
            <label className="product-list__sort-label" htmlFor="sort-select">
              Sort By:
            </label>
            <select
              id="sort-select"
              className="product-list__sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort products"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Product Grid ── */}
        {products.length > 0 ? (
          <div className="product-list__grid" role="list" aria-label={`${pageTitle} products`}>
            {products.map((product, i) => (
              <div key={product.id} role="listitem" style={{ animationDelay: `${i * 60}ms` }}>
                <ProductCard product={product} animate />
              </div>
            ))}
          </div>
        ) : (
          <div className="product-list__empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"
              strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <p>No products found in this category.</p>
            <button className="product-list__empty-btn" onClick={() => changeCategory('all')}>
              View All Products
            </button>
          </div>
        )}

        {/* ── Load More ── */}
        {products.length > 0 && (
          <div className="product-list__load-more">
            <p className="product-list__viewed">
              You&apos;ve viewed {Math.min(visibleCount, totalCount)} of {totalCount} products
            </p>
            <div className="product-list__progress" role="progressbar"
              aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}
              aria-label="Products viewed progress">
              <div
                className="product-list__progress-bar"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {hasMore && (
              <button className="product-list__more-btn" onClick={loadMore}>
                Load More Products
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductList;
