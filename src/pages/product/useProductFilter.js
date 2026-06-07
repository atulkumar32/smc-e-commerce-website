import { useState, useMemo, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { PRODUCTS } from './productData';
import { fetchWebProductList } from '../../Actions/Web/GetProductListAction';

const DEFAULT_PAGE_SIZE = 12;

function resolvePathCategory(pathname) {
  if (pathname.includes('school-bags')) return 'school-bags';
  if (pathname.includes('purses')) return 'purses';
  if (pathname.includes('wallets')) return 'wallets';
  if (pathname.includes('new-arrivals')) return 'new-arrivals';
  return 'all';
}

function resolveApiImage(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/')) {
    return `${window.location.origin}${path}`;
  }
  return `${window.location.origin}/${path}`;
}

function mapApiProduct(product) {
  const price = Number(product.selling_price ?? product.price ?? product.mrp ?? 0);
  const mrp = Number(product.mrp ?? product.price ?? price);

  return {
    id: product.product_id || product.productId || product.id,
    name: product.product_name || product.productName || product.name || 'Product',
    price,
    originalPrice: mrp !== price ? mrp : null,
    category: product.category || product.category_id || 'all',
    badge: product.badge || null,
    colors: Array.isArray(product.colors)
      ? product.colors
      : product.colors
        ? [product.colors]
        : [],
    image: resolveApiImage(product.primary_image || product.images?.[0] || product.image || ''),
  };
}

function mapMockProduct(product) {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    originalPrice: product.originalPrice || null,
    category: product.category,
    badge: product.badge,
    colors: product.colors || [],
    image: product.image,
  };
}

function filterAndSortMockProducts({ category, query, sort, minPrice, maxPrice, badge }) {
  let list = [...PRODUCTS];

  if (category && category !== 'all') {
    if (category === 'new-arrivals') {
      list = list.filter((p) => p.badge === 'New' || p.badge === 'Limited');
    } else {
      list = list.filter((p) => p.category === category);
    }
  }

  if (query) {
    const q = query.toLowerCase();
    list = list.filter((product) =>
      product.name.toLowerCase().includes(q) ||
      String(product.category).toLowerCase().includes(q) ||
      String(product.badge || '').toLowerCase().includes(q)
    );
  }

  if (minPrice !== null) {
    list = list.filter((product) => product.price >= minPrice);
  }

  if (maxPrice !== null) {
    list = list.filter((product) => product.price <= maxPrice);
  }

  if (badge) {
    list = list.filter((product) =>
      String(product.badge || '').toLowerCase() === String(badge).toLowerCase()
    );
  }

  switch (sort) {
    case 'price-asc':
      return list.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return list.sort((a, b) => b.price - a.price);
    case 'newest':
      return list.sort((a, b) => b.id - a.id);
    default:
      return list;
  }
}

function getQueryValue(searchParams, key, fallback = '') {
  const value = searchParams.get(key);
  return value === null ? fallback : value;
}

export function useProductFilter() {
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const queryCategory = getQueryValue(searchParams, 'category', null);
  const queryTerm = getQueryValue(searchParams, 'q', '');
  const querySort = getQueryValue(searchParams, 'sort', 'recommended');
  const queryPage = Number(getQueryValue(searchParams, 'page', '1')) || 1;
  const queryLimit = Number(getQueryValue(searchParams, 'limit', String(DEFAULT_PAGE_SIZE))) || DEFAULT_PAGE_SIZE;
  const queryMinPrice = searchParams.has('min_price')
    ? Number(getQueryValue(searchParams, 'min_price', ''))
    : null;
  const queryMaxPrice = searchParams.has('max_price')
    ? Number(getQueryValue(searchParams, 'max_price', ''))
    : null;
  const queryBadge = getQueryValue(searchParams, 'badge', '');

  const pathCategory = useMemo(() => resolvePathCategory(pathname), [pathname]);
  const activeCategory = queryCategory || pathCategory;

  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  const updateParams = (updater) => {
    const next = new URLSearchParams(searchParams.toString());
    updater(next);
    setSearchParams(next, { replace: true });
  };

  const changeCategory = (key) => {
    updateParams((next) => {
      next.set('category', key);
      next.set('page', '1');
    });
  };

  const changeSort = (value) => {
    updateParams((next) => {
      next.set('sort', value);
      next.set('page', '1');
    });
  };

  const applyPriceFilter = (minPrice, maxPrice) => {
    updateParams((next) => {
      if (minPrice === null || minPrice === undefined || minPrice === '') {
        next.delete('min_price');
      } else {
        next.set('min_price', String(minPrice));
      }

      if (maxPrice === null || maxPrice === undefined || maxPrice === '') {
        next.delete('max_price');
      } else {
        next.set('max_price', String(maxPrice));
      }

      next.set('page', '1');
    });
  };

  const clearPriceFilters = () => {
    updateParams((next) => {
      next.delete('min_price');
      next.delete('max_price');
      next.set('page', '1');
    });
  };

  const clearAllFilters = () => {
    updateParams((next) => {
      next.delete('category');
      next.delete('sort');
      next.delete('q');
      next.delete('min_price');
      next.delete('max_price');
      next.delete('badge');
      next.set('page', '1');
    });
  };

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadProducts() {
      setLoading(true);

      const params = {
        category: activeCategory,
        q: queryTerm,
        sort: querySort,
        page: queryPage,
        limit: queryLimit,
        min_price: queryMinPrice || undefined,
        max_price: queryMaxPrice || undefined,
        badge: queryBadge || undefined,
      };

      try {
        const data = await fetchWebProductList(params);
        if (!isMounted) return;

        const apiProducts = Array.isArray(data.products) ? data.products : [];
        const mapped = apiProducts.map(mapApiProduct);

        setProducts((prev) => (queryPage === 1 ? mapped : [...prev, ...mapped]));
        setTotalCount(Number(data.total ?? apiProducts.length));
        setHasMore(queryPage * queryLimit < (Number(data.total ?? apiProducts.length)));
      } catch {
        if (!isMounted) return;

        const mockList = filterAndSortMockProducts({
          category: activeCategory,
          query: queryTerm,
          sort: querySort,
          minPrice: queryMinPrice,
          maxPrice: queryMaxPrice,
          badge: queryBadge,
        });

        const start = (queryPage - 1) * queryLimit;
        const end = start + queryLimit;
        const pageChunk = mockList.slice(start, end).map(mapMockProduct);

        setProducts((prev) => (queryPage === 1 ? pageChunk : [...prev, ...pageChunk]));
        setTotalCount(mockList.length);
        setHasMore(queryPage * queryLimit < mockList.length);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [activeCategory, queryTerm, querySort, queryPage, queryLimit, queryMinPrice, queryMaxPrice, queryBadge]);

  const visibleCount = products.length;
  const loadMore = () => {
    updateParams((next) => {
      next.set('page', String(queryPage + 1));
    });
  };

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

  return {
    products,
    totalCount,
    visibleCount,
    hasMore,
    loadMore,
    activeCategory,
    changeCategory,
    sortBy: querySort,
    changeSort,
    pageTitle,
    loading,
    minPrice: queryMinPrice,
    maxPrice: queryMaxPrice,
    applyPriceFilter,
    clearPriceFilters,
    clearAllFilters,
  };
}
