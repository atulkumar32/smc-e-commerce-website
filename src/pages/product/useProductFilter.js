import { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { PRODUCTS } from './productData';

/**
 * useProductFilter
 * Centralised filter + sort logic for the product listing page.
 * Can be reused on any page that needs filtered products.
 */
export function useProductFilter() {
  const { pathname } = useLocation();

  // Derive initial category from URL path
  const pathCategory = useMemo(() => {
    if (pathname.includes('school-bags')) return 'school-bags';
    if (pathname.includes('purses')) return 'purses';
    if (pathname.includes('wallets')) return 'wallets';
    if (pathname.includes('new-arrivals')) return 'new-arrivals';
    return 'all';
  }, [pathname]);

  const [activeCategory, setActiveCategory] = useState(pathCategory);
  const [sortBy, setSortBy] = useState('recommended');
  const [visibleCount, setVisibleCount] = useState(6);
  const PAGE_SIZE = 6;

  // Derive page title from active category
  const pageTitle = useMemo(() => {
    const map = {
      'school-bags': 'School Bags',
      purses: 'Luxury Purses',
      wallets: 'Wallets',
      'new-arrivals': 'New Arrivals',
      all: 'All Products',
    };
    return map[activeCategory] || 'All Products';
  }, [activeCategory]);

  // Filter
  const filtered = useMemo(() => {
    let list = [...PRODUCTS];
    if (activeCategory !== 'all') {
      if (activeCategory === 'new-arrivals') {
        list = list.filter((p) => p.badge === 'New' || p.badge === 'Limited');
      } else {
        list = list.filter((p) => p.category === activeCategory);
      }
    }
    return list;
  }, [activeCategory]);

  // Sort
  const sorted = useMemo(() => {
    const list = [...filtered];
    switch (sortBy) {
      case 'price-asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return list.sort((a, b) => b.price - a.price);
      case 'newest':
        return list.sort((a, b) => b.id - a.id);
      default:
        return list;
    }
  }, [filtered, sortBy]);

  // Paginate
  const visible = useMemo(() => sorted.slice(0, visibleCount), [sorted, visibleCount]);
  const hasMore = visibleCount < sorted.length;
  const loadMore = () => setVisibleCount((prev) => prev + PAGE_SIZE);

  const changeCategory = (key) => {
    setActiveCategory(key);
    setVisibleCount(PAGE_SIZE);
  };

  return {
    products: visible,
    totalCount: sorted.length,
    visibleCount,
    hasMore,
    loadMore,
    activeCategory,
    changeCategory,
    sortBy,
    setSortBy,
    pageTitle,
  };
}
