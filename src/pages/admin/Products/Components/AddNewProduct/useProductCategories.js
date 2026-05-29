/**
 * useProductCategories.js
 *
 * Fetches categories from the DB via the API.
 * No localStorage — always reads from the backend.
 */

import { useState, useEffect } from 'react';
import { fetchCategoriesAction } from '../../../../../Actions/CategoryAction';

function useProductCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const list = await fetchCategoriesAction();
        if (!cancelled) {
          setCategories(list);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load categories');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  return { categories, loading, error };
}

export default useProductCategories;
