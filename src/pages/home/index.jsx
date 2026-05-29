import HeroSection from './components/HeroSection';
import MahaveerLegacy from './components/MahaveerLegacy';
import Collections from './components/Collections';
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
      <NewSeasonDrops />
      <CraftsmanshipIcons />
      <MahaveerMoments />
    </main>
  );
}

export default HomePage;
