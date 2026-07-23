/**
 * PinCodeData.jsx
 *
 * Config + hook for the Pincode Management page.
 * Real data comes from GetPincodeList.php API.
 * Response shape:
 *   { data: [{ id, pincode, state, city, status, delivery_charge,
 *              estimated_delivery_time, notes, created_at }],
 *     total_records, total_pages, current_page }
 */

import { useState, useCallback } from 'react';
import { fetchPincodeListAction } from '../../../Actions/SavePincodeAction';

// ── Options ───────────────────────────────────────────────────────────────────
export const DELIVERY_TIME_OPTIONS = [
  '1-2 Days', '2-3 Days', '3-5 Days',
  '5-7 Days', 'Same Day Delivery', 'Next Day Delivery',
];

export const STATUS_OPTIONS = [
  { value: 'serviceable',     label: 'Serviceable',     color: '#16a34a', bg: '#dcfce7' },
  { value: 'non_serviceable', label: 'Non-Serviceable', color: '#dc2626', bg: '#fee2e2' },
];

export const emptyPincodeForm = {
  pincode:                 '',
  state:                   '',
  city:                    '',
  status:                  'serviceable',
  delivery_charge:         '',
  estimated_delivery_time: '',   // matches API field name
  notes:                   '',
};

// ── Lookup pincode from India Post API ────────────────────────────────────────
export async function lookupPincode(pincode) {
  if (!pincode || pincode.length !== 6) return null;
  try {
    const res  = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await res.json();
    if (!Array.isArray(data) || data[0]?.Status !== 'Success') return null;
    const po = data[0]?.PostOffice?.[0];
    if (!po) return null;
    return {
      state: po.State    || '',
      city:  po.District || po.Block || po.Name || '',
    };
  } catch { return null; }
}

// ── Hook — server-side paginated pincodes ─────────────────────────────────────
export function usePincodes() {
  const [pincodes,     setPincodes]     = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages,   setTotalPages]   = useState(1);
  const [page,         setPage]         = useState(1);
  const [search,       setSearch]       = useState('');
  const [filterState,  setFilterState]  = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const PER_PAGE = 10;

  // ── Fetch from API ──────────────────────────────────────────────────────────
  const fetchPincodes = useCallback(async (opts = {}) => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchPincodeListAction({
        page:     opts.page     ?? page,
        per_page: PER_PAGE,
        pincode:  opts.search   ?? search,
        state:    opts.state    ?? filterState,
      });

      // Normalize status: API uses 'non_serviceable', UI uses both
      const normalized = result.pincodes.map((p) => ({
        ...p,
        status: p.status === 'non_serviceable' ? 'non_serviceable' : p.status,
      }));

      // Client-side filter by status (API doesn't support it yet)
      const statusFilter = opts.filterStatus ?? filterStatus;
      const filtered = statusFilter
        ? normalized.filter((p) => p.status === statusFilter)
        : normalized;

      setPincodes(filtered);
      setTotalRecords(result.total_records);
      setTotalPages(result.total_pages);
    } catch (err) {
      console.error('[PinCodeData] fetch error:', err.message);
      setError(err.message || 'Failed to load pincodes');
      setPincodes([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, filterState, filterStatus]);

  // ── Stats computed from current page data (not full list) ──────────────────
  // For accurate totals, the API doesn't return breakdown — so we show total_records
  const stats = {
    total:          totalRecords,
    serviceable:    pincodes.filter((p) => p.status === 'serviceable').length,
    nonServiceable: pincodes.filter((p) => p.status === 'non_serviceable' || p.status === 'non-serviceable').length,
    lastUpdated:    pincodes.length > 0
      ? new Date(Math.max(...pincodes.map((p) => new Date(p.created_at || p.updated_at)))).toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric',
        })
      : '—',
  };

  return {
    pincodes, loading, error,
    totalRecords, totalPages,
    page, setPage,
    search, setSearch,
    filterStatus, setFilterStatus,
    filterState,  setFilterState,
    stats,
    fetchPincodes,
    PER_PAGE,
  };
}
