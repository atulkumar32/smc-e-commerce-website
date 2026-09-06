# Shree Mahaveer Collections — E-Commerce Platform

A full-featured e-commerce web application for school bags, backpacks, purses and accessories, built with **React 19 + Vite 8**. The project is split into two main parts:

- **Web Storefront** — public-facing store for customers
- **Admin Panel** — protected dashboard for store management

Live: [https://shreemahaveercollections.com](https://shreemahaveercollections.com)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 19 + Vite 8 |
| Routing | React Router DOM v7 |
| UI Library | MUI (Material UI) v9 + Emotion |
| Styling | SCSS (Sass) + MUI custom theme |
| Notifications | React Toastify |
| SEO | React Helmet Async |
| Excel Export | xlsx |
| Auth | localStorage-based token management |
| API | PHP backend — raw `fetch()` calls |

---

## Getting Started

```bash
# Clone the repository
git clone <repo-url>
cd schoolbags-ecommerce

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The dev server runs at `http://localhost:5173`.
All API calls point to `https://shreemahaveercollections.com/apis/v1/` by default (can be changed in `src/Config/ApiConfig.js`).

---

## Project Structure

```
src/
├── Actions/           # API call functions (one file per domain)
│   ├── Web/           # Web storefront API actions
│   └── Users/         # User-specific API actions
├── components/        # Shared UI components
│   ├── Header/        # Double-row sticky header with scroll behaviour
│   ├── AdminLayout/   # Admin shell layout
│   ├── ProductCard/   # Product grid card
│   ├── SkeletonCard/  # Loading skeleton
│   ├── Seo/           # ProductDetailSeo, ProductListSeo
│   └── ...
├── Config/
│   ├── ApiConfig.js   # Base URL per environment
│   └── UrlsConfig.js  # All API endpoint constants
├── context/
│   ├── CartContext.jsx    # Cart + Wishlist (persisted to localStorage)
│   └── AdminContext.jsx   # Admin products + orders state
├── layouts/           # StoreLayout, AdminLayout, UserLayout
├── pages/
│   ├── admin/         # Admin dashboard pages
│   ├── auth/          # Login, Register
│   ├── home/          # Homepage + HeroSlider
│   ├── product/       # ProductList, ProductDetail
│   ├── cart/          # Cart page
│   ├── checkout/      # Checkout flow
│   ├── payment/       # Payment loading/success/failed
│   ├── user/          # User dashboard, orders, profile
│   └── wishlist/      # Wishlist page
├── routes/
│   ├── AppRoutes.jsx  # Root router
│   ├── AdminRoutes.jsx
│   └── UserRoutes.jsx
├── services/
│   └── apiClients.js  # Auth helpers (save/clear/check admin & user tokens)
├── Styles/            # Global SCSS variables, mixins, typography
└── utils/
    ├── slug.js        # SEO slug generation + title case
    ├── seo.js         # buildTitle, buildMetaDesc, JSON-LD helpers
    └── apiDebug.js    # Dev-only API logging utility
```

---

# Part 1 — Web Storefront

The public-facing store accessible to all visitors. Wrapped in `StoreLayout` (Header + Footer). Authentication is optional — guests can browse and checkout without registering.

## Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | UpcomingPage | Coming soon / launch splash page |
| `/home` | HomePage | Hero slider, featured products, category showcases |
| `/products` | ProductList | Product grid with category/sort/price filters |
| `/products/:slug` | ProductDetail | Product detail with variant selection, pincode check |
| `/products/school-bags` | ProductList | Pre-filtered school bags |
| `/products/purses` | ProductList | Pre-filtered purses |
| `/products/wallets` | ProductList | Pre-filtered wallets |
| `/products/new-arrivals` | ProductList | New arrival products |
| `/cart` | CartPage | Shopping cart with qty controls + totals |
| `/checkout` | CheckoutPage | Shipping → Payment → Review → Order |
| `/wishlist` | WishlistPage | Saved items, move to cart |
| `/payment/loading` | PaymentLoadingPage | Polls PhonePe payment status |
| `/payment/success` | PaymentSuccessPage | Order confirmed screen |
| `/payment/failed` | PaymentFailedPage | Payment failure screen |
| `/login` | LoginPage | Customer login |
| `/register` | RegisterPage | Customer registration |
| `/about` | AboutPage | Brand story |
| `/contact` | ContactPage | Contact form |

## Key Features

### Header
- **Double-row sticky header** — logo + main category pills + search + actions (row 1–2), sub-category icon tabs (row 3)
- **Scroll behaviour** — top rows collapse smoothly on scroll-down, reappear on scroll-up. Row 3 stays visible as a floating navigation bar
- **Live data** — main categories and sub-categories loaded from `getMainCategories.php` API
- Fully responsive — hamburger drawer on mobile

### Product Listing
- Variant expansion — each product variant (color) shows as a separate card
- Random shuffle on every page load for variety
- Skeleton loading placeholders
- SEO: dynamic `<title>`, meta description, canonical, OG tags, JSON-LD CollectionPage

### Product Detail (Flipkart-style)
- **2×2 image mosaic** on the left (click any image → full lightbox with keyboard nav + thumbnail strip)
- **55/45 layout** — mosaic left, info panel right
- Color swatch selector — switching variant updates gallery, price, stock, size instantly
- **Pincode delivery check** — enables Buy Now only when serviceable
- Full description section below the layout grid
- "You May Also Like" auto-playing 4-card slider (live API data)
- SEO: Product JSON-LD, OG product tags, dynamic canonical

### Cart & Checkout
- Cart persisted to `localStorage` (survives page refresh)
- Wishlist persisted to `localStorage`
- Cart: 8% tax, ₹299 shipping (free above ₹5,000)
- Checkout steps: Shipping → Payment → Review → Place Order
- Payment method: **Online (PhonePe)** — redirects to payment gateway
- COD option available (commented out, ready to enable)
- Pincode pre-filled from product detail page

### User Dashboard (`/user/*`)
- Protected — redirects to `/login` if not authenticated
- `/user/dashboard` — order summary counts + recent orders
- `/user/profile` — view/edit profile, change password
- `/user/orders` — paginated order history with status tracking

## Web API Endpoints

Base: `https://shreemahaveercollections.com/apis/v1/smc/`

| Action | Method | Endpoint |
|--------|--------|----------|
| Product list | GET | `api/v1/data/GetProductList.php` |
| Product detail | GET | `api/v1/data/GetProductDetails.php?product_id=` |
| Main categories + subs | GET | `api/v1/data/getMainCategories.php` |
| Pincode check | GET | `api/v1/data/checkPincode.php?pincode=` |
| Create online order | POST JSON | `api/v1/data/CreateOrderOnline.php` |
| Payment status | GET | `payments/paymentStatus.php?merchantOrderId=` |
| User login | POST | `user/api/login.php` |
| User register | POST | `user/api/register.php` |
| User orders | GET | `user/api/userOrderDetailsList.php` |
| User profile | GET | `user/api/GetUserProfileDetails.php` |
| Update profile | POST | `user/api/userProfileUpdate.php` |
| Dashboard counts | GET | `user/api/userDashboardTotalCount.php` |

---

# Part 2 — Admin Panel

Protected dashboard at `/admin/*`. Only accessible after admin login. Uses MUI v9 with a custom navy/gold theme, sidebar navigation, and data tables.

**Authentication:** Admin credentials stored in localStorage (`admin_logged_in`, `admin_token`). All admin pages redirect to `/admin/login` if not authenticated.

## Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/admin/login` | AdminLoginPage | Standalone login (no sidebar) |
| `/admin/dashboard` | DashboardPage | Stats overview: products, orders, revenue, users |
| `/admin/products` | ProductsPage | Full product management |
| `/admin/categories` | CategoriesPage | Category management |
| `/admin/orders` | OrdersPage | Order management and fulfilment |
| `/admin/users` | UsersPage | Registered user list |
| `/admin/shipments` | ShipmentPage | Shipment tracking |
| `/admin/pincodes` | PincodePage | Serviceable pincode management |

## Features

### Dashboard
- Total products, published products, total orders, total revenue
- Quick-access cards with trend indicators

### Products
- **Expandable table** — click a row to see all variants inline with thumbnail images
- Create master product: name, brand, category, GST, material, pattern, gender, character, class/grade, backpack style, capacity, net weight, recommended age, features (multi-select chips), short + full description, visibility toggles
- **Product variants** — separate form: color (with image upload per color), size, MRP, discount %, selling price, stock; bulk save all variants in one API call
- Images sent as `multipart/form-data` with `images[variantIdx][]` keys
- Edit / delete products and variants inline
- Console payload logging for debugging

### Categories
- **Main categories** — create with name, description, status, image (drag-and-drop upload)
- **Sub-categories** — dropdown selector for main category, name, description, image
- Category table shows: thumbnail, category ID (`SMC-CATE-XXXX`), name, main category, status chip, created date
- Edit and delete with confirmation dialog

### Orders
- **Summary stat cards** with active border highlight: Total, Accepted, To Pack, In Transit, Completed, Cancelled
- Clicking a card filters orders by that status
- **Context-aware action menu** per card:
  - Accepted card → View / Approve / Reject
  - To Pack card → Print Label → Ready to Dispatch (RTD enabled only after label printed)
- Search by order ID, customer, phone
- Date range filter
- Approve/Reject dialog with reason field
- PDF invoice generation (auto-download)
- RTD (Ready to Dispatch) action

### Users
- Paginated list with search
- View registered customer details

### Shipments
- Filter by status, date range, search
- Approve/reject shipments

### Pincodes
- Add single pincode with city, state, delivery charge, estimated delivery days
- **CSV bulk upload** (Excel/CSV file, auto-parsed with `xlsx`)
- List all pincodes with pagination and search
- Delete individual pincodes

## Admin API Endpoints

Base: `https://shreemahaveercollections.com/apis/v1/smc/admin/api/`

| Domain | Action | Method | Endpoint |
|--------|--------|--------|----------|
| Auth | Login | POST | `AdminLogin.php` |
| Dashboard | Stats | GET | `DashboardGetTotalCount.php` |
| Products | Fetch | GET | `GetProducts.php?page&limit` |
| Products | Create | POST multipart | `CreateProducts.php` |
| Products | Update | POST multipart | `UpdateProducts.php` |
| Products | Delete | POST JSON | `DeleteProducts.php` |
| Variants | Fetch | GET | `GetProductVariants.php?product_id=` |
| Variants | Bulk Create | POST multipart | `CreateProductVariant.php` |
| Variants | Update | POST multipart | `UpdateProductVariant.php` |
| Variants | Delete | POST JSON | `DeleteProductVariant.php` |
| Categories | Fetch | GET | `GetCategory.php` |
| Categories | Create sub | POST multipart | `CreateCategory.php` |
| Categories | Update | POST JSON | `UpdateCategory.php` |
| Categories | Delete | DELETE | `DeleteCategory.php?category_id=` |
| Main Categories | Fetch | GET | `getMainCategories.php` |
| Main Categories | Create | POST multipart | `createMainCategory.php` |
| Orders | Fetch | GET | `GetOrderDetails.php?page&limit&card&status&startdate&enddate&search` |
| Orders | Approve/Reject | POST | `OrderStatusActions.php` |
| Orders | Generate Invoice | POST | `GenerateAdminInvoice.php` |
| Orders | Ready to Dispatch | POST | `ReadyToDispatch.php` |
| Shipments | Fetch | GET | `GetShipmentDetails.php?page&limit&search&status` |
| Users | Fetch | GET | `GetResigerteduserList.php?page&perPage&search` |
| Pincodes | Fetch | GET | `GetPincodeList.php?page&limit&search` |
| Pincodes | Save single | POST JSON | `savePincodes.php` |
| Pincodes | Bulk upload | POST multipart | `BulkUploadPincodes.php` |

---

## Environment Configuration

Edit `src/Config/ApiConfig.js` to switch environments:

```js
// Development (default points to production API)
BASE_URL: "https://shreemahaveercollections.com/apis/v1/"

// Local PHP backend
BASE_URL: "http://localhost/"
```

---

## SEO

- `react-helmet-async` wraps the entire app via `HelmetProvider` in `App.jsx`
- **Product detail** — dynamic title (`meta_title` DB field → fallback), meta description, canonical URL, OG product tags (price, availability, brand), Twitter card, Product JSON-LD, Breadcrumb JSON-LD
- **Product listing** — dynamic title per category, OG website tags, CollectionPage JSON-LD
- Slug format: `product-name-smc-00004` — product ID embedded for server-side resolution

---

## Cart & State Management

| Store | Mechanism | Persistence |
|-------|-----------|-------------|
| Cart items | CartContext (React) | localStorage `smc_cart` |
| Wishlist | CartContext (React) | localStorage `smc_wishlist` |
| Admin products | AdminContext (React) | In-memory |
| Admin auth | localStorage | `admin_logged_in`, `admin_token` |
| User auth | localStorage | `user_logged_in`, `user_token`, `user_profile` |

---

## Scripts

```bash
npm run dev       # Start Vite dev server (port 5173)
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
npm run lint      # ESLint check
```

---

## Deployment

1. `npm run build` — generates optimised static files in `dist/`
2. Upload `dist/` contents to web hosting root
3. Ensure `public/_redirects` (or server config) handles SPA routing:
   ```
   /*  /index.html  200
   ```

---

## License

Private — Shree Mahaveer Collections. All rights reserved.
  