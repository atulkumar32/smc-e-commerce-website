/**
 * GetProductDetailsActions.js
 *
 * Builds the product detail API URL dynamically using the auto-resolved BASE_URL.
 * Usage:
 *   import { FetchProductDetailsActions } from '../Actions/Web/GetProductDetailsActions';
 *   const resp = await fetch(FetchProductDetailsActions(productId));
 */

import { BASE_URL } from '../../Config/ApiConfig';

/**
 * Returns the full URL for fetching a single product by its ID.
 * @param {string|number} productId  — product_id or slug
 * @returns {string} full URL ready for fetch()
 */
export function FetchProductDetailsActions(productId) {
  return `${BASE_URL}smc/api/v1/data/GetProductDetails.php?product_id=${encodeURIComponent(productId)}`;
}

export default FetchProductDetailsActions;
