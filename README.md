# Shree Mahaveer Collections (SMC) — E-Commerce Platform

A production-grade, full-featured e-commerce platform specializing in school bags, backpacks, purses, and accessories. Built with **React 19 + Vite 8**, featuring the **VORANO Luxury Redesign** design system, full customer storefront, dedicated user dashboard, and an enterprise admin management panel.

- **Live Storefront:** [https://shreemahaveercollections.com](https://shreemahaveercollections.com)
- **API Base:** `https://shreemahaveercollections.com/apis/v1/`
- **Current Active Branch:** `new-design`

---

## Table of Contents

1. [Tech Stack & Architecture](#tech-stack--architecture)
2. [Getting Started](#getting-started)
3. [Project Structure](#project-structure)
4. [Design System & Styling (VORANO)](#design-system--styling-vorano)
5. [Public Web Storefront](#public-web-storefront)
6. [Customer User Portal](#customer-user-portal)
7. [Admin Management Panel](#admin-management-panel)
8. [Database Schema (`sql.sql`)](#database-schema-sqlsql)
9. [Complete API Endpoints Directory](#complete-api-endpoints-directory)
10. [State Management & Local Storage](#state-management--local-storage)
11. [SEO & Open Graph](#seo--open-graph)
12. [Environment Configuration](#environment-configuration)
13. [Build & Deployment](#build--deployment)

---

## Tech Stack & Architecture

| Layer | Technology | Details |
|---|---|---|
| **Core Framework** | React 19.2.6 + Vite 8.0.12 | Modern ESM build system with Fast Refresh |
| **Routing** | React Router DOM v7.15.1 | Nested layouts (`StoreLayout`, `AdminLayout`, `UserLayout`) with auth guards |
| **Component System** | MUI (Material UI) v9.0.1 + Emotion | Admin dashboard, dialogs, tables, drawers, Popper menus |
| **Styling** | Sass / SCSS (v1.100) + VORANO Tokens | 1440px container standard, 900px tablet breakpoint, custom mixins |
| **Typography** | Google Fonts | DM Sans (body & UI) + Playfair Display (editorial headings) |
| **Notifications** | React Toastify v11.1.0 | Top-right feedback toasts for admin and customer interactions |
| **SEO & Meta** | React Helmet Async v3.0.0 | Dynamic title, meta description, Open Graph, and JSON-LD schema |
| **Spreadsheet / Bulk Import** | xlsx v0.18.5 | Excel (`.xlsx`, `.xls`) & CSV parsing and template generation |
| **External APIs** | India Post API | Automated state and city lookup by 6-digit postal pincode |
| **Payment Gateway** | PhonePe Online Payment | Hosted checkout redirect with status polling |
| **Backend Integration** | PHP RESTful Services | Raw `fetch()` client with FormData/multipart and JSON payloads |

---

## Getting Started

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x

### Installation & Run

```bash
# Clone the repository
git clone <repo-url>
cd schoolbags-ecommerce

# Install dependencies
npm install

# Start Vite development server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run code linter
npm run lint
```

---

## Project Structure

```
schoolbags-ecommerce/
├── public/                     # Static assets & SPA redirect rules
├── src/
│   ├── Actions/                # API dispatchers and domain actions
│   │   ├── Users/              # User dashboard, orders, profile actions
│   │   ├── Web/                # Public product list, detail, online order actions
│   │   ├── AuthAction.js       # Customer and admin authentication
│   │   ├── BulkUploadColorsActions.js # Color management API calls
│   │   ├── CategoryAction.js   # Category & sub-category CRUD
│   │   ├── CheckPinCodeAction.js # Public pincode serviceability check
│   │   ├── DashboardAction.js  # Admin KPI statistics
│   │   ├── GetAdminOrderDetailsActions.js # Order processing actions
│   │   ├── GetProductIdToReviewsActions.js # Reviews & ratings actions
│   │   ├── GetProductsActions.js # Master products fetching
│   │   ├── OrderStatusAction.js # Order approval/rejection/dispatch
│   │   ├── ProductUploadAction.js # Master product create/update
│   │   ├── ProductVariantAction.js # Variant creation & updates
│   │   ├── ShipmentActions.js  # Shipment tracking actions
│   │   └── UploadloadPinCodesActions.js # Pincodes CRUD & bulk upload
│   ├── assets/                 # SVGs, icons, and branding (logo.svg)
│   ├── components/             # Reusable UI components
│   │   ├── AdminHeader/        # Admin topbar with mobile drawer toggle
│   │   ├── AdminLayout/        # Admin shell layout wrapper
│   │   ├── Card/               # Presentation card containers
│   │   ├── CardSlider/         # Multi-card carousel slider
│   │   ├── CartDrawer/         # Slide-out mini-cart drawer
│   │   ├── CustomDropdown/     # Vorano luxury custom dropdown component
│   │   ├── CustomSelect/       # Styled select menu component
│   │   ├── Footer/             # Multi-column branded store footer
│   │   ├── Header/             # Multi-row sticky header with category tabs
│   │   ├── OrderActionDialog/  # Approve/Reject reason dialog for admin
│   │   ├── ProductCard/        # Product grid card with color swatch & badges
│   │   ├── RecentlyViewedSlider/ # Recently viewed / related products slider
│   │   ├── RevealOnScroll/     # IntersectionObserver animation trigger
│   │   ├── Seo/                # ProductDetailSeo & ProductListSeo (JSON-LD)
│   │   ├── Sidebar/            # Admin dark sidebar with hover flyout submenus
│   │   ├── SkeletonCard/       # Loading placeholder for product grids
│   │   ├── SkeletonProductDetail/ # Loading placeholder for product detail
│   │   ├── StatsCard/          # Dashboard KPI metric card with trends
│   │   ├── TableComponent/     # Reusable MUI table with pagination & search
│   │   ├── UserSidebar/        # Customer portal navigation drawer
│   │   └── UserTopbar/         # Customer portal header bar
│   ├── Config/
│   │   ├── ApiConfig.js        # Environment resolver (Production / UAT / Dev)
│   │   └── UrlsConfig.js       # Complete API endpoints catalog & media URLs
│   ├── context/
│   │   ├── AdminContext.jsx    # Admin products and orders state cache
│   │   ├── CartContext.jsx     # Persistent cart & wishlist (localStorage)
│   │   └── CartDrawerContext.jsx # Global drawer visibility controller
│   ├── layouts/
│   │   ├── AdminLayout.jsx     # Admin page wrapper
│   │   ├── StoreLayout.jsx     # Public customer store wrapper (Header + Footer)
│   │   └── UserLayout.jsx      # Customer account portal wrapper
│   ├── pages/
│   │   ├── about/              # Brand story and heritage
│   │   ├── admin/              # Admin dashboard pages
│   │   │   ├── AddNewPinCode/  # Pincode manager + India Post auto-fill
│   │   │   ├── AddReviewRatings/ # Review moderation & admin review creation
│   │   │   ├── BulkColorsUpload/ # Excel/CSV color code bulk upload
│   │   │   ├── Categories/     # Main & sub-category management
│   │   │   ├── Coupons/        # Coupon creation, rules & usage tracking
│   │   │   ├── Dashboard/      # Analytics overview & business statistics
│   │   │   ├── Login/          # Admin authentication page
│   │   │   ├── Orders/         # Order processing & packing lifecycle
│   │   │   ├── Products/       # Master products & variants management
│   │   │   │   └── Components/ # AddNewProduct, AddNewVarient, AddVarients
│   │   │   ├── SendEmails/     # Rich text email marketing campaigns
│   │   │   ├── Shipment/       # Logistics tracking and approval
│   │   │   └── Users/          # Registered customers table
│   │   ├── auth/               # Customer login & register
│   │   ├── cart/               # Cart page with quantity adjustments
│   │   ├── checkout/           # 3-step checkout (Address -> Payment -> Review)
│   │   ├── contact/            # Customer inquiry & support form
│   │   ├── home/               # VORANO homepage redesign (VHero, VCategories, etc.)
│   │   ├── payment/            # PaymentLoading, PaymentSuccess, PaymentFailed
│   │   ├── product/            # ProductList and ProductDetail with zoom lens
│   │   ├── upComingPage/       # Splash coming-soon landing page
│   │   ├── user/               # Customer account portal
│   │   │   ├── Dashboard/      # User order metrics & quick actions
│   │   │   ├── Orders/         # Full order history with delivery stepper
│   │   │   └── Profile/        # Personal details & password change
│   │   └── wishlist/           # Saved favorites list
│   ├── routes/
│   │   ├── AdminRoutes.jsx     # Admin shell with AdminProvider & ThemeProvider
│   │   ├── AppRoutes.jsx       # Root router defining all routes & redirects
│   │   └── UserRoutes.jsx      # Protected customer portal sub-routes
│   ├── services/
│   │   ├── api.js              # Generic API request wrapper
│   │   ├── apiClients.js       # Auth helpers (admin/user token management)
│   │   └── productApi.js       # Offline-tolerant product caching layer
│   ├── Styles/                 # Global styling, Sass mixins, and design tokens
│   │   ├── ColorCodes.scss     # Hex color mapping & palette definitions
│   │   ├── Mixins.scss         # Responsive breakpoints, containers & flexbox
│   │   ├── _breakpoints.scss   # Breakpoint constants
│   │   ├── _typography.scss    # Font definitions (DM Sans, Playfair Display)
│   │   └── global.scss         # Global CSS resets and base styles
│   ├── theme/
│   │   └── adminTheme.js       # Custom MUI theme (Navy & Accent Blue)
│   └── utils/
│       ├── adminValidation.js  # Validation helpers for admin forms
│       ├── apiDebug.js         # Console logging formatter for API calls
│       ├── seo.js              # Title, description, and JSON-LD builders
│       ├── slug.js             # SEO slug generator & title casing
│       ├── toastNotify.js      # Unified Toastify notification wrapper
│       └── validators.js       # Customer forms & checkout validators
├── index.html
├── package.json
├── vite.config.ts
└── sql.sql                     # Production MySQL schema definitions
```

---

## Design System & Styling (VORANO)

The application features the **VORANO 2026 Redesign System**, bringing high-end luxury e-commerce aesthetics to the platform:

- **Typography:**
  - Headings: `Playfair Display`, serif — editorial luxury feeling.
  - Body & UI: `DM Sans`, sans-serif — modern legibility.
- **Layout Standards:**
  - Standard desktop container width: `1440px`.
  - Container horizontal padding: `1.75rem` (`28px`), matching navigation headers.
  - Standardized tablet breakpoint: `@media (max-width: 900px)` with `1rem` (`16px`) padding.
- **Custom UI Components:**
  - `CustomDropdown`: Accessible dropdown selection with animation and smooth state transitions.
  - `CustomSelect`: Form select styling with gold/navy active states.
  - `CartDrawer`: Slide-out mini-cart drawer triggering immediately upon item addition.

---

## Public Web Storefront

### Pages & Routing

| Route | Page | Description |
|---|---|---|
| `/` | `UpcomingPage` | Launch splash / coming-soon landing page |
| `/home`, `/uat/` | `HomePage` | VORANO luxury homepage with dynamic sections |
| `/products` | `ProductList` | Search, sorting, price range, and category filtering |
| `/products/:slug` | `ProductDetail` | Detail view with 2x2 mosaic, zoom lens, and review modal |
| `/products/school-bags` | `ProductList` | Filtered view for school bags |
| `/products/purses` | `ProductList` | Filtered view for women's purses |
| `/products/wallets` | `ProductList` | Filtered view for wallets |
| `/products/new-arrivals` | `ProductList` | Filtered view for newest additions |
| `/cart` | `CartPage` | Full cart view with steppers and free-shipping meter |
| `/checkout` | `CheckoutPage` | 3-step checkout with address validation & PhonePe redirect |
| `/wishlist` | `WishlistPage` | Saved favorites with one-click move to cart |
| `/payment/loading` | `PaymentLoadingPage` | Polls PhonePe merchant order status |
| `/payment/success` | `PaymentSuccessPage` | Order confirmed screen with summary |
| `/payment/failed` | `PaymentFailedPage` | Payment failure warning with retry prompt |
| `/login` | `LoginPage` | Customer login with email/password validation |
| `/register` | `RegisterPage` | Customer registration |
| `/about`, `/craftsmanship`, `/sustainability`, `/care-guide` | `AboutPage` | Brand heritage, craft, and policies |
| `/contact`, `/shipping-returns`, `/store-locator` | `ContactPage` | Inquiries, shipping info, and contact form |

### Key Storefront Features

1. **VORANO Homepage Sections:**
   - `VHero`: High-impact banner with CTA directing to curated collections.
   - `VCategories`: Visual circular and card category navigators.
   - `VBestsellers`: Live-fetched grid of top-performing items with instant add-to-cart.
   - `VPromoBanners`: Promotional campaign cards with coupon highlights.
   - `VBenefits`: Trust badges (free delivery, authentic quality, secure payment).
2. **Interactive Product Detail Page:**
   - **2×2 Image Mosaic:** Dynamic mosaic layout for product variants.
   - **Magnifying Lens Zoom:** Flipkart/Amazon-style interactive lens zoom portal tracking cursor movements.
   - **Full Lightbox:** High-resolution full-screen viewer with thumbnail navigation and keyboard arrow keys.
   - **Variant & Color Swatch Switcher:** Live color switches dynamically swapping image galleries, prices, discounts, and inventory counts.
   - **Pincode Delivery Check:** Live serviceability validation via `checkPincode.php` with estimated delivery timelines.
   - **Customer Reviews Modal:** Two-mode dialog allowing visitors to read approved reviews and submit new ratings (1-5 stars) with comments.
3. **Cart & Slide-out Mini-Cart Drawer:**
   - Persistent storage across reloads via `smc_cart` in `localStorage`.
   - Real-time tax (8%) and shipping charges calculation (Free shipping above ₹5,000).
   - Instant cart drawer slide-out on adding any product, avoiding disruptive page navigations.
4. **Checkout & PhonePe Gateway Integration:**
   - 3-step flow: Address Entry -> Payment Mode Selection -> Review & Confirmation.
   - Pre-fills delivery pincode from product detail interactions.
   - Redirects to PhonePe gateway for online transactions, supported by payment status polling.

---

## Customer User Portal

Accessible under `/user/*` and protected by authentication guards (`isUserAuthenticated()`):

| Route | Page | Description |
|---|---|---|
| `/user/dashboard` | `UserDashboardPage` | Metrics overview (Total Orders, Total Spent, In Transit, Delivered) & recent orders |
| `/user/orders` | `UserOrders` | Paginated orders list with interactive 4-step delivery progress stepper |
| `/user/profile` | `UserProfile` | Personal details editor and password change form |

### Key Portal Features
- **UserLayout:** Custom customer portal shell featuring `UserSidebar` and `UserTopbar`.
- **Delivery Progress Stepper:** Visual tracking from *Confirmed* -> *Processing* -> *In Transit* -> *Delivered* (or *Cancelled*).
- **Invoice Re-print:** Ability to download or view order receipts.
- **Shortcuts:** `/dashboard`, `/orders`, and `/profile` automatically redirect to their respective `/user/*` sub-routes.

---

## Admin Management Panel

A protected dashboard accessible at `/admin/*`, styled with an enterprise navy/gold MUI theme (`adminTheme.js`):

### Admin Pages & Navigation

| Route | Page | Description |
|---|---|---|
| `/admin/login` | `AdminLoginPage` | Standalone branded admin login screen |
| `/admin/dashboard` | `DashboardPage` | Overview of gross sales, orders count, products, and registered users |
| `/admin/products` | `ProductsPage` | Master product catalog with expandable variant rows and status filters |
| `/admin/add-variant` | `AddVarientsPage` | Dedicated variant management page with product selector & bulk variant creator |
| `/admin/categories` | `CategoriesPage` | Main categories and sub-categories management with media uploads |
| `/admin/orders` | `OrdersPage` | Full lifecycle order processing, status filter cards, and invoice generation |
| `/admin/users` | `UsersPage` | Registered customer directory with debounced search and pagination |
| `/admin/shipments` | `ShipmentPage` | Courier shipment tracking, status approvals, and search |
| `/admin/pincodes`, `/admin/add-pin-code` | `PincodePage` | Serviceable pincodes manager with India Post auto-fill & Excel upload |
| `/admin/bulk-upload-colors` | `BulkColorsUploadPage` | Bulk import of color palettes via Excel/CSV with downloadable templates |
| `/admin/reviews` | `AddReviewRatingsPage` | Product review moderation (approve, edit, delete, or create admin reviews) |
| `/admin/coupons` | `CouponsPage` | Promotional discount code manager with usage rules and user targeting |
| `/admin/send-emails` | `SendEmailsPage` | Marketing email campaign composer with Rich Text Editor and audience targeting |

### Detailed Admin Module Breakdown

#### 1. Products & Variants Management
- **Master Product Creation:** Name, brand, category, GST %, material, pattern, gender, capacity (L), net weight, recommended age, features (multi-select chips), descriptions, and homepage hero banner toggles.
- **Variant Submenu Navigation:** Hover flyout submenu on the sidebar with quick links to *Master Products* and *Add Variant*.
- **Bulk Variant Creation:** Variant editor per product with dynamic color picker, size selection, MRP, discount percentage, auto-calculated selling price, stock, and multi-image uploads.
- **Live Variant Colors:** Colors fetched dynamically from the database (`GetColorToProductsVarients.php`).

#### 2. Categories & Sub-Categories
- Create main parent categories with custom image uploads (`createMainCategory.php`).
- Create nested sub-categories linked to parent categories (`CreateCategory.php`).
- Data table with thumbnails, category IDs (`SMC-CATE-XXXX`), and status chips.

#### 3. Order Processing & Dispatch
- **Status Filter Cards:** High-level metrics for *Total*, *Accepted*, *To Pack*, *In Transit*, *Completed*, and *Cancelled*.
- **Action Lifecycle:**
  - *Accepted* -> Approve or Reject with reason note.
  - *To Pack* -> Generate official PDF invoice (`GenerateAdminInvoice.php`) -> Enable Ready to Dispatch (RTD).
  - *Ready to Dispatch* -> Mark ready for courier pickup.

#### 4. Pincode Management & India Post Auto-Lookup
- Single pincode addition with automated State and City resolution using the **India Post API** (`api.postalpincode.in`).
- **Bulk Upload:** Upload entire spreadsheets (`.xlsx`, `.xls`, `.csv`) processed client-side via `xlsx` and submitted to `BulkUploadPincodes.php`.

#### 5. Color Code Bulk Import
- Downloadable Excel template pre-formatted with `color_name`, `hex_code`, and `description`.
- Bulk upload with client-side parsing into CSV blobs and server-side ingestion (`BulkUploadColors.php`).
- Visual color code preview table with circular swatch rendering.

#### 6. Reviews & Ratings Moderation
- Table view of all customer submissions (`GetAllReviews.php`).
- Toggle status between Active (1) and Hidden (0).
- Admin ability to author official reviews with `review_from = 1`.

#### 7. Coupons & Promotions
- Create discount codes with percentage discounts (1%–100%).
- Rules: minimum order amount, maximum redemption count, and expiration date.
- Target restrictions: Restrict coupon to specific product IDs or specific user IDs/emails.
- Real-time coupon redemption logs (`coupon_history`).

#### 8. Email Marketing Campaigns (`SendEmails`)
- **Rich Text Editor (RTE):** Built-in WYSIWYG editor supporting font sizes, bold, italic, underline, strikethrough, alignments, and lists without external dependencies.
- **Banner Upload:** Direct banner image attachment (up to 2MB).
- **Target Audience Filtering:**
  - `all_users`: All registered members.
  - `all_customers`: Users with at least one order.
  - `inactive_users`: Dormant users (30+ days inactive).
  - `custom`: Direct comma-separated list of target emails.
- **Campaign Analytics:** Track total recipients, successfully sent, failed counts, and view campaign previews in modal.

---

## Database Schema (`sql.sql`)

The repository includes `sql.sql`, defining production tables supporting advanced admin modules:

```sql
-- 1. Color Palettes
CREATE TABLE colors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Product Reviews & Ratings
CREATE TABLE product_reviews (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) DEFAULT NULL,
    variant_id VARCHAR(50) DEFAULT NULL,
    rating DECIMAL(2,1) NOT NULL,
    review_text TEXT DEFAULT NULL,
    user_name VARCHAR(100) DEFAULT NULL,
    user_email VARCHAR(150) DEFAULT NULL,
    status TINYINT(1) NOT NULL DEFAULT 1,          -- 1 = active, 0 = hidden
    review_from TINYINT(1) NOT NULL DEFAULT 0,     -- 0 = customer, 1 = admin
    updated_text_review TEXT DEFAULT NULL,
    updated_rating DECIMAL(2,1) DEFAULT NULL,
    mobile_number VARCHAR(20) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_product_id (product_id),
    INDEX idx_rating (rating),
    INDEX idx_review_from (review_from)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Promotional Coupons
CREATE TABLE coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coupon_code VARCHAR(50) NOT NULL UNIQUE,
    discount_percent DECIMAL(5,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0.00,
    max_uses INT DEFAULT NULL,
    redemptions INT DEFAULT 0,
    expiry_date DATE DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    product_ids TEXT DEFAULT NULL,                 -- Stored as JSON: [9098, 8413]
    user_ids TEXT DEFAULT NULL,                    -- Stored as JSON: [12, 45]
    user_emails TEXT DEFAULT NULL,                 -- Stored as JSON
    created_by_user_id INT DEFAULT NULL,
    created_by_email VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Coupon Redemption History
CREATE TABLE coupon_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coupon_id INT NOT NULL,
    coupon_code VARCHAR(50) NOT NULL,
    user_id INT NOT NULL,
    user_email VARCHAR(100) DEFAULT NULL,
    order_id INT DEFAULT NULL,
    order_amount DECIMAL(10,2) DEFAULT NULL,
    discount_amount DECIMAL(10,2) DEFAULT NULL,
    redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE
);

-- 5. Email Marketing Campaigns
CREATE TABLE email_campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject VARCHAR(255) NOT NULL,
    email_body LONGTEXT NOT NULL,
    banner_image VARCHAR(255) DEFAULT NULL,
    recipient_type VARCHAR(50) NOT NULL,          -- all_users, all_customers, inactive_users, custom
    custom_emails TEXT DEFAULT NULL,
    email_footer VARCHAR(255) DEFAULT 'Shree Mahaveer Collections | Unsubscribe',
    total_recipients INT DEFAULT 0,
    total_sent INT DEFAULT 0,
    total_failed INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft',           -- draft, sending, completed, failed
    created_by_user_id INT DEFAULT NULL,
    created_by_email VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    sent_at TIMESTAMP NULL DEFAULT NULL
);
```

---

## Complete API Endpoints Directory

All endpoints are built relative to `BASE_URL` defined in `src/Config/ApiConfig.js`.

### 1. Customer & Authentication Endpoints

| Domain | Action | Method | Path |
|---|---|---|---|
| **Auth** | Customer Login | POST | `smc/user/api/login.php` |
| **Auth** | Customer Register | POST | `smc/user/api/register.php` |
| **Auth** | Logout | POST | `smc/api/Logout.php` |
| **User** | Dashboard Metrics | GET | `smc/user/api/userDashboardTotalCount.php` |
| **User** | Orders History | GET | `smc/user/api/userOrderDetailsList.php` |
| **User** | Get Profile | GET | `smc/user/api/GetUserProfileDetails.php` |
| **User** | Update Profile | POST | `smc/user/api/userProfileUpdate.php` |
| **User** | Update Password | POST | `smc/user/api/userPasswordUpdate.php` |

### 2. Storefront Web Endpoints

| Domain | Action | Method | Path |
|---|---|---|---|
| **Catalog** | Product List | GET | `smc/api/v1/data/GetProductList.php` |
| **Catalog** | Product Details | GET | `smc/api/v1/data/GetProductDetails.php?product_id=` |
| **Catalog** | Main Categories & Subs | GET | `smc/api/v1/data/getMainCategories.php` |
| **Pincode** | Check Serviceability | GET | `smc/api/v1/data/checkPincode.php?pincode=` |
| **Reviews** | Public Reviews List | GET | `smc/api/v1/data/GetReviewAndRatings.php` |
| **Reviews** | Submit Review | POST JSON | `smc/admin/api/saveReviewsAndRating.php` |
| **Checkout** | Create Online Order | POST JSON | `smc/api/v1/data/CreateOrderOnline.php` |
| **Payment** | PhonePe Order Status | GET | `smc/payments/paymentStatus.php?merchantOrderId=` |

### 3. Admin Control Endpoints

| Domain | Action | Method | Path |
|---|---|---|---|
| **Auth** | Admin Login | POST | `smc/admin/api/AdminLogin.php` |
| **Dashboard** | Total KPI Counts | GET | `smc/admin/api/DashboardGetTotalCount.php` |
| **Products** | Fetch Master Products | GET | `smc/admin/api/GetProducts.php?page=&limit=` |
| **Products** | Create Master Product | POST multipart | `smc/admin/api/CreateProducts.php` |
| **Products** | Update Master Product | POST multipart | `smc/admin/api/UpdateProducts.php` |
| **Products** | Delete Master Product | POST JSON | `smc/admin/api/DeleteProducts.php` |
| **Variants** | Fetch Product Variants | GET | `smc/admin/api/GetProductVariants.php?product_id=` |
| **Variants** | Bulk Create Variants | POST multipart | `smc/admin/api/CreateProductVariant.php` |
| **Variants** | Update Variant | POST multipart | `smc/admin/api/UpdateProductVariant.php` |
| **Variants** | Delete Variant | POST JSON | `smc/admin/api/DeleteProductVariant.php` |
| **Variants** | Get Variant Colors | GET | `smc/admin/api/GetColorToProductsVarients.php` |
| **Categories**| Fetch Sub-Categories | GET | `smc/admin/api/GetCategory.php` |
| **Categories**| Create Sub-Category | POST multipart | `smc/admin/api/CreateCategory.php` |
| **Categories**| Update Sub-Category | POST JSON | `smc/admin/api/UpdateCategory.php` |
| **Categories**| Delete Sub-Category | DELETE | `smc/admin/api/DeleteCategory.php?category_id=` |
| **Categories**| Fetch Main Categories | GET | `smc/admin/api/getMainCategories.php` |
| **Categories**| Create Main Category | POST multipart | `smc/admin/api/createMainCategory.php` |
| **Orders** | Get Order List & Stats | GET | `smc/admin/api/GetOrderDetails.php` |
| **Orders** | Update Order Status | POST | `smc/admin/api/OrderStatusActions.php` |
| **Orders** | Generate PDF Invoice | POST | `smc/admin/api/GenerateAdminInvoice.php` |
| **Orders** | Ready to Dispatch | POST | `smc/admin/api/ReadyToDispatch.php` |
| **Shipments** | Get Shipment List | GET | `smc/admin/api/GetShipmentDetails.php` |
| **Users** | Get Registered Users | GET | `smc/admin/api/GetResigerteduserList.php` |
| **Users** | Get User Directory | GET | `smc/admin/api/GetUsers.php` |
| **Pincodes** | Fetch Pincodes List | GET | `smc/admin/api/GetPincodeList.php` |
| **Pincodes** | Save Single Pincode | POST JSON | `smc/admin/api/savePincodes.php` |
| **Pincodes** | Bulk Upload Pincodes | POST multipart | `smc/admin/api/BulkUploadPincodes.php` |
| **Colors** | Bulk Upload Colors | POST multipart | `smc/admin/api/BulkUploadColors.php` |
| **Colors** | Get Uploaded Colors | GET | `smc/admin/api/getColorsList.php` |
| **Reviews** | Get Products for Reviews| GET | `smc/admin/api/getProductDataToReviews.php` |
| **Reviews** | Get All Reviews List | GET | `smc/admin/api/GetAllReviews.php` |
| **Reviews** | Update Review / Status | POST | `smc/admin/api/UpdateReviewAndRating.php` |
| **Reviews** | Delete Review | POST | `smc/admin/api/DeleteReview.php` |
| **Coupons** | Create Coupon | POST JSON | `smc/admin/api/AddNewCoupans.php` |
| **Coupons** | Get Coupons List | GET | `smc/admin/api/GetCoupanLists.php` |
| **Coupons** | Update Coupon | POST JSON | `smc/admin/api/UpdateCoupon.php` |
| **Coupons** | Delete Coupon | POST JSON | `smc/admin/api/DeleteCoupon.php` |
| **Campaigns**| Create / Send Campaign | POST multipart | `smc/admin/api/CreateEmailCampaign.php` |
| **Campaigns**| Fetch Campaigns History| GET | `smc/admin/api/GetEmailCampaigns.php` |

---

## State Management & Local Storage

| Store / Key | Scope | Mechanism | Description |
|---|---|---|---|
| `smc_cart` | Storefront | `localStorage` via `CartContext` | Persists cart items, quantities, and selected variants |
| `smc_wishlist` | Storefront | `localStorage` via `CartContext` | Persists saved wishlist product IDs and details |
| `user_logged_in` | User Portal | `localStorage` via `apiClients` | Boolean flag indicating customer session |
| `user_token` | User Portal | `localStorage` via `apiClients` | Customer session authentication token |
| `user_profile` | User Portal | `localStorage` via `apiClients` | Cached customer profile object |
| `admin_logged_in`| Admin Panel | `localStorage` via `apiClients` | Boolean flag indicating admin authentication |
| `admin_token` | Admin Panel | `localStorage` via `apiClients` | Admin Bearer authentication token |
| `admin_user` | Admin Panel | `localStorage` via `apiClients` | Cached admin user profile details |

---

## SEO & Open Graph

- **Provider:** `react-helmet-async` wraps the entire root application in `App.jsx`.
- **Product Detail Pages (`ProductDetailSeo`):**
  - Dynamic `<title>`: Product name + Category + Brand.
  - Dynamic `<meta name="description">`: Extracted from short/full product description.
  - Canonical URL resolution.
  - Open Graph tags (`og:title`, `og:description`, `og:image`, `og:price:amount`, `og:price:currency`).
  - Twitter Card integration (`summary_large_image`).
  - Google Structured Data: `Product` schema and `BreadcrumbList` JSON-LD.
- **Product Listing Pages (`ProductListSeo`):**
  - Category-specific meta titles and descriptions.
  - `CollectionPage` JSON-LD schema for catalog indexing.
- **Slug Format:** SEO-friendly slugs containing embedded product identifiers (e.g., `/products/classic-school-bag-smc-00042`).

---

## Environment Configuration

Environment settings are resolved automatically in `src/Config/ApiConfig.js`:

```javascript
// Switches automatically based on window.location.origin:
const ENVIRONMENTS = {
  production: {
    FRONTEND_URL: "https://shreemahaveercollections.com",
    BASE_URL: "https://shreemahaveercollections.com/apis/v1/",
  },
  uat: {
    FRONTEND_URL: "https://shreemahaveercollections.com",
    BASE_URL: "https://shreemahaveercollections.com/apis/v1/",
  },
  development: {
    FRONTEND_URL: "http://localhost:5173",
    BASE_URL: "https://shreemahaveercollections.com/apis/v1/", // Can point to http://localhost/
  },
};
```

---

## Build & Deployment

1. **Compile Application:**
   ```bash
   npm run build
   ```
   Outputs optimized, tree-shaken static assets to the `dist/` directory.

2. **Server SPA Routing:**
   Configure web servers (Apache, Nginx, or Netlify/Vercel) to route all paths to `index.html`.
   *(A `public/_redirects` file is included for Netlify/Cloudflare: `/*  /index.html  200`)*.

3. **Apache `.htaccess` Example:**
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

---

## License

Private and Confidential &copy; **Shree Mahaveer Collections (SMC)**. All rights reserved.