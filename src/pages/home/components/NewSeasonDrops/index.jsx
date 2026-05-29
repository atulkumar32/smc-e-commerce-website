import CardSlider from '../../../../components/CardSlider';
import ProductCard from '../../../../components/ProductCard';
import { newDrops } from '../../homeData';
import './style.scss';

// Map homeData newDrops shape → ProductCard shape
const slides = newDrops.map((d) => ({
  id:            d.id,
  name:          d.name,
  price:         d.price,          // already a number in homeData
  originalPrice: null,
  badge:         d.badge ?? null,
  sizes:         [],
  outOfSizes:    [],
  colors:        [],
  image:         d.image,
}));

function NewSeasonDrops() {
  return (
    <section className="drops" aria-labelledby="drops-heading">
      <div className="drops__container">
        <CardSlider
          eyebrow="Fresh Arrivals"
          heading="New Season Drops"
          headingId="drops-heading"
          cardWidth={300}
          gap={24}
          autoPlayMs={3500}
          pauseOnHover
        >
          {slides.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </CardSlider>
      </div>
    </section>
  );
}

export default NewSeasonDrops;
