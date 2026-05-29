import ProductCard from '../../../../components/ProductCard';
import './style.scss';

function FeaturedProducts() {
  const products = [];

  return (
    <section className="featured-products">
      <h2 className="featured-products__title">Featured Products</h2>
      <div className="featured-products__grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default FeaturedProducts;
