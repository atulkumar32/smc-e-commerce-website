import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../../../components/ProductCard';
import SkeletonCard from '../../../../components/SkeletonCard';
import { fetchWebProductList } from '../../../../Actions/Web/GetProductListAction';
import { MEDIA_BASE } from '../../../../Config/UrlsConfig';

function resolveImg(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const clean = path.replace(/^\/+/, '');
  const segments = clean.split('/');
  const filename = segments[segments.length - 1];
  const dir = segments.slice(0, -1).join('/');
  const encoded = dir ? `${dir}/${encodeURIComponent(filename)}` : encodeURIComponent(filename);
  return `${MEDIA_BASE}${encoded}`;
}

const FALLBACK_PRODUCTS = [
  {
    id: 'SMC-00001',
    productId: 'SMC-00001',
    name: 'Classic 30L Backpack for Boys & Girls',
    brand: 'SMC',
    badge: 'Best Seller',
    price: 999,
    mrp: 1999,
    originalPrice: 1999,
    rating: 4.7,
    reviews: '1,248',
    image: 'https://images.unsplash.com/photo-1622560480654-d96214fdc887?auto=format&fit=crop&w=700&q=80',
    bagCapacity: '30L',
    material: 'Polyester',
    gender: 'Unisex',
    colors: [{ hex: '#1B2B4B', name: 'Navy' }, { hex: '#111111', name: 'Black' }],
  },
  {
    id: 'SMC-00002',
    productId: 'SMC-00002',
    name: 'Korean Style School Backpack for Girls',
    brand: 'SMC',
    badge: 'New Arrival',
    price: 799,
    mrp: 1499,
    originalPrice: 1499,
    rating: 4.6,
    reviews: '856',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=80',
    bagCapacity: '25L',
    material: 'Nylon',
    gender: 'Girls',
    colors: [{ hex: '#E91E8C', name: 'Pink' }, { hex: '#7C3AED', name: 'Purple' }],
  },
  {
    id: 'SMC-00003',
    productId: 'SMC-00003',
    name: 'Premium Laptop Backpack up to 15.6 Inch',
    brand: 'SMC',
    badge: 'Trending',
    price: 1299,
    mrp: 2499,
    originalPrice: 2499,
    rating: 4.8,
    reviews: '642',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=700&q=80',
    bagCapacity: '35L',
    material: 'Leatherette',
    gender: 'Unisex',
    colors: [{ hex: '#222222', name: 'Obsidian' }, { hex: '#8A8F98', name: 'Grey' }],
  },
  {
    id: 'SMC-00004',
    productId: 'SMC-00004',
    name: 'Elegant Tote Bag for Office & Daily Use',
    brand: 'SMC',
    badge: 'Best Seller',
    price: 899,
    mrp: 1799,
    originalPrice: 1799,
    rating: 4.6,
    reviews: '421',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=700&q=80',
    bagCapacity: '20L',
    material: 'Canvas',
    gender: 'Women',
    colors: [{ hex: '#C4841F', name: 'Tan' }, { hex: '#1B1B1B', name: 'Black' }],
  },
];

export default function VBestsellers() {
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadProducts() {
      try {
        const res = await fetchWebProductList({ limit: 8 });
        const list = res?.data?.products || res?.products || res?.data || [];
        if (Array.isArray(list) && list.length > 0 && active) {
          const mapped = list.slice(0, 4).map((p) => {
            let img = '';
            if (Array.isArray(p.variants) && p.variants.length > 0) {
              for (const v of p.variants) {
                const imgs = Array.isArray(v.images) ? v.images : [];
                if (imgs.length) {
                  const main = imgs.find((i) => i.is_main) || imgs[0];
                  if (main?.image_url) { img = resolveImg(main.image_url); break; }
                }
              }
            }
            if (!img && p.primary_image) img = resolveImg(p.primary_image);

            const firstVar = Array.isArray(p.variants) && p.variants[0];
            const price = Number(p.selling_price ?? p.price ?? firstVar?.selling_price ?? 999);
            const mrp = Number(p.mrp ?? firstVar?.mrp ?? p.originalPrice ?? price);

            return {
              id: p.product_id || p.id,
              productId: p.product_id || p.id,
              name: p.product_name || p.name || 'School Bag',
              brand: p.brand || 'SMC',
              price,
              originalPrice: mrp > price ? mrp : null,
              image: img || FALLBACK_PRODUCTS[0].image,
              rating: p.rating || 4.7,
              reviewCount: p.review_count || p.reviews_count || '128',
              bagCapacity: p.capacity || p.bag_capacity || null,
              material: p.material || null,
              gender: p.gender || null,
              colors: Array.isArray(p.variants)
                ? p.variants.map((v) => ({ hex: v.color_hex || '#333', name: v.color_name || '' }))
                : [],
            };
          });
          setProducts(mapped);
        }
      } catch {
        // Fallback to FALLBACK_PRODUCTS
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProducts();
    return () => { active = false; };
  }, []);

  return (
    <section className="v-section" style={{ paddingTop: 20 }}>
      <div className="v-section__container">
        <div className="v-section__header">
          <h2 className="v-section__title">Bestsellers</h2>
          <Link to="/products" className="v-section__view-all">View All →</Link>
        </div>

        {loading ? (
          <div className="v-products__grid">
            <SkeletonCard count={4} />
          </div>
        ) : (
          <div className="v-products__grid">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
