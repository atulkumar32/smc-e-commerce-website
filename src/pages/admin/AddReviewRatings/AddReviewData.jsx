/**
 * AddReviewData.jsx
 *
 * Shared data layer — products list hook + reviews list hook.
 * Form/save logic lives in AddRatingData.jsx
 */

import { useState, useEffect, useCallback } from 'react';
import {
  fetchProductsForReviewsAction,
  fetchReviewsListAction,
} from '../../../Actions/GetProductIdToReviewsActions';

export const REVIEWS_PER_PAGE = 10;

export const TABLE_COLUMNS = [
  { key: 'id',                  label: '#'               },
  { key: 'product_id',          label: 'Product ID'      },
  { key: 'product_name',        label: 'Product Name'    },
  { key: 'variant_id',          label: 'Variant'         },
  { key: 'rating',              label: 'Rating'          },
  { key: 'updated_rating',      label: 'Updated Rating'  },
  { key: 'user_name',           label: 'Reviewer'        },
  { key: 'review_text',         label: 'Review'          },
  { key: 'updated_text_review', label: 'Updated Review'  },
  { key: 'status',              label: 'Status'          },
  { key: 'created_at',          label: 'Date'            },
  { key: 'actions',             label: 'Actions'         },
];

// ── Hook: useProductsForReviews ───────────────────────────────────────────────
export function useProductsForReviews() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchProductsForReviewsAction()
      .then((list) => { if (!cancelled) setProducts(list); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { products, loading, error };
}

// ── Hook: useReviewsList ──────────────────────────────────────────────────────
export function useReviewsList() {
  const [reviews,    setReviews]    = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [search,     setSearch]     = useState('');
  const [page,       setPage]       = useState(1);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // 400 ms debounce on search, reset page
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const doFetch = useCallback(async (pg, srch) => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchReviewsListAction({
        page: pg, limit: REVIEWS_PER_PAGE, search: srch,
      });
      setReviews(result.reviews);
      setTotal(result.total);
      setTotalPages(result.total_pages);
    } catch (err) {
      setError(err.message || 'Failed to load reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { doFetch(page, debouncedSearch); }, [page, debouncedSearch, doFetch]);

  const refetch = useCallback(
    () => doFetch(page, debouncedSearch),
    [page, debouncedSearch, doFetch]
  );

  return {
    reviews, loading, error,
    search, setSearch,
    page, setPage,
    total, totalPages,
    refetch,
  };
}
