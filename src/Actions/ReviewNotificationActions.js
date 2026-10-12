/**
 * ReviewNotificationActions.js
 *
 * Dedicated helper to fetch inactive review ratings for the Admin Dashboard
 * notification bell and dashboard stat card.
 *
 * Only counts reviews where status === 0 (inactive).
 */

import { URL_GET_REVIEWS_LIST } from '../Config/UrlsConfig';

/**
 * Checks if a review is inactive.
 * Matches: status === 0 (or '0' / 'inactive')
 */
export function isInactive(review) {
  if (!review) return false;

  return (
    Number(review.status) === 0 ||
    review.status === '0' ||
    review.status === 'inactive'
  );
}

/**
 * Fetches reviews and returns:
 * - pendingReviews: Array of inactive reviews (status === 0)
 * - count: Total number of inactive reviews
 * - totalRecords: Total records from API
 * - allReviews: Full list of reviews fetched
 */
export const fetchPendingReviewsAction = async ({ limit = 100 } = {}) => {
  try {
    const url = `${URL_GET_REVIEWS_LIST}?page=1&limit=${limit}&per_page=${limit}`;
    const res = await fetch(url, { method: 'GET' });
    const text = await res.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {};
    }

    const rawList = Array.isArray(data?.data) ? data.data : [];

    // Filter to inactive reviews only (status === 0)
    const pendingReviews = rawList.filter(isInactive);

    // Sort newest first by created_at or id
    pendingReviews.sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA || Number(b.id || 0) - Number(a.id || 0);
    });

    return {
      pendingReviews,
      count: pendingReviews.length,
      totalRecords: Number(data?.total_records ?? rawList.length),
      allReviews: rawList,
    };
  } catch (err) {
    return {
      pendingReviews: [],
      count: 0,
      totalRecords: 0,
      allReviews: [],
    };
  }
};
