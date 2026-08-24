import { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { isUserAuthenticated } from '../../../services/apiClients';
import useProductDetail from '../useProductDetail';
import { checkPincodeAction } from '../../../Actions/CheckPinCodeAction';
import SkeletonProductDetail from '../../../components/SkeletonProductDetail';
import ProductDetailSeo from '../../../components/Seo/ProductDetailSeo';
import RecentlyViewedSlider from '../../../components/RecentlyViewedSlider';
import { toTitleCase } from '../../../utils/slug';
import './style.scss';

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape')     onClose();
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

// ── Star rating ───────────────────────────────────────────────────────────────
function StarRating({ rating }) {
  return (
    <div className="pd-stars" aria-label={`Rating: ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = rating >= n;
        const half   = !filled && rating >= n - 0.5;
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
  const { slug }   = useParams();
  const { search } = useLocation();
  const navigate   = useNavigate();
  const { addItem, toggleWishlist, isWishlisted, isInCart } = useCart();

  const [product,         setProduct]         = useState(null);
  const [selectedVariant, setSelectedVariant]  = useState(null);
  const [openAcc,         setOpenAcc]          = useState(null);
  const [loading,         setLoading]          = useState(true);
  const [error,           setError]            = useState('');
  const [showBuyNowModal, setShowBuyNowModal]  = useState(false);
  const [lightbox,        setLightbox]         = useState(null); // null | { index }
  const [pincode,         setPincode]          = useState('');
  const [pincodeResult,   setPincodeResult]    = useState(null);
  const [pincodeChecking, setPincodeChecking]  = useState(false);

  const canBuyNow = pincodeResult?.available === true;
  const productId = slug || new URLSearchParams(search).get('product_id') || '';
  const { product: raw, loading: rawLoading, error: rawError } = useProductDetail(productId);

  useEffect(() => {
    if (raw) { setProduct(raw); setSelectedVariant(raw.variants?.[0] ?? null); }
  }, [raw]);
  useEffect(() => { if (rawError) setError(rawError); }, [rawError]);
  useEffect(() => { setLoading(rawLoading); }, [rawLoading]);

  const displayGallery   = selectedVariant?.gallery?.length > 0 ? selectedVariant.gallery : (product?.gallery ?? []);
  const displayPrice     = selectedVariant?.sellingPrice  ?? product?.price        ?? 0;
  const displayMRP       = selectedVariant?.mrp           ?? product?.originalPrice ?? null;
  const displayStock     = selectedVariant?.stock         ?? product?.stock         ?? 0;
  const displayColorName = selectedVariant?.colorName ?? '';
  const displayColorHex  = selectedVariant?.colorHex  ?? '';
  const displaySize      = selectedVariant?.size       ?? '';
  const showMRP          = displayMRP && displayMRP > displayPrice;
  const discountPct      = showMRP ? Math.round((1 - displayPrice / displayMRP) * 100) : 0;

  const wished        = product ? isWishlisted(product.id) : false;
  const cartItemId    = selectedVariant ? `${product?.id}__${selectedVariant.variantId}` : (product?.id || '');
  const alreadyInCart = isInCart(cartItemId) || isInCart(product?.id || '');

  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  const handleColorSelect = useCallback((v) => setSelectedVariant(v), []);

  const buildCartItem = useCallback(() => ({
    ...product,
    id:            product.id || product.productId,
    price:         displayPrice,
    image:         displayGallery[0] ?? '',
    selectedColor: displayColorHex,
    selectedSize:  displaySize,
    variantId:     selectedVariant?.variantId,
    stock:         displayStock,
    quantity:      1,
  }), [product, displayPrice, displayGallery, displayColorHex, displaySize, selectedVariant, displayStock]);

  const buildNavState = useCallback((mode) => ({
    selectedProduct: buildCartItem(), checkoutMode: mode,
    pincode: pincode || '', pincodeData: pincodeResult ?? null,
  }), [buildCartItem, pincode, pincodeResult]);

  const handleAddToCart  = useCallback(() => { if (!product || displayStock === 0) return; addItem(buildCartItem()); },
    [product, displayStock, addItem, buildCartItem]);
  const handleWishlist   = useCallback(() => { if (!product) return; toggleWishlist(product); }, [product, toggleWishlist]);
  const closeBuyNowModal = useCallback(() => setShowBuyNowModal(false), []);
  const handleBuyNow     = useCallback(() => {
    if (!product) return;
    if (!isUserAuthenticated()) { setShowBuyNowModal(true); return; }
    navigate('/checkout', { state: buildNavState('user') });
  }, [product, buildNavState, navigate]);
  const goCheckoutAsGuest  = useCallback(() => { setShowBuyNowModal(false); navigate('/checkout', { state: buildNavState('guest') }); }, [buildNavState, navigate]);
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
  );

  // Build 2×2 mosaic grid (Flipkart style)
  const gridImages = displayGallery.slice(0, 4);
  const extraCount = displayGallery.length > 4 ? displayGallery.length - 4 : 0;

  return (
    <>
      <ProductDetailSeo product={product} selectedVariant={selectedVariant} path={`/products/${slug || ''}`} />

      {lightbox && (
        <Lightbox images={displayGallery} startIndex={lightbox.index} onClose={() => setLightbox(null)} />
      )}

      <div className="pd">
        <div className="pd__inner">
          <div className="pd__layout">

            {/* ── LEFT: sticky image mosaic ── */}
            <div className="pd__left">
              <div className="pd__mosaic">
                {gridImages.map((src, i) => (
                  <button key={`${selectedVariant?.variantId ?? 'base'}-${i}`}
                    className="pd__mosaic-cell"
                    onClick={() => setLightbox({ index: i })}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img src={src} alt={`${toTitleCase(product.name)} ${i + 1}`} loading={i === 0 ? 'eager' : 'lazy'} />
                    {/* +N overlay on last cell if more images exist */}
                    {i === 3 && extraCount > 0 && (
                      <div className="pd__mosaic-more">+{extraCount}</div>
                    )}
                  </button>
                ))}
                {/* Fill empty cells if fewer than 4 images */}
                {gridImages.length < 4 && Array.from({ length: 4 - gridImages.length }).map((_, i) => (
                  <div key={`empty-${i}`} className="pd__mosaic-cell pd__mosaic-cell--empty" />
                ))}
              </div>

              {product.badge && (
                <span className={`pd__badge pd__badge--${product.badge.toLowerCase()}`}>{product.badge}</span>
              )}
            </div>

            {/* ── RIGHT: sticky info panel ── */}
            <div className="pd__right">

              {/* Breadcrumb */}
              <nav className="pd__breadcrumb" aria-label="Breadcrumb">
                <Link to="/products" className="pd__breadcrumb-link">Bags</Link>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                <span className="pd__breadcrumb-current">{toTitleCase(product.name)}</span>
              </nav>

              {/* H1 */}
              <h1 className="pd__title">{toTitleCase(product.name)}</h1>
              {product.brand && <p className="pd__brand">{product.brand}</p>}

              {/* Rating */}
              <div className="pd__rating">
                <div className="pd__rating-badge">
                  <StarRating rating={product.rating} />
                  <span>{product.rating}</span>
                </div>
                <span className="pd__rating-sep">|</span>
                <span className="pd__rating-count">{product.reviewCount} Reviews</span>
              </div>

              <hr className="pd__divider" />

              {/* Price */}
              <div className="pd__pricing">
                {discountPct > 0 && <span className="pd__discount">↓{discountPct}% off</span>}
                {showMRP && <span className="pd__mrp">{fmt(displayMRP)}</span>}
                <span className="pd__price">{fmt(displayPrice)}</span>
                {displayStock === 0 && <span className="pd__oos">Out of stock</span>}
              </div>

              {product.shortDescription && (
                <p className="pd__desc">{product.shortDescription}</p>
              )}

              {/* Colour swatches */}
              {product.variantColors?.length > 0 && (
                <div className="pd__variant-group">
                  <span className="pd__variant-label">
                    COLOR: <strong>{displayColorName}</strong>
                  </span>
                  <div className="pd__colors">
                    {product.variantColors.map((vc) => {
                      const mv = product.variants.find((v) => v.colorHex === vc.hex);
                      const isActive = selectedVariant?.colorHex === vc.hex;
                      return (
                        <button key={vc.hex}
                          className={`pd__color-btn${isActive ? ' is-active' : ''}`}
                          style={{ backgroundColor: vc.hex }}
                          onClick={() => mv && handleColorSelect(mv)}
                          aria-label={vc.name} aria-pressed={isActive} title={vc.name} />
                      );
                    })}
                  </div>
                  {displaySize && (
                    <span className="pd__variant-label" style={{ marginTop: 4 }}>
                      SIZE: <strong>{displaySize}</strong>
                    </span>
                  )}
                </div>
              )}

              {/* CTA buttons */}
              <div className="pd__cta">
                <button className="pd__btn pd__btn--cart" onClick={handleAddToCart}
                  disabled={displayStock === 0 || alreadyInCart}
                  style={{ opacity: alreadyInCart ? 0.75 : 1 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6" />
                  </svg>
                  {displayStock === 0 ? 'Out of Stock' : alreadyInCart ? '✓ Already in Cart' : 'Add to Cart'}
                </button>
                <button className="pd__btn pd__btn--buy" onClick={handleBuyNow}
                  disabled={!canBuyNow || displayStock === 0}
                  title={!canBuyNow ? 'Enter a serviceable pincode to enable Buy Now' : ''}
                  style={{ opacity: canBuyNow && displayStock > 0 ? 1 : 0.45,
                           cursor:  canBuyNow && displayStock > 0 ? 'pointer' : 'not-allowed' }}>
                  Buy Now
                </button>
                <button className={`pd__btn pd__btn--wish${wished ? ' is-wished' : ''}`}
                  onClick={handleWishlist} aria-pressed={wished}
                  aria-label={wished ? 'Remove from wishlist' : 'Save to wishlist'}>
                  <svg width="18" height="18" viewBox="0 0 24 24"
                    fill={wished ? 'currentColor' : 'none'} stroke="currentColor"
                    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                  </svg>
                  {wished ? 'Wishlisted' : 'Save to Wishlist'}
                </button>
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

              {/* Pincode check — before highlights */}
              <div className="pd__pincode">
                <p className="pd__pincode-label">📦 Check delivery availability</p>
                <div className="pd__pincode-row">
                  <input type="text" inputMode="numeric" maxLength={6} value={pincode}
                    onChange={(e) => { setPincode(e.target.value.replace(/\D/g, '')); if (pincodeResult) setPincodeResult(null); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleCheckPincode()}
                    placeholder="Enter 6-digit pincode" className="pd__pincode-input" />
                  <button className="pd__pincode-btn" onClick={handleCheckPincode}
                    disabled={pincodeChecking || pincode.length !== 6}>
                    {pincodeChecking ? 'Checking…' : 'Check'}
                  </button>
                </div>
                {pincodeResult && (
                  <div className={`pd__pincode-result pd__pincode-result--${pincodeResult.available ? 'success' : 'error'}`}>
                    <span className="pd__pincode-result__icon">{pincodeResult.available ? '✅' : '❌'}</span>
                    <div>
                      <strong>{pincodeResult.message}</strong>
                      {!pincodeResult.available && (
                        <p className="pd__pincode-hint">Sorry, we don't deliver to this pincode yet.</p>
                      )}
                    </div>
                  </div>
                )}
                {!pincodeResult && (
                  <p className="pd__pincode-hint">Enter your pincode to check delivery and enable Buy Now.</p>
                )}
              </div>

              {/* Product highlights */}
              {(product.material || product.bagCapacity || product.gender || product.characterName
                || product.classType || product.netWeight || product.recommendedAge
                || product.countryOfOrigin || product.gst) && (
                <div className="pd__highlights">
                  <p className="pd__highlights-title">Product highlights</p>
                  <div className="pd__spec-grid">
                    <SpecRow label="Material"        value={product.material} />
                    <SpecRow label="Capacity"         value={product.bagCapacity} />
                    <SpecRow label="Gender"           value={product.gender} />
                    <SpecRow label="Character"        value={product.characterName} />
                    <SpecRow label="Class / Grade"    value={product.classType} />
                    <SpecRow label="Net Weight"       value={product.netWeight} />
                    <SpecRow label="Recommended Age"  value={product.recommendedAge} />
                    <SpecRow label="Backpack Style"   value={product.backpackStyle} />
                    <SpecRow label="Pattern"          value={product.pattern} />
                    <SpecRow label="Country"          value={product.countryOfOrigin} />
                    {product.gst && <SpecRow label="GST" value={`${product.gst}%`} />}
                  </div>
                </div>
              )}

              {/* Features */}
              {product.features?.length > 0 && (
                <div className="pd__features">
                  <p className="pd__highlights-title">Features</p>
                  <ul className="pd__features-list">
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
    </>
  );
}

export default ProductDetail;
