// ── Mock product catalogue ─────────────────────────────────────────────────────
// Replace with real API data when backend is ready.

export const PRODUCTS = [
  {
    id: 1,
    name: 'Classic Heritage Backpack',
    price: 2499,
    originalPrice: null,
    category: 'school-bags',
    badge: null,
    sizes: ['S', 'M'],
    outOfSizes: ['L'],
    colors: ['#001F3F', '#D4AF37', '#E1E3E4'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhsw-NW_vDn7XLnBViaTpXn18ds-ln53OliVsX9XtXONn8tgnmyiBsRNY-VfLhMz8k5DBaSnoerETMLYzHmZE-WxqQAflbgwwcLrmCnt6KLqT891_ZlRfPWECnpmu2FNeD2p7uaPbTD_7lxFP9trKHcPJvRdZvkHiD8inZXXXzertGo5v86vgng8X7VQQ_SRVRP85oQVswbb_-0qcAFF4bmhjgL7ScijD01xJJn4A-R7XB2eUDX2U3Ic1NZpQLvAmBY9zxEdnae_4',
  },
  {
    id: 2,
    name: 'Urban Explorer Pro',
    price: 1899,
    originalPrice: 2999,
    category: 'school-bags',
    badge: 'Sale',
    sizes: ['M'],
    outOfSizes: [],
    colors: ['#191C1D', '#574500'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAVmBEhutqwXhzDNEueNMuWa_uW0LGEthK8LRrM-S9EzfaeOTXY4q3OGWJJFX8BvIINca8xVQ6vscwY2N47BbQ1cJZVmf4FhSC5wl60coczjCJlUf_sZdfu17TEQsO3i0F0IMfawETFPAIB6x1QI0-isKp_FboDTFE8Z1mv0kiIZsgla4de20P6udHKqSrGCIQwVco-0fqRlJHslE8DOS9o-IaGHxW2wp337NanbwSpFxhJdwHkFqj-IYAM7UPhmhmwb2gZaZzRlo8',
  },
  {
    id: 3,
    name: 'Artisan Canvas Series',
    price: 3200,
    originalPrice: null,
    category: 'school-bags',
    badge: null,
    sizes: ['S', 'M'],
    outOfSizes: [],
    colors: ['#ba1a1a', '#001F3F'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlSwRTi2XgvpTDyc5P9lCYk3BGme1HPnab_G2k_DaSZf2oWMW9Gs68IuXXBLt7H_giPaB7mUFmCKuIVxGJjzFH2kWh80XYjH2ioMqyk8S7MeP4ATjz_lwGCgE-o3mRWbPgxpksaXZzHzsmEAieITPprgHRXp588VTO1q760OBRGkROLzT0H0hhRE_4UD6JQWKebKEyTOrOGfHjr53Wi78SRPMsUhTi6WmAkiU_z8pLUpw23PAIOUJKxDL2AjihWeqTsleJRuitZ84',
  },
  {
    id: 4,
    name: 'Minimalist Tech Pack',
    price: 2750,
    originalPrice: null,
    category: 'school-bags',
    badge: null,
    sizes: ['M', 'L'],
    outOfSizes: [],
    colors: ['#c4c6cf', '#43474e'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDU0vtUgvztEcA1b00CNwx7UM50Lb3l62-UpSZM1bS1_eXMl5xq5aLKBFr0Sr9bP706jEi6Wf0Bl0tYa7FCaKj7PxsAgFF5TROo3xGejF1HKzhTLC-lHDjyRS0H5gRRTuM8dJ64Ly4gnik9CXprwf5IGEJ1uv-POpWZppG1Lp-YxA2jGVYVoX6-lD8l4YhIy5aZvY312WKp0IuZoOx5I4Zneb8V8kVMU_rksYXPR52X5BHIgWdxOo-4C3nOP3eV_NddayLw6LaaxKA',
  },
  {
    id: 5,
    name: 'Imperial Leather Satchel',
    price: 4999,
    originalPrice: null,
    category: 'school-bags',
    badge: null,
    sizes: ['S', 'M', 'L'],
    outOfSizes: [],
    colors: ['#735C00'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAuuBmrOTSdDKz06-VYFCaMI8v5KVL3cEjHPR9OYq0AIAXaXCWjFkiR4HTSSabhugCsEH2pIpOcogIfKhhbcGbXenHxLPxJF8_3Y-fVxKb-wpzhzPKKQa2BAAco8pSpfbHD2xpB9e6G_iDJyGHOrNnSdSvtV7_XLZwVc-5Dkr5hht0x_v_fj0LvATe4jVr3ldpTS10JjMDuRjPS1cyHTdmy24nT2vEz0KSQdNAkObexaS2BtfxwAKi_ipOHP9rIB7kGAu37dPNpQwY',
  },
  {
    id: 6,
    name: 'Tactical Scholastic Gear',
    price: 2100,
    originalPrice: null,
    category: 'school-bags',
    badge: null,
    sizes: ['M'],
    outOfSizes: [],
    colors: ['#464747', '#001C3A'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYwdHp55Fzdde5uwqK1YOUTYqDz9ktsbaFU0IwZYuM-SzLYpCo0b5XnlezZf7_jsctkoykKbxDpp_Bpwhd2jHCS0FXgKpaj6aWpGHmaF18wbrdowNIf9mTd7dHdFdm3trJKCsNIFOkPRgNDmZ4jQXz0cA9mhvY0AOK4DNpYSzY6a3fANiT_1IgUQWnivdZgbfgk6--VdpqhEvHa3l_4xChOpIl4h9CAXBPJjsjFi3gY4pFnW2rYiVtwtVVx_sDK7Afp7DruQoAocU',
  },
  {
    id: 7,
    name: 'Aurelia Gold Clutch',
    price: 18900,
    originalPrice: null,
    category: 'purses',
    badge: 'New',
    sizes: [],
    outOfSizes: [],
    colors: ['#D4AF37'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDoUBpFLiRxEFthxY9R4cMH5QLz_P-XiCPO9dqS2cPSNfYNepT2hrAed3K4QX_m4dVlnC0569p_OZ8Pssb3swnTen13bnfe5p0x99mvWzViCh_9TzPLVRBAmqLnXGBWJ955JvWx6jPGFnHhoV2XR6bstwAn1taeDPlt4P7uCXv-JQnjnbbGmSRHtwvM4lxSx_5x-fcBKpsj8s3brcv4kV60uHCPvgTTd_HewU8jJZDbauQhVUSnmykjljRnD9GqbFWCaeF-W5y2qJ8',
  },
  {
    id: 8,
    name: 'Midnight Serenade Tote',
    price: 24300,
    originalPrice: null,
    category: 'purses',
    badge: 'Limited',
    sizes: [],
    outOfSizes: [],
    colors: ['#001F3F'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBp37IAQa0iox5Ok4xe91T6k7RgvCcjRW0a5wHd9WLzxHFUeueMzIyZAdGPH-e4BuZ7RS-JOHccd4JNFk2CVynhmaCWaZC45dMAlcy2JFSorqWNdX0q2Wj4R2qNetAnTc-HLm5sxmLpqc4j6vvvqfPL08FWw7gYH2vlZWZAj29UDghV_TeHc34IRhAlSeIfQ5D8X8YNDfy_Et9L8NYp_8_DO0GTmmnhZTddvY53u0Y_C0UPd5uQondGqtQnlWpc9wFqorOzpfn8gfA',
  },
  {
    id: 9,
    name: 'Oxford Elite Backpack',
    price: 14400,
    originalPrice: null,
    category: 'school-bags',
    badge: null,
    sizes: ['M', 'L'],
    outOfSizes: [],
    colors: ['#001F3F', '#574500'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1E1iV2oSHHbpilXv7UZM3Yfst2_ydDkbuymMYq7F0f4unwMiiIDjogBjboZLd0tgth4memotV23KJeQwMkO4ZxwuP6mRN-hXMwCGoD3YYhEw58mFAzXDKYLNnRztCZZNOohjtz2l8fvOfs6eqfOzPhDhD34A4Jd_U5GrLq5KEkxvC4dIkSwHQyV7yh79gjFuHZd55TOMUS89JDTQzSErS-BRNIdLN5TDER3QglwGm_LAhjOHn0TTRi9mWK8LsschZ2XHIztoK9rU',
  },
  {
    id: 10,
    name: 'Titanium Tech Pack',
    price: 11800,
    originalPrice: 15000,
    category: 'wallets',
    badge: 'Sale',
    sizes: [],
    outOfSizes: [],
    colors: ['#464747'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAF4GHECIiOuSOZR0MmdLVobzL_HFyHnDP3kMUjMVt_Q8V-Mk2BMJ-EUDhc3YxRkRlqjF3lKNEwzOb8WncXnRwGzAEDyK6UvEtuxzhccIRC2X4yrLvXcdQGYfJvdxQJ1_Fij3srBLdoOJ9ic76wijpSjGlrBuhU1w3G24ChgqUTneSxnuVcCgy78hIqOvaRR-mkiXBWYddACld8Wl7hfbDoHIIpdBZbq0TnDxLVJdnm0egPwhY64BX2aDe5KDuY8-ZT0wcqmn7klI',
  },
];

export const CATEGORIES = [
  { key: 'all', label: 'All Products', icon: 'shopping_bag' },
  { key: 'school-bags', label: 'Bags', icon: 'shopping_bag' },
  { key: 'purses', label: 'Accessories', icon: 'auto_awesome' },
  { key: 'new-arrivals', label: 'New Arrivals', icon: 'fiber_new' },
  { key: 'wallets', label: 'Best Sellers', icon: 'star' },
];

export const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

// ── Product detail extra data (gallery, specs, reviews) ───────────────────────
// Keyed by product id. Merged with PRODUCTS on the detail page.
export const PRODUCT_DETAILS = {
  1: {
    rating: 4.5,
    reviewCount: 124,
    description:
      'Crafted from ethically sourced full-grain Italian leather, the Heritage Commuter seamlessly blends artisanal tradition with contemporary utility. A masterpiece of minimalist architecture for the modern nomad.',
    colorNames: { '#001F3F': 'Midnight Navy', '#D4AF37': 'Heritage Gold', '#E1E3E4': 'Pearl Grey' },
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCH3pCdXQzeGY7RDXZQ_bYCpEKdpnLlhGRH151yRhX-ovGenTQbt4noZXdxG3eysZzvBnBLJ_2vxP5rEp4ncWGpCXOLfZKMIAD6n3blkmuSUCMQVojizu2zjp4ra2TMdY6v2OogGIx56LU1UGtGs7cN-PVkUHclWWHPStAhXOrs4vtVWdFs5J8bviKlvsWqwdFYNQk0fnl-waAkxcNaGGPWBzF4rszFZwqSxLRjkTeGOABKNHGc6R8iLoYTm07fNU8iOAUBuMKBaDo',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAyBvlsdk9x7zr6ldG75mtGm1W2geH7et3gy_0ayucXX34sTB9LUDEBA-8T5guUnxYGo7IoKn2qru1GE9goz_Ks3Z7-mrCHl9s3SCRpuKY5Rys7ypv2cOS1GnD-iYw6WU09ir899r0FFX18iQJI1H8u17oimLyJLeoNc-VmLDQURzEw9Fv2zV9Z3xxBCLVL4oQWDmjHLr-Bq11QSEb0--bH_sRcysXLMQZ3MfEc5RATopKRyQA3NvDDtT_bG10ncwidtM2ovr8BNdg',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDi87VXH9zkfzWm9wbn-G-mkPDb_7RBvfygklxEIkoCOrmC6HB4xXM3KUczQoIQcPnJr8Wo1FsAG6hiVfM7IaUbqGnxxaiK4FYUh91ipaGpPqpvnMEUQ9atzrlZaByfFv3QiIf55UjJJbSc0GKrCmm5OPvi-FlL0fEheM89XcYoiFbG4SfcZL_V64EGt070VCk3Jp9sUPt4s3kgrMGVb21X3Smb2d4beKV_yVs04drR868gmx6uCges_PKmPkQLUeF3jRDOx2Bg48w',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBX5Sc5GGmECEBcaUVEUApjPKZurlRfy8xmpjoZCXqnJOVv4rRw2DJ0Bt-OgQRnuWYhe5twIng46QlQTYfujwS-8hiVAQALvkyBwNdWLX6XAiTJE6D7ZdkBY19gWPNx4Jp4ryGuOjuOtod1gu6BZ86rw3AlDnx9RN0QPx6dqv2MFWB_1_QvYXa5fFoO9ywmlKvJ-WaseOjtEEWzuDToSfSNelNNTEDOXt7QLe1h5wEWirHvnnKM_MPS5pcYpawv_o8kMkkh1eUE72s',
    ],
    accordion: [
      {
        id: 'materials',
        title: 'Materials & Details',
        content: 'Full-grain pebbled leather from Gold-rated tanneries. Hand-painted edges, solid brass hardware with 14k gold plating, and water-resistant silk lining.',
      },
      {
        id: 'dimensions',
        title: 'Dimensions',
        list: ['Height: 18.5 inches (47 cm)', 'Width: 12 inches (30 cm)', 'Depth: 6.5 inches (16 cm)', 'Capacity: 22 Liters'],
      },
      {
        id: 'care',
        title: 'Care Instructions',
        content: 'Wipe clean with a soft, damp cloth. Use professional leather conditioner every 6 months. Avoid prolonged exposure to direct heat or moisture.',
      },
    ],
  },
};

// Helper: get full product detail by id
export function getProductDetail(id) {
  const base = PRODUCTS.find((p) => p.id === Number(id));
  if (!base) return null;
  const extra = PRODUCT_DETAILS[base.id] || {};
  // fallback gallery = [base.image]
  return {
    ...base,
    rating: extra.rating ?? 4,
    reviewCount: extra.reviewCount ?? 0,
    description: extra.description ?? '',
    colorNames: extra.colorNames ?? {},
    gallery: extra.gallery ?? [base.image],
    accordion: extra.accordion ?? [],
  };
}

// Recently viewed mock (other products)
export const RECENTLY_VIEWED = [
  {
    id: 'rv1',
    category: 'Travel',
    name: 'Aviator Duffel',
    price: 90000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCL9ivnT7l9R9gOylbVmJ2rnQXE2WbUYy48CiYqUXPHJglplLXcw6Y7FI2yU8_DjWZCUrW0ChsAOlyYTkt28Hp_c8dcX5QrXmXGxVfpUcQUSfJO_liXqmzxcufbhlAz67B-Qu8tfVN6MoMOZweLKmndHObXA0x4HC8RWBrzlWEXIKvmck7eWlzdc7zoCekdRYIHxxEuaszLFZTPOXUlEE0K3LAzrkjj2CgY0FysNvG56Ym6ZfJCZ7JheF8fb8CR8dgG78XL7L9a2uU',
  },
  {
    id: 'rv2',
    category: 'Accessories',
    name: 'Slim Bifold Wallet',
    price: 11400,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-icrsj11zY4N0jqUNPDxt873KToGx2ljt3DE_-e02R_VI_BDD9u6doQ3JxlNEpg_35JKbUvNoE8CgB24i7oczXSOoB3jiBCpq9guWkbR7cWZSy_HnKcjDK-mKj2eGxvFFxAEiOnF9cOOqM5Yy8ysK8xN42tLp6DwF1_eXscriR-Ie_sK8lqaGqquXjQ-Qg4HKtkukHk0vi6kjzosUf_YjAzlBLe9o1n_v-FcQHD6kgc5v0qmX0elaVZmssUlDaTMv_BFzC4ojSTw',
  },
  {
    id: 'rv3',
    category: 'Work',
    name: 'Executive Portfolio',
    price: 34200,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFpCnl84hHsOyD48ZqXO4e9MBuQ0HHFE_uBUJQ2drv8UUdhY8QuhhUlijt8J8XVjHcuR0oPKeAjsafDy9P6W8EecpokM3Ub8ePDtMBr5XE7KXb-9MilUtIE8KJpm9CFyxpBmbxIMOBNBTzUpcjHVBASbblB5YRbfghs_jt0UjeJVZRDy2J5FG_1lNvNRyvrAe-BUsl6DwoYsN0Dqk4FI3XLr1BKnIvAKfUJz4_mjP14vzAlwpkwvHM_Wz-lUY5fgneTezCXEXezN8',
  },
  {
    id: 'rv4',
    category: 'Evening',
    name: 'Gala Clutch',
    price: 22400,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbddCno4TtrMC9ec0M1ii5JdBmbBxbJ4fTndFAn0n4ywfY6LIJ2buwUnmUwspBQAqj-TqHkbUdTf1-PB8G5D_ZeY0DvFChhUWsq_WBK0LGeYn8ctBdCQc_ViyD2prLzgeT7J3X09pujx9oe9ll2sPhVko_zBpwfI-5cU7kVklIxtlXTZskZ4WXqOPtusuhgEUkB7JhRprvqJW1AofjGprbw_XImD_9rglrpiTkNIOiV86MPHEdqo0Z0ss1MlnOZzSRS-vLSP-u2tw',
  },
];
