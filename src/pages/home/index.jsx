import HeroSection from './components/HeroSection';
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
      <HeroSection />
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
