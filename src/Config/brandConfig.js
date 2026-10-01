/**
 * brandConfig.js
 *
 * Centralized Brand Configuration, Social Links, and Concierge Data for
 * Shree Mahaveer Collections.
 *
 * Import this file across any component or page to maintain single-source-of-truth
 * consistency for social profiles, support helplines, showroom addresses, and metadata.
 */

// ── Brand Metadata ─────────────────────────────────────────────────────────────
export const BRAND_NAME = 'Shree Mahaveer Collections';
export const BRAND_SHORT_NAME = 'SMC';
export const BRAND_TAGLINE = 'Bags for a Brighter Tomorrow. Stylish. Functional. For Every Journey.';
export const BRAND_FOUNDED_YEAR = 1998;
export const BRAND_WEBSITE = 'https://shreemahaveercollections.com';

// ── Official Social Media Links ────────────────────────────────────────────────
export const BRAND_SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/shreemahaveercollections/',
  facebook: 'https://www.facebook.com/shreemahaveercollections',
  youtube: 'https://www.youtube.com/@shreemahaveercollections',
  whatsapp: 'https://wa.me/919876543210',
  pinterest: 'https://www.pinterest.com/shreemahaveercollections',
  twitter: 'https://twitter.com/shreemahaveer',
};

// ── Direct iterable list for loops / icon strips ──────────────────────────────
export const BRAND_SOCIAL_LIST = [
  {
    id: 'instagram',
    name: 'Instagram',
    url: BRAND_SOCIAL_LINKS.instagram,
    handle: '@shreemahaveercollections',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    url: BRAND_SOCIAL_LINKS.facebook,
    handle: 'shreemahaveercollections',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    url: BRAND_SOCIAL_LINKS.youtube,
    handle: '@shreemahaveercollections',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    url: BRAND_SOCIAL_LINKS.whatsapp,
    handle: '+91 98765 43210',
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    url: BRAND_SOCIAL_LINKS.pinterest,
    handle: 'shreemahaveercollections',
  },
];

// ── Contact & Concierge Information ───────────────────────────────────────────
export const BRAND_CONTACT = {
  // Helplines
  phone: '+91 98765 43210',
  phoneRaw: '+919876543210',
  phoneDisplay: '+91 98765 43210',
  phoneTel: 'tel:+919876543210',
  supportHours: 'Mon – Sat: 10:00 AM – 7:00 PM IST',

  // Messaging & WhatsApp
  whatsappNumber: '+91 98765 43210',
  whatsappLink: 'https://wa.me/919876543210',

  // Emails
  email: 'support@shreemahaveer.com',
  supportEmail: 'support@shreemahaveer.com',
  careEmail: 'care@shreemahaveercollections.com',
  emailMailto: 'mailto:support@shreemahaveer.com',
  careEmailMailto: 'mailto:care@shreemahaveercollections.com',
  responsePromise: 'Guaranteed response within 4 hours',

  // Showrooms & Locations
  flagshipShowroom: {
    name: 'Mumbai Heritage Atelier',
    street: '123 Heritage Lane, Kalbadevi',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400002',
    fullAddress: '123 Heritage Lane, Kalbadevi, Mumbai 400002',
    operatingHours: 'Monday – Saturday, 10:30 AM – 8:00 PM',
  },
  corporateOffice: {
    city: 'Noida',
    state: 'Uttar Pradesh',
    country: 'India',
    display: 'Noida, Uttar Pradesh, India',
  },
};

// ── Default Unified Brand Config Object ────────────────────────────────────────
const brandConfig = {
  name: BRAND_NAME,
  shortName: BRAND_SHORT_NAME,
  tagline: BRAND_TAGLINE,
  foundedYear: BRAND_FOUNDED_YEAR,
  website: BRAND_WEBSITE,
  social: BRAND_SOCIAL_LINKS,
  socialList: BRAND_SOCIAL_LIST,
  contact: BRAND_CONTACT,
};

export default brandConfig;
