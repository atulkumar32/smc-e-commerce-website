/**
 * UrlsConfig.js
 *
 * All API endpoint URLs, built on top of the auto-resolved BASE_URL.
 * Import individual URLs wherever you make API calls.
 */

import BASE_URL from "./ApiConfig";

// ── Auth ──────────────────────────────────────────────────────────────────────
// Use user API endpoints for frontend user auth
export const URL_LOGIN         = `${BASE_URL}smc/user/api/login.php`;
export const URL_REGISTER      = `${BASE_URL}smc/user/api/register.php`;
export const URL_LOGOUT        = `${BASE_URL}smc/api/Logout.php`;
export const URL_ADMIN_LOGIN   = `${BASE_URL}smc/admin/api/AdminLogin.php`;

// ── Admin dashboard Products ─────────────────────────────────────
export const URL_PRODUCTS_CREATE     = `${BASE_URL}smc/admin/api/CreateProducts.php`;
export const URL_PRODUCTS_UPDATE    = `${BASE_URL}smc/admin/api/UpdateProducts.php`;
export const URL_PRODUCTS_DELETE    = `${BASE_URL}smc/admin/api/DeleteProducts.php`;
export const URL_PRODUCTS_FETCH   = `${BASE_URL}smc/admin/api/GetProducts.php`;

// ── User Orders ──────────────────────────────────────────────────────────────
export const URL_USER_ORDERS_FETCH  = `${BASE_URL}smc/user/api/userOrderDetailsList.php`; 







export const URL_DASHBOARD_STATS   = `${BASE_URL}smc/admin/api/DashboardGetTotalCount.php`;
export const URL_USERS_FETCH       = `${BASE_URL}smc/admin/api/GetResigerteduserList.php`;

// ── Media / uploads base path ─────────────────────────────────────────────────
// Images are stored at: {MEDIA_BASE}uploads/products/filename.png
export const MEDIA_BASE = `${BASE_URL}smc/`;
export const URL_CATEGORIES_FETCH    = `${BASE_URL}smc/admin/api/GetCategory.php`;
export const URL_CATEGORIES_CREATE   = `${BASE_URL}smc/admin/api/CreateCategory.php`;
export const URL_CATEGORIES_UPDATE   = `${BASE_URL}smc/admin/api/UpdateCategory.php`;
export const URL_CATEGORIES_DELETE   = `${BASE_URL}smc/admin/api/DelteCategory.php`;



// web page all apis here now 
export const WEB_URLS = {
 PRODUCT_LIST: `${BASE_URL}smc/api/v1/data/GetProductList.php`,
};



// for website side all apis here start with smc/api/ and for admin side all apis 