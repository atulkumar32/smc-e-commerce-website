// /**
//  * UrlsConfig.js
//  *
//  * All API endpoint URLs, built on top of the auto-resolved BASE_URL.
//  * Import individual URLs wherever you make API calls.
//  */

// import BASE_URL from "./ApiConfig";

// // ── Auth ──────────────────────────────────────────────────────────────────────
// // Use user API endpoints for frontend user auth
// export const URL_LOGIN         = `${BASE_URL}smc/user/api/login.php`;
// export const URL_REGISTER      = `${BASE_URL}smc/user/api/register.php`;
// export const URL_LOGOUT        = `${BASE_URL}smc/api/Logout.php`;
// export const URL_ADMIN_LOGIN   = `${BASE_URL}smc/admin/api/AdminLogin.php`;

// // ── Admin dashboard Products ─────────────────────────────────────
// export const URL_PRODUCTS_CREATE     = `${BASE_URL}smc/admin/api/CreateProducts.php`;
// export const URL_PRODUCTS_UPDATE    = `${BASE_URL}smc/admin/api/UpdateProducts.php`;
// export const URL_PRODUCTS_DELETE    = `${BASE_URL}smc/admin/api/DeleteProducts.php`;
// export const URL_PRODUCTS_FETCH   = `${BASE_URL}smc/admin/api/GetProducts.php`;

// // ── User Orders ──────────────────────────────────────────────────────────────
// export const URL_USER_ORDERS_FETCH  = `${BASE_URL}smc/user/api/userOrderDetailsList.php`; 







// export const URL_DASHBOARD_STATS   = `${BASE_URL}smc/admin/api/DashboardGetTotalCount.php`;
// export const URL_USERS_FETCH       = `${BASE_URL}smc/admin/api/GetResigerteduserList.php`;

// // ── Media / uploads base path ─────────────────────────────────────────────────
// // Images are stored at: {MEDIA_BASE}uploads/products/filename.png
// export const MEDIA_BASE = `${BASE_URL}smc/`;
// export const URL_CATEGORIES_FETCH    = `${BASE_URL}smc/admin/api/GetCategory.php`;
// export const URL_CATEGORIES_CREATE   = `${BASE_URL}smc/admin/api/CreateCategory.php`;
// export const URL_CATEGORIES_UPDATE   = `${BASE_URL}smc/admin/api/UpdateCategory.php`;
// export const URL_CATEGORIES_DELETE   = `${BASE_URL}smc/admin/api/DelteCategory.php`;



// // web page all apis here now 
// export const WEB_URLS = {
//  PRODUCT_LIST: `${BASE_URL}smc/api/v1/data/GetProductList.php`,
//  PAYMENT_STATUS: `${BASE_URL}smc/payments/paymentStatus.php`,
// };



// // for website side all apis here start with smc/api/ and for admin side all apis 


/**
 * UrlsConfig.js
 */

import { BASE_URL } from "./ApiConfig";

// ── Auth ──────────────────────────────────────────────────────────
export const URL_LOGIN = `${BASE_URL}smc/user/api/login.php`;
export const URL_REGISTER = `${BASE_URL}smc/user/api/register.php`;
export const URL_LOGOUT = `${BASE_URL}smc/api/Logout.php`;
export const URL_ADMIN_LOGIN = `${BASE_URL}smc/admin/api/AdminLogin.php`;

// ── Products ──────────────────────────────────────────────────────
export const URL_PRODUCTS_CREATE = `${BASE_URL}smc/admin/api/CreateProducts.php`;
export const URL_PRODUCTS_UPDATE = `${BASE_URL}smc/admin/api/UpdateProducts.php`;
export const URL_PRODUCTS_DELETE = `${BASE_URL}smc/admin/api/DeleteProducts.php`;
export const URL_PRODUCTS_FETCH = `${BASE_URL}smc/admin/api/GetProducts.php`;

