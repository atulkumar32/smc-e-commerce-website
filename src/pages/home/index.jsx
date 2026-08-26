import HeroSection from './components/HeroSection';
import HeroSlider from './components/HeroSlider/index.jsx';
import MahaveerLegacy from './components/MahaveerLegacy';
import Collections from './components/Collections';
import CollectionsShowcase from './components/CollectionsShowcase';
import NewSeasonDrops from './components/NewSeasonDrops';
import CraftsmanshipIcons from './components/CraftsmanshipIcons';
import MahaveerMoments from './components/MahaveerMoments';
import './style.scss';

function HomePage() {
  return (
    <main className="home">
      <HeroSlider />
      {/* <HeroSection /> — kept for reference, not removed */}
      <MahaveerLegacy />
      <Collections />
      <CollectionsShowcase />
      <NewSeasonDrops />
      <CraftsmanshipIcons />
      <MahaveerMoments />
    </main>
  );
}

export default HomePage;
