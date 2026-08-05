import { useState, useCallback, useEffect } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { isUserAuthenticated } from '../../../services/apiClients';
import { RECENTLY_VIEWED } from '../productData';
import useProductDetail from '../useProductDetail';
import { checkPincodeAction } from '../../../Actions/CheckPinCodeAction';
import './style.scss';

// ── Star rating ───────────────────────────────────────────────────────────────
function StarRating({ rating }) {
  return (
    <div className="pd-stars" aria-label={`Rating: ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = rating >= n;
        const half   = !filled && rating >= n - 0.5;
        return (
          <svg key={n} width="16" height="16" viewBox="0 0 24 24"
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

// ── Accordion item ────────────────────────────────────────────────────────────
function AccordionItem({ item, isOpen, onToggle }) {
  return (
    <div className="pd-accordion__item">
      <button className="pd-accordion__trigger" onClick={onToggle}
        aria-expanded={isOpen} aria-controls={`acc-${item.id}`}>
        <span className="pd-accordion__label">{item.title}</span>
        <svg className={`pd-accordion__chevron${isOpen ? ' is-open' : ''}`}
          width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          strokeLinejoin="round" aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div id={`acc-${item.id}`}
        className={`pd-accordion__body${isOpen ? ' is-open' : ''}`} role="region">
        <div className="pd-accordion__content">
          {item.list
            ? <ul className="pd-accordion__list">{item.list.map((li) => <li key={li}>{li}</li>)}</ul>
            : <p>{item.content}</p>}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
function ProductDetail() {
  const { slug }   = useParams();
  const { search } = useLocation();
  const navigate   = useNavigate();
  const { addItem, toggleWishlist, isWishlisted } = useCart();

  const [product,         setProduct]         = useState(null);
  const [activeImg,       setActiveImg]        = useState(0);
  const [selectedVariant, setSelectedVariant]  = useState(null);
  const [openAcc,         setOpenAcc]          = useState(null);
  const [loading,         setLoading]          = useState(true);
  const [error,           setError]            = useState('');
  const [showBuyNowModal, setShowBuyNowModal]  = useState(false);
  const [pincode,         setPincode]          = useState('');
  const [pincodeResult,   setPincodeResult]    = useState(null);
  const [pincodeChecking, setPincodeChecking]  = useState(false);

  const canBuyNow = pincodeResult?.available === true;
  const productId = new URLSearchParams(search).get('product_id') || slug;
  const { product: raw, loading: rawLoading, error: rawError } = useProductDetail(productId);

  useEffect(() => {
    if (raw) {
      setProduct(raw);
      setSelectedVariant(raw.variants?.[0] ?? null);
      setActiveImg(0);
    }
  }, [raw]);
  useEffect(() => { if (rawError) setError(rawError); },  [rawError]);
  useEffect(() => { setLoading(rawLoading); },            [rawLoading]);

  // Derived display values — switch everything when variant changes
  const displayGallery   = selectedVariant?.gallery?.length > 0
    ? selectedVariant.gallery : (product?.gallery ?? []);
  const displayPrice     = selectedVariant?.sellingPrice  ?? product?.price        ?? 0;
  const displayMRP       = selectedVariant?.mrp           ?? product?.originalPrice ?? null;
  const displayStock     = selectedVariant?.stock         ?? product?.stock         ?? 0;
  const displayColorName = selectedVariant?.colorName ?? '';
  const displayColorHex  = selectedVariant?.colorHex  ?? '';
  const displaySize      = selectedVariant?.size       ?? '';
  const showMRP          = displayMRP && displayMRP > displayPrice;

  const wished     = product ? isWishlisted(product.id) : false;
  const formatPrice = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  // Color swatch click → switch variant + reset image index
  const handleColorSelect = useCallback((variant) => {
    setSelectedVariant(variant);
    setActiveImg(0);
  }, []);

  const buildCartItem = useCallback(() => ({
    ...product,
    price:         displayPrice,
    image:         displayGallery[0] ?? '',
    selectedColor: displayColorHex,
    selectedSize:  displaySize,
    variantId:     selectedVariant?.variantId,
    quantity:      1,
  }), [product, displayPrice, displayGallery, displayColorHex, displaySize, selectedVariant]);

  // Pass pincode data to checkout so it's pre-filled
  const buildNavState = useCallback((mode) => ({
    selectedProduct: buildCartItem(),
    checkoutMode: mode,
    pincode: pincode || '',
    pincodeData: pincodeResult ?? null,
  }), [buildCartItem, pincode, pincodeResult]);

  const handleAddToCart    = useCallback(() => { if (!product || displayStock === 0) return; addItem(buildCartItem()); },
    [product, displayStock, addItem, buildCartItem]);
  const handleWishlist     = useCallback(() => { if (!product) return; toggleWishlist(product); }, [product, toggleWishlist]);
  const closeBuyNowModal   = useCallback(() => setShowBuyNowModal(false), []);

  const handleBuyNow = useCallback(() => {
    if (!product) return;
    if (!isUserAuthenticated()) { setShowBuyNowModal(true); return; }
    navigate('/checkout', { state: buildNavState('user') });
  }, [product, buildNavState, navigate]);

  const goCheckoutAsGuest = useCallback(() => {
    setShowBuyNowModal(false);
    navigate('/checkout', { state: buildNavState('guest') });
  }, [buildNavState, navigate]);

  const goLoginForCheckout = useCallback(() => {
    setShowBuyNowModal(false);
    navigate('/login', { state: { from: '/checkout', ...buildNavState('user') } });
  }, [buildNavState, navigate]);

  const handleCheckPincode = useCallback(async () => {
    if (!pincode || pincode.trim().length !== 6) {
      setPincodeResult({ available: false, message: 'Please enter a valid 6-digit pincode' }); return;
    }
    setPincodeChecking(true); setPincodeResult(null);
    const result = await checkPincodeAction(pincode.trim());
    setPincodeResult(result); setPincodeChecking(false);
  }, [pincode]);

  if (loading) return <div className="pd-not-found"><h2>Loading product details…</h2></div>;
  if (error || !product) return (
    <div className="pd-not-found">
      <h2>{error || 'Product not found'}</h2>
      <Link to="/products" className="pd-not-found__link">← Back to Products</Link>
    </div>
  );

  return (
    <div className="pd">
      <div className="pd__inner">
        <div className="pd__grid">

          {/* ── LEFT: Gallery ── */}
          <div className="pd__gallery">
            <div className="pd__thumbs" role="list" aria-label="Product images">
              {displayGallery.map((src, i) => (
                <button key={`${selectedVariant?.variantId ?? 'base'}-${i}`} role="listitem"
                  className={`pd__thumb${i === activeImg ? ' is-active' : ''}`}
                  onClick={() => setActiveImg(i)}
                  aria-label={`View image ${i + 1}`} aria-pressed={i === activeImg}>
                  <img src={src} alt={`${product.name} view ${i + 1}`} loading="lazy" />
                </button>
              ))}
            </div>
            <div className="pd__main-img-wrap">
              <img key={`${selectedVariant?.variantId ?? 'base'}-${activeImg}`}
                src={displayGallery[activeImg] ?? displayGallery[0]}
                alt={product.name} className="pd__main-img" />
              {product.badge && (
                <span className={`pd__badge pd__badge--${product.badge.toLowerCase()}`}>{product.badge}</span>
              )}
            </div>
          </div>

          {/* ── RIGHT: Info ── */}
          <div className="pd__info">
            <nav className="pd__breadcrumb" aria-label="Breadcrumb">
              <Link to="/products" className="pd__breadcrumb-link">Bags</Link>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <span className="pd__breadcrumb-current">{product.name}</span>
            </nav>

            <h1 className="pd__title">{product.name}</h1>
            <div className="pd__rating">
              <StarRating rating={product.rating} />
              <span className="pd__rating-count">({product.reviewCount} Reviews)</span>
            </div>

            {/* Price — updates when variant changes */}
            <div className="pd__pricing">
              <span className="pd__price">{formatPrice(displayPrice)}</span>
              {showMRP && <span className="pd__original">{formatPrice(displayMRP)}</span>}
              {displayStock === 0 && (
                <span style={{ color: '#dc2626', fontSize: '0.82rem', marginLeft: 8 }}>Out of stock</span>
              )}
            </div>

            {/* {product.description && <p className="pd__desc">{product.description}</p>} */}

            {/* ── Colour swatches — each = one variant ── */}
            {product.variantColors?.length > 0 && (
              <div className="pd__variant-group">
                <span className="pd__variant-label">
                  COLOR: <strong>{displayColorName}</strong>
                </span>
                <div className="pd__colors">
                  {product.variantColors.map((vc) => {
                    const matchVariant = product.variants.find((v) => v.colorHex === vc.hex);
                    const isActive     = selectedVariant?.colorHex === vc.hex;
                    return (
                      <button key={vc.hex}
                        className={`pd__color-btn${isActive ? ' is-active' : ''}`}
                        style={{ backgroundColor: vc.hex }}
                        onClick={() => matchVariant && handleColorSelect(matchVariant)}
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

            {/* CTA */}
            <div className="pd__cta">
              <button className="pd__btn pd__btn--cart" onClick={handleAddToCart}
                disabled={displayStock === 0}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6" />
                </svg>
                {displayStock === 0 ? 'Out of Stock' : 'Add to Cart'}
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
                    <button type="button" className="pd__modal-btn pd__modal-btn--primary" onClick={goLoginForCheckout}>
                      Sign in to checkout
                    </button>
                    <button type="button" className="pd__modal-btn pd__modal-btn--outline" onClick={goCheckoutAsGuest}>
                      Continue as guest
                    </button>
                  </div>
                  <button type="button" className="pd__modal-close" onClick={closeBuyNowModal} aria-label="Close">×</button>
                </div>
              </div>
            )}

            {/* Accordion */}
            {product.accordion?.length > 0 && (
              <div className="pd__accordion" role="list">
                {product.accordion.map((item) => (
                  <AccordionItem key={item.id} item={item}
                    isOpen={openAcc === item.id}
                    onToggle={() => setOpenAcc(openAcc === item.id ? null : item.id)} />
                ))}
              </div>
            )}

            {/* Pincode */}
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
                    {!pincodeResult.available && <p className="pd__pincode-hint">Sorry, we don't deliver to this pincode yet.</p>}
                  </div>
                </div>
              )}
              {!pincodeResult && <p className="pd__pincode-hint">Enter your pincode to check delivery and enable Buy Now.</p>}
            </div>
          </div>
        </div>
           {product.description && <p className="pd__desc">{product.description}</p>}

        {/* Recently Viewed */}
        <section className="pd__recent" aria-labelledby="recent-heading">
          <h2 className="pd__recent-title" id="recent-heading">Recently Viewed</h2>
          <div className="pd__recent-track">
            {RECENTLY_VIEWED.map((item) => (
              <div key={item.id} className="pd__recent-card">
                <div className="pd__recent-img-wrap">
                  <img src={item.image} alt={item.name} loading="lazy" className="pd__recent-img" />
                </div>
                <div className="pd__recent-body">
                  <p className="pd__recent-cat">{item.category}</p>
                  <h3 className="pd__recent-name">{item.name}</h3>
                  <p className="pd__recent-price">{formatPrice(item.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default ProductDetail;
