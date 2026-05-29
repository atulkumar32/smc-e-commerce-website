import ExpandSlider from '../../../../components/ExpandSlider';
import { expandSlides } from '../../homeData';

// Inline SVG icons — one per slide, matched by index
const ICONS = [
  // School Bags — backpack
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 12V22H4V12" /><path d="M22 7H2v5h20V7z" />
    <path d="M12 22V7" /><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
  </svg>,
  // Winter — snowflake
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="12" y1="2" x2="12" y2="22" /><line x1="2" y1="12" x2="22" y2="12" />
    <path d="M20 16l-4-4 4-4" /><path d="M4 8l4 4-4 4" />
    <path d="M16 4l-4 4-4-4" /><path d="M8 20l4-4 4 4" />
  </svg>,
  // Leather — leaf / tree
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17 8C8 10 5.9 16.17 3.82 19.34L5.71 21l1-1 1 1 1-1 1 1 1-1 1 1 1-1 1 1 1-1 1 1 1.29-1.29C19.5 15.24 21 12 21 8c0 0-2 0-4 0z" />
    <line x1="3.82" y1="19.34" x2="12" y2="11" />
  </svg>,
  // Purses — droplet
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2C6 9 4 13.5 4 16a8 8 0 0016 0c0-2.5-2-7-8-14z" />
  </svg>,
  // New Arrivals — sun
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>,
];

// Merge icons into slide data
const slides = expandSlides.map((s, i) => ({ ...s, icon: ICONS[i] }));

function CollectionsShowcase() {
  return (
    <ExpandSlider
      eyebrow="Explore the Range"
      heading="Our Collections"
      items={slides}
    />
  );
}

export default CollectionsShowcase;
