import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { isUserAuthenticated } from '../../../services/apiClients';
import useProductDetail from '../useProductDetail';
import { checkPincodeAction } from '../../../Actions/CheckPinCodeAction';
import SkeletonProductDetail from '../../../components/SkeletonProductDetail';
import ProductDetailSeo from '../../../components/Seo/ProductDetailSeo';
import RecentlyViewedSlider from '../../../components/RecentlyViewedSlider';
import { toTitleCase } from '../../../utils/slug';
import ReviewsModal           from './Components/ReviewsModal';
import './style.scss';
import './vorano.scss'; // VORANO redesign overrides

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length]);

  return (
    <div className="lb" onClick={onClose} role="dialog" aria-modal="true" aria-label="Image viewer">
      <button className="lb__close" onClick={onClose} aria-label="Close">✕</button>
      <button className="lb__nav lb__nav--prev" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous">‹</button>
      <div className="lb__img-wrap" onClick={(e) => e.stopPropagation()}>
        <img src={images[idx]} alt={`Product image ${idx + 1}`} className="lb__img" />
        <p className="lb__counter">{idx + 1} / {images.length}</p>
      </div>
      <button className="lb__nav lb__nav--next" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next">›</button>
      {/* Thumbnail strip */}
      <div className="lb__thumbs" onClick={(e) => e.stopPropagation()}>
        {images.map((src, i) => (
          <button key={i} className={`lb__thumb${i === idx ? ' lb__thumb--active' : ''}`}
            onClick={() => setIdx(i)} aria-label={`Go to image ${i + 1}`}>
            <img src={src} alt="" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Image Zoom constants ──────────────────────────────────────────────────────
const ZOOM = 2.6; // optical magnification factor

/**
 * Safely format background-image URL so filenames with spaces,
 * quotes, and parentheses like "WhatsApp Image ... (1)_10.jpeg"
 * parse validly in CSS without breaking or failing to display.
 */
function formatBgUrl(url) {
  if (!url) return 'none';
  const safe = String(url)
    .replace(/"/g, '%22')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29');
  return `url("${safe}")`;
}

// ── Single mosaic thumb with lens tracking ────────────────────────────────────
function ZoomThumb({ src, alt, cellIndex, onHover, onLeave, onOpenLightbox }) {
  const imgRef = useRef(null);

  const handleMouseMove = (e) => {
    const el = imgRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const thumbW = rect.width;
    const thumbH = rect.height;

    // Lens covers ~42% of thumbnail area for comfortable, distortion-free inspection
    const lensW = Math.round(thumbW * 0.42);
    const lensH = Math.round(thumbH * 0.42);

    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    // Clamp lens within thumbnail bounds
    const lx = Math.max(0, Math.min(thumbW - lensW, rawX - lensW / 2));
    const ly = Math.max(0, Math.min(thumbH - lensH, rawY - lensH / 2));

    // Calculate vertical position of this cell relative to .pd__layout
    const layoutEl = el.closest('.pd__layout');
    const cellEl = el.closest('.pd__mosaic-cell') || el;
    let portalTop = 0;
    if (layoutEl && cellEl) {
      const layoutRect = layoutEl.getBoundingClientRect();
      const cellRect = cellEl.getBoundingClientRect();
      const maxPortalTop = Math.max(0, layoutRect.height - 540);
      portalTop = Math.max(0, Math.min(maxPortalTop, cellRect.top - layoutRect.top));
    }

    onHover({
      cellIndex,
      src,
      lx,
      ly,
      lensW,
      lensH,
      thumbW,
      thumbH,
      zoom: ZOOM,
      portalTop,
    });
  };

  const handleMouseLeave = () => onLeave();

  return (
    <div
      className="pd__thumb"
      onMouseEnter={handleMouseMove}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="pd__thumb-img"
        draggable="false"
        onClick={onOpenLightbox}
      />
    </div>
  );
}

// ── Star rating ───────────────────────────────────────────────────────────────
function StarRating({ rating }) {
  return (
    <div className="pd-stars" aria-label={`Rating: ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = rating >= n;
        const half = !filled && rating >= n - 0.5;
        return (
          <svg key={n} width="14" height="14" viewBox="0 0 24 24"
            fill={filled ? 'currentColor' : 'none'}
            stroke="currentColor" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
            className={`pd-stars__star${filled ? ' is-filled' : half ? ' is-half' : ''}`}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      })}
    </div>
  );
}

// ── Spec row ──────────────────────────────────────────────────────────────────
function SpecRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="pd__spec-row">
      <span className="pd__spec-label">{label}</span>
      <span className="pd__spec-value">{value}</span>
    </div>
  );
}


// ── Main component ────────────────────────────────────────────────────────────
function ProductDetail() {
  const { slug } = useParams();
  const { search } = useLocation();
  const navigate = useNavigate();
  const { addItem, toggleWishlist, isWishlisted, isInCart } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [openAcc, setOpenAcc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBuyNowModal, setShowBuyNowModal] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState(null);
  const [pincodeChecking, setPincodeChecking] = useState(false);
  // Zoom state — lifted up so portal can cover the right panel
  const [zoomData, setZoomData] = useState(null); // { src, lx, ly, lensW, lensH, thumbW, thumbH, zoom }
  const [showReviews, setShowReviews] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const openReviews = () => setShowReviews(true);

  const handleIncreaseQty = () => {
    setQuantity((prev) => (displayStock > 0 ? Math.min(displayStock, prev + 1) : prev + 1));
  };
  const handleDecreaseQty = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  useEffect(() => {
    setQuantity(1);
  }, [selectedVariant]);

  const canBuyNow = pincodeResult?.available === true;
  const productId = slug || new URLSearchParams(search).get('product_id') || '';
  const { product: raw, loading: rawLoading, error: rawError } = useProductDetail(productId);

  useEffect(() => {
    if (raw) { setProduct(raw); setSelectedVariant(raw.variants?.[0] ?? null); }
  }, [raw]);
  useEffect(() => { if (rawError) setError(rawError); }, [rawError]);
  useEffect(() => { setLoading(rawLoading); }, [rawLoading]);

  const displayGallery = useMemo(() => {
    const variantImgs = Array.isArray(selectedVariant?.gallery) ? selectedVariant.gallery.filter(Boolean) : [];
    const productImgs = Array.isArray(product?.gallery) ? product.gallery.filter(Boolean) : [];

    // Prioritize variant images first, then append any remaining product images
    const combined = [...variantImgs];
    for (const img of productImgs) {
      if (!combined.includes(img)) {
        combined.push(img);
      }
    }
    return combined.length > 0 ? combined : (productImgs.length > 0 ? productImgs : []);
  }, [selectedVariant, product]);
  const displayPrice = selectedVariant?.sellingPrice ?? product?.price ?? 0;
  const displayMRP = selectedVariant?.mrp ?? product?.originalPrice ?? null;
  const displayStock = selectedVariant?.stock ?? product?.stock ?? 0;
  const displayColorName = selectedVariant?.colorName ?? '';
  const displayColorHex = selectedVariant?.colorHex ?? '';
  const displaySize = selectedVariant?.size ?? '';
  const showMRP = displayMRP && displayMRP > displayPrice;
  const discountPct = showMRP ? Math.round((1 - displayPrice / displayMRP) * 100) : 0;

  const wished = product ? isWishlisted(product.id) : false;
  const cartItemId = selectedVariant ? `${product?.id}__${selectedVariant.variantId}` : (product?.id || '');
  const alreadyInCart = isInCart(cartItemId) || isInCart(product?.id || '');

  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  const handleColorSelect = useCallback((v) => setSelectedVariant(v), []);

  const buildCartItem = useCallback(() => ({
    ...product,
    id: product.id || product.productId,
    price: displayPrice,
    image: displayGallery[0] ?? '',
    selectedColor: displayColorHex,
    selectedSize: displaySize,
    variantId: selectedVariant?.variantId,
    stock: displayStock,
    quantity: quantity,
  }), [product, displayPrice, displayGallery, displayColorHex, displaySize, selectedVariant, displayStock, quantity]);

  const buildNavState = useCallback((mode) => ({
    selectedProduct: buildCartItem(), checkoutMode: mode,
    pincode: pincode || '', pincodeData: pincodeResult ?? null,
  }), [buildCartItem, pincode, pincodeResult]);

  const handleAddToCart = useCallback(() => { if (!product || displayStock === 0) return; addItem(buildCartItem()); },
    [product, displayStock, addItem, buildCartItem]);
  const handleWishlist = useCallback(() => { if (!product) return; toggleWishlist(product); }, [product, toggleWishlist]);
  const closeBuyNowModal = useCallback(() => setShowBuyNowModal(false), []);
  const handleBuyNow = useCallback(() => {
    if (!product) return;
    if (!isUserAuthenticated()) { setShowBuyNowModal(true); return; }
    navigate('/checkout', { state: buildNavState('user') });
  }, [product, buildNavState, navigate]);
  const goCheckoutAsGuest = useCallback(() => { setShowBuyNowModal(false); navigate('/checkout', { state: buildNavState('guest') }); }, [buildNavState, navigate]);
  const goLoginForCheckout = useCallback(() => { setShowBuyNowModal(false); navigate('/login', { state: { from: '/checkout', ...buildNavState('user') } }); }, [buildNavState, navigate]);
  const handleCheckPincode = useCallback(async () => {
    if (!pincode || pincode.trim().length !== 6) { setPincodeResult({ available: false, message: 'Please enter a valid 6-digit pincode' }); return; }
    setPincodeChecking(true); setPincodeResult(null);
    const r = await checkPincodeAction(pincode.trim());
    setPincodeResult(r); setPincodeChecking(false);
  }, [pincode]);

  if (loading) return <div className="pd"><div className="pd__inner"><SkeletonProductDetail /></div></div>;
  if (error || !product) return (
    <div className="pd-not-found">
      <h2>{error || 'Product not found'}</h2>
      <Link to="/products" className="pd-not-found__link">← Back to Products</Link>
    </div>
  return (
    <>
      <ProductDetailSeo product={product} selectedVariant={selectedVariant} path={`/products/${slug || ''}`} />

      {lightbox && (
        <Lightbox images={displayGallery} startIndex={lightbox.index} onClose={() => setLightbox(null)} />
      )}

      <div className="pd">
        <div className="pd__inner">
          {/* pd__layout is position:relative so the zoom portal can anchor to it */}
          <div className="pd__layout">

            {/* ── LEFT: sticky image mosaic ── */}
            <div className="pd__left">
              <div className="pd__mosaic">
                {displayGallery.map((src, i) => {
                  const isSpan2 = displayGallery.length === 1 || (displayGallery.length === 3 && i === 0);
                  return (
                    <div
                      key={`${selectedVariant?.variantId ?? 'base'}-${i}`}
                      className={`pd__mosaic-cell${isSpan2 ? ' pd__mosaic-cell--span-2' : ''}`}
                    >
                      <ZoomThumb
                        src={src}
                        alt={`${toTitleCase(product.name)} ${i + 1}`}
                        cellIndex={i}
                        onHover={setZoomData}
                        onLeave={() => setZoomData(null)}
                        onOpenLightbox={() => setLightbox({ index: i })}
                      />
                      {/* Lens square on the hovered thumb */}
                      {zoomData?.cellIndex === i && (
                        <div
                          className="pd__lens"
                          style={{
                            width: `${zoomData.lensW}px`,
                            height: `${zoomData.lensH}px`,
                            left: `${zoomData.lx}px`,
                            top: `${zoomData.ly}px`,
                          }}
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── ZOOM PORTAL — dedicated inspection box positioned in the right column ── */}
            {zoomData && (
              <div
                className="pd__zoom-portal"
                style={{ top: `${zoomData.portalTop || 0}px` }}
                aria-hidden="true"
              >
                <div className="pd__zoom-badge">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8" x2="11" y2="14" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                  <span>HD Inspection • {ZOOM}×</span>
                </div>
                <div
                  className="pd__zoom-view"
                  style={{
                    backgroundImage: formatBgUrl(zoomData.src),
                    backgroundSize: `${zoomData.thumbW * zoomData.zoom}px ${zoomData.thumbH * zoomData.zoom}px`,
                    backgroundPosition: `-${zoomData.lx * zoomData.zoom}px -${zoomData.ly * zoomData.zoom}px`,
                    backgroundRepeat: 'no-repeat',
                  }}
                />
              </div>
            )}

            {/* ── RIGHT: info panel — matches reference screenshot ── */}
            <div className="pd__right">

              {/* Title: Brand bold + enriched product name (same pattern as PLP) */}
              {(() => {
                const baseName = toTitleCase(product.name);
                const parts = [
                  product.bagCapacity,
                  product.material,
                  product.pattern,
                  product.gender,
                ].filter(Boolean);
                const enriched = parts.length > 0 ? `${baseName} – ${parts.join(', ')}` : baseName;
                return (
                  <h1 className="pd__title">
                  
                    {enriched}
                  </h1>
                );
              })()}
              {/* {product.brand && <p className="pd__brand-sub">{product.brand}</p>} */}

              {/* Rating row — click count to open reviews modal */}
              <div className="pd__rating-row">
                <div className="pd__rating-badge">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <svg key={n} width="13" height="13" viewBox="0 0 24 24"
                      fill={product.rating >= n ? 'currentColor' : 'none'}
                      stroke="currentColor" strokeWidth="1.5">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <span className="pd__rating-sep">|</span>
                <button
                  className="pd__rating-count pd__rating-count--btn"
                  onClick={openReviews}
                  aria-label={`View all ${product.reviewCount || 5} reviews`}
                >
                  {product.reviewCount || 0} Reviews
                </button>
              </div>

              <hr className="pd__divider" />

              {/* Pricing: discount% + MRP + big price */}
              <div className="pd__price-row">
                <span className="pd__price">{fmt(displayPrice)}</span>
                {discountPct > 0 && <span className="pd__off">{discountPct}% off</span>}
                {showMRP && <span className="pd__mrp">{fmt(displayMRP)}</span>}
                {displayStock === 0 && <span className="pd__oos">Out of stock</span>}
              </div>

              {/* COLOR selector — variant image thumbnails, active border */}
              {product.variantColors?.length > 0 && (
                <div className="pd__section">
                  <p className="pd__section-label">
                    Selected Color: <strong>{displayColorName || displayColorHex}</strong>
                  </p>
                  <div className="pd__variant-thumbs">
                    {product.variantColors.map((vc) => {
                      const mv = product.variants?.find((v) => v.colorHex === vc.hex);
                      const isActive = selectedVariant?.colorHex === vc.hex;
                      // Get the primary image for this variant
                      const varImg = mv?.gallery?.[0] || mv?.image || '';
                      return (
                        <button
                          key={vc.hex}
                          className={`pd__variant-thumb${isActive ? ' pd__variant-thumb--on' : ''}`}
                          onClick={(e) => { e.stopPropagation(); mv && handleColorSelect(mv); }}
                          aria-label={vc.name}
                          aria-pressed={isActive}
                          title={vc.name}
                          style={isActive ? {
                            borderColor: vc.hex,
                            boxShadow: `0 0 0 1px ${vc.hex}`,
                          } : undefined}
                        >
                          {varImg ? (
                            <img src={varImg} alt={vc.name} loading="lazy"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                          ) : (
                            // Fallback: solid colour swatch if no image
                            <span className="pd__variant-thumb-color" style={{ background: vc.hex }} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SIZE & QUANTITY in a single row */}
              <div className="pd__size-qty-row">
                {displaySize && (
                  <div className="pd__size-col">
                    <p className="pd__section-label">SIZE: <strong>{displaySize.toUpperCase()}</strong></p>
                    <div className="pd__size-row">
                      {product.variants?.map((v) => v.size).filter(Boolean).filter((s, i, a) => a.indexOf(s) === i).map((sz) => (
                        <button key={sz}
                          type="button"
                          className={`pd__size-chip${displaySize === sz ? ' pd__size-chip--on' : ''}`}
                          onClick={(e) => { e.stopPropagation(); const mv = product.variants?.find((v) => v.size === sz); mv && handleColorSelect(mv); }}
                        >
                          {sz.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pd__qty-col">
                  <p className="pd__section-label">QUANTITY</p>
                  <div className="pd__qty-stepper">
                    <button
                      type="button"
                      className="pd__qty-btn"
                      onClick={handleDecreaseQty}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="pd__qty-val">{quantity}</span>
                    <button
                      type="button"
                      className="pd__qty-btn"
                      onClick={handleIncreaseQty}
                      disabled={displayStock > 0 && quantity >= displayStock}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Feature icon tiles: capacity, material, design, build */}
              {(product.bagCapacity || product.material || product.backpackStyle || product.pattern) && (
                <div className="pd__features">
                  {[
                    product.bagCapacity && { icon: 'bag', label: product.bagCapacity, sub: 'Capacity' },
                    product.material && { icon: 'drop', label: product.material, sub: 'Material' },
                    product.backpackStyle && { icon: 'check', label: product.backpackStyle, sub: 'Design' },
                    product.pattern && { icon: 'shield', label: product.pattern, sub: 'Build' },
                  ].filter(Boolean).slice(0, 4).map((ft, i) => (
                    <div key={i} className="pd__feature-tile">
                      <span className="pd__feature-icon">
                        {ft.icon === 'bag' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 8h12l-1 13H7L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>}
                        {ft.icon === 'drop' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>}
                        {ft.icon === 'check' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 6L9 17l-5-5"/></svg>}
                        {ft.icon === 'shield' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
                      </span>
                      <span className="pd__feature-label">{ft.label}</span>
                      <span className="pd__feature-sub">{ft.sub}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity + CTA */}
              <div className="pd__buy-row">


                <div className="pd__cta-row">
                  <button className="pd__cta pd__cta--cart" onClick={handleAddToCart}
                    disabled={displayStock === 0 || alreadyInCart}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 01-8 0" />
                    </svg>
                    {displayStock === 0 ? 'OUT OF STOCK' : alreadyInCart ? '✓ IN CART' : 'ADD TO CART'}
                  </button>
                  <button className="pd__cta pd__cta--buy" onClick={handleBuyNow}
                    disabled={!canBuyNow || displayStock === 0}
                    title={!canBuyNow ? 'Enter a serviceable pincode to enable Buy Now' : undefined}
                    style={{
                      opacity: canBuyNow && displayStock > 0 ? 1 : 0.45,
                      cursor: canBuyNow && displayStock > 0 ? 'pointer' : 'not-allowed'
                    }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    BUY NOW
                  </button>
                </div>
              </div>
              {/* ── Pincode delivery check ── */}
              <div className="pd__pincode">
                <p className="pd__pincode-label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15">
                    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Check Delivery Availability
                </p>
                <div className="pd__pincode-row">
                  <input
                    type="text" inputMode="numeric" maxLength={6}
                    value={pincode}
                    onChange={(e) => { setPincode(e.target.value.replace(/\D/g, '')); if (pincodeResult) setPincodeResult(null); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleCheckPincode()}
                    placeholder="Enter 6-digit pincode"
                    className="pd__pincode-input"
                  />
                  <button className="pd__pincode-btn" onClick={handleCheckPincode}
                    disabled={pincodeChecking || pincode.length !== 6}>
                    {pincodeChecking ? 'Checking…' : 'Check'}
                  </button>
                </div>
                {pincodeResult ? (
                  <div className={`pd__pincode-result pd__pincode-result--${pincodeResult.available ? 'ok' : 'err'}`}>
                    {pincodeResult.available ? '✅' : '❌'}&nbsp;{pincodeResult.message}
                    {!pincodeResult.available && (
                      <span> — Sorry, delivery not available to this pincode.</span>
                    )}
                  </div>
                ) : (
                  <p className="pd__pincode-hint">Enter pincode to check delivery &amp; enable Buy Now</p>
                )}
              </div>
              {/* Trust strip */}
              <div className="pd__trust">
                {[
                  { icon: 'truck', title: 'Free Delivery', sub: 'On orders above ₹499' },
                  { icon: 'return', title: '7 Days Return', sub: 'Easy returns & refunds' },
                  { icon: 'verify', title: '100% Authentic', sub: 'Genuine products' },
                  { icon: 'support', title: 'Customer Support', sub: '24x7 support' },
                ].map((t) => (
                  <div key={t.title} className="pd__trust-item">
                    <span className="pd__trust-icon">
                      {t.icon === 'truck' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8h4l3 5v3h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>}
                      {t.icon === 'return' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>}
                      {t.icon === 'verify' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" /></svg>}
                      {t.icon === 'support' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" /></svg>}
                    </span>
                    <div>
                      <p className="pd__trust-title">{t.title}</p>
                      <p className="pd__trust-sub">{t.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Buy Now modal */}
              {showBuyNowModal && (
                <div className="pd__modal-backdrop" onClick={closeBuyNowModal} role="dialog" aria-modal="true">
                  <div className="pd__modal" onClick={(e) => e.stopPropagation()}>
                    <h2 className="pd__modal-title">Continue checkout</h2>
                    <p className="pd__modal-copy">Sign in for faster checkout or continue as guest.</p>
                    <div className="pd__modal-actions">
                      <button type="button" className="pd__modal-btn pd__modal-btn--primary" onClick={goLoginForCheckout}>Sign in to checkout</button>
                      <button type="button" className="pd__modal-btn pd__modal-btn--outline" onClick={goCheckoutAsGuest}>Continue as guest</button>
                    </div>
                    <button type="button" className="pd__modal-close" onClick={closeBuyNowModal} aria-label="Close">×</button>
                  </div>
                </div>
              )}


              {(product.material || product.bagCapacity || product.gender || product.characterName
                || product.classType || product.netWeight || product.recommendedAge
                || product.countryOfOrigin || product.gst || product.pattern || product.backpackStyle) && (
                  <div className="pd__spec-block">
                    <p className="pd__spec-block-title">Product Highlights</p>
                    <div className="pd__spec-table">
                      {[
                        ['Material', product.material],
                        ['Capacity', product.bagCapacity],
                        ['Gender', product.gender],
                        ['Pattern', product.pattern],
                        ['Backpack Style', product.backpackStyle],
                        ['Character', product.characterName],
                        ['Class / Grade', product.classType],
                        ['Net Weight', product.netWeight],
                        ['Recommended Age', product.recommendedAge],
                        ['Country', product.countryOfOrigin],
                        ['GST', product.gst ? `${product.gst}%` : null],
                      ].filter(([, v]) => v).map(([label, value]) => (
                        <div key={label} className="pd__spec-row">
                          <span className="pd__spec-key">{label}</span>
                          <span className="pd__spec-val">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* ── Features list ── */}
              {product.features?.length > 0 && (
                <div className="pd__spec-block">
                  <p className="pd__spec-block-title">Key Features</p>
                  <ul className="pd__feat-list">
                    {product.features.map((f, i) => (
                      <li key={i}>
                        {typeof f === 'string' ? f
                          : f.title ? `${f.title}${f.description ? ` — ${f.description}` : ''}` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* ── Full-width product description — below both columns ── */}
          {(product.description || product.shortDescription) && (
            <div className="pd__description">
              <h2 className="pd__description-title">Product Description</h2>
              {product.shortDescription && (
                <p className="pd__description-short">{product.shortDescription}</p>
              )}
              {product.description && product.description !== product.shortDescription && (
                <div
                  className="pd__description-body"
                  dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br/>') }}
                />
              )}
            </div>
          )}

          {/* ── You May Also Like — auto-play 4-card slider ── */}
          <RecentlyViewedSlider
            title="You May Also Like"
            exclude={product.id}
          />
        </div>
      </div>

      {/* ── Reviews modal — lazy: API only called when opened ── */}
      {showReviews && (
        <ReviewsModal
          productId={product.id}
          totalReviews={product.reviewCount || 0}
          avgRating={product.rating || 0}
          mode="reviews"
          allowWrite={false}
          onClose={() => setShowReviews(false)}
        />
      )}
    </>
  );
}

export default ProductDetail;
