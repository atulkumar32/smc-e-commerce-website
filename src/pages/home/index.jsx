/**
 * Home Page — VORANO redesign 2026
 *
 * New section order (matches reference HTML):
 *   VHero → VCategories → VBestsellers → VPromoBanners → VBenefits
 *
 * Old sections are imported but commented out below for reference.
 * All existing functionality (routing, cart, wishlist) is preserved.
 */

// ── NEW VORANO COMPONENTS ─────────────────────────────────────
import VHero                from './components/VHero';
import VCategories          from './components/VCategories';
import VBestsellers         from './components/VBestsellers';
import VSignatureCollection from './components/VSignatureCollection';
import VBrandSpotlight      from './components/VBrandSpotlight';
import VPromoBanners        from './components/VPromoBanners';
import VBenefits            from './components/VBenefits';

// ── OLD COMPONENTS (preserved for reference) ──────────────────
// import HeroSection       from './components/HeroSection';
// import HeroSlider        from './components/HeroSlider/index.jsx';
// import MahaveerLegacy    from './components/MahaveerLegacy';
// import Collections       from './components/Collections';
// import CollectionsShowcase from './components/CollectionsShowcase';
// import NewSeasonDrops    from './components/NewSeasonDrops';
// import CraftsmanshipIcons from './components/CraftsmanshipIcons';
// import MahaveerMoments   from './components/MahaveerMoments';

import './vorano.scss';
// import './style.scss'; // old home styles (kept for reference)

function HomePage() {
  return (
    <main>
      {/* ── NEW VORANO SECTIONS ── */}
      <VHero />
      <VCategories />
      <VBestsellers />
      <VSignatureCollection />
      <VBrandSpotlight />
      <VPromoBanners />
      <VBenefits />

      {/* ── OLD SECTIONS (commented out — restore if needed) ──
      <HeroSlider />
      <MahaveerLegacy />
      <Collections />
      <CollectionsShowcase />
      <NewSeasonDrops />
      <CraftsmanshipIcons />
      <MahaveerMoments />
      ── */}
    </main>
  );
}

export default HomePage;
