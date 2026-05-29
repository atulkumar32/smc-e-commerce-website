export const BRAND_OPTIONS = ['SMC', 'KSC'];

export const MATERIAL_OPTIONS = [
  'Polyester',
  'Nylon',
  'Canvas',
  'Leather',
  'PU Leather',
  'Cotton Blend',
  'Recycled Fabric',
];

export const GENDER_OPTIONS = ['Boys', 'Girls', 'Unisex', 'Kids Unisex'];

// Pattern — "Character: Printed Design" replaces free-text
export const PATTERN_OPTIONS = [
  'Solid',
  'Striped',
  'Camouflage',
  'Geometric',
  'Floral',
  'Abstract',
  'Character: Printed Design',
];

// Character options
export const CHARACTER_OPTIONS = [
  'Spider-Man',
  'Batman',
  'Superman',
  'Avengers',
  'Doraemon',
  'Unicorn',
  'Princess',
  'Minions',
  'Frozen',
  'Cars',
  'Paw Patrol',
  'Dinosaur',
  'No Character',
];

// Class / Grade options
export const CLASS_OPTIONS = [
  'LKG to UKG',
  '1 - 2',
  '3 - 4',
  '5 - 6',
  '7 - 8',
  '9 - 10',
  '11 - 12',
];

export const BACKPACK_STYLE_OPTIONS = [
  'School Bag',
  'Backpack',
  'New School Bags',
  'Standard',
  'Ergonomic',
  'Rolling',
  'Sling',
  'Trolley',
  'Waterproof',
  'Anti-Theft',
];

export const BAG_CAPACITY_OPTIONS = [
  '15 L',
  '20 L',
  '25 L',
  '30 L',
  '35 L',
  '40 L',
  '45 L+',
];

// Net Quantity — combo options added
export const NET_QUANTITY_OPTIONS = [
  '1 Piece',
  '1 Unit',
  'Pack of 1',
  'Combo - 2',
  'Combo - 3',
  'Combo - 4',
  'Combo - 5',
];

// Recommended Age — range options up to 15 years
export const RECOMMENDED_AGE_OPTIONS = [
  '1 - 2 Years',
  '2 - 4 Years',
  '3 - 5 Years',
  '4 - 6 Years',
  '5 - 7 Years',
  '6 - 8 Years',
  '7 - 9 Years',
  '8 - 10 Years',
  '10 - 12 Years',
  '12 - 14 Years',
  'Upto 15 Years',
];

// Net Weight — ranges from 150 g up to 1000 g+
export const NET_WEIGHT_OPTIONS = [
  '150 - 250 g',
  '250 - 350 g',
  '350 - 450 g',
  '450 - 550 g',
  '550 - 650 g',
  '650 - 750 g',
  '750 - 850 g',
  '850 g - 1 kg',
  'Upto 1000 g',
];

export const COLOR_OPTIONS = [
  { label: 'Black', hex: '#000000' },
  { label: 'Navy Blue', hex: '#1a237e' },
  { label: 'Royal Blue', hex: '#1565c0' },
  { label: 'Red', hex: '#c62828' },
  { label: 'Pink', hex: '#ec407a' },
  { label: 'Purple', hex: '#7b1fa2' },
  { label: 'Green', hex: '#2e7d32' },
  { label: 'Yellow', hex: '#f9a825' },
  { label: 'Orange', hex: '#ef6c00' },
  { label: 'Grey', hex: '#757575' },
  { label: 'White', hex: '#ffffff' },
  { label: 'Brown', hex: '#5d4037' },
];

export const DEFAULT_COUNTRY_OF_ORIGIN = 'India';
export const DEFAULT_SIZE = 'Free Size';

export const PRODUCT_IMAGE_MIN = 1;
export const PRODUCT_IMAGE_MAX = 5;
export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png'];
export const ALLOWED_IMAGE_ACCEPT = '.jpg,.jpeg,.png,image/jpeg,image/png';

// Discount bounds
export const DISCOUNT_MIN = 10;
export const DISCOUNT_MAX = 60;