// ── Orders ────────────────────────────────────────────────────────
export const URL_USER_ORDERS_FETCH = `${BASE_URL}smc/user/api/userOrderDetailsList.php`;

// ── Dashboard ─────────────────────────────────────────────────────
export const URL_DASHBOARD_STATS = `${BASE_URL}smc/admin/api/DashboardGetTotalCount.php`;
export const URL_USERS_FETCH = `${BASE_URL}smc/admin/api/GetResigerteduserList.php`;

// ── Categories ────────────────────────────────────────────────────
export const URL_CATEGORIES_FETCH = `${BASE_URL}smc/admin/api/GetCategory.php`;
export const URL_CATEGORIES_CREATE = `${BASE_URL}smc/admin/api/CreateCategory.php`;
export const URL_CATEGORIES_UPDATE = `${BASE_URL}smc/admin/api/UpdateCategory.php`;
export const URL_CATEGORIES_DELETE = `${BASE_URL}smc/admin/api/DeleteCategory.php`; //apis/v1/smc/admin/api/DeleteCategory.php


// ---------------------------order------------------------------------------
// http://localhost/smc/admin/api/GetOrderDetails.php
export const URL_ADMIN_GET_ORDER_DETAILS  = `${BASE_URL}smc/admin/api/GetOrderDetails.php`;
export const URL_ADMIN_GET_SHIPMENT_DETAILS = `${BASE_URL}smc/admin/api/GetShipmentDetails.php`;
export const URL_ORDER_STATUS_ACTION      = `${BASE_URL}smc/admin/api/OrderStatusActions.php`;
export const URL_GENERATE_INVOICE        = `${BASE_URL}smc/admin/api/GenerateAdminInvoice.php`;
export const URL_READY_TO_DISPATCH       = `${BASE_URL}smc/admin/api/ReadyToDispatch.php`;


// ── Variant APIs ──────────────────────────────────────────────────
export const URL_VARIANTS_CREATE       = `${BASE_URL}smc/admin/api/CreateProductVariant.php`;
export const URL_VARIANTS_CREATE_BULK  = `${BASE_URL}smc/admin/api/CreateProductVariant.php`; //http://localhost/smc/admin/api/CreateProductVariant.php
export const URL_VARIANTS_UPDATE       = `${BASE_URL}smc/admin/api/UpdateProductVariant.php`;
export const URL_VARIANTS_DELETE       = `${BASE_URL}smc/admin/api/DeleteProductVariant.php`;
export const URL_VARIANTS_FETCH        = `${BASE_URL}smc/admin/api/GetProductVariants.php`;

// ── Media ─────────────────────────────────────────────────────────
// Images are stored at: {MEDIA_BASE}uploads/products/filename.png
export const MEDIA_BASE = `${BASE_URL}smc/`;

// ── Website APIs ──────────────────────────────────────────────────
export const WEB_URLS = {
  PRODUCT_LIST: `${BASE_URL}smc/api/v1/data/GetProductList.php`,
  PRODUCT__VAEIENT_CREATE: `${BASE_URL}smc/admin/api/CreateProductVariant.php`,
  PAYMENT_API:`${BASE_URL}smc/api/v1/data/CreateOrderOnline.php`, // http://localhost/smc/api/v1/data/CreateOrderOnline.php
  PAYMENT_STATUS: `${BASE_URL}smc/payments/paymentStatus.php`, // http://localhost/smc/payments/paymentStatus.php?merchantOrderId=ORD1783138445
};



export const USER_APIS = {
  DASHBOARD_COUNT:  `${BASE_URL}smc/user/api/userDashboardTotalCount.php`,
  ORDERS_LIST:      `${BASE_URL}smc/user/api/userOrderDetailsList.php`,
  PROFILE_UPDATE:   `${BASE_URL}smc/user/api/userProfileUpdate.php`,
  PROFILE_GET:      `${BASE_URL}smc/user/api/GetUserProfileDetails.php`,
  PASSWORD_UPDATE:  `${BASE_URL}smc/user/api/userPasswordUpdate.php`,
};