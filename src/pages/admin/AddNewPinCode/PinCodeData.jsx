/**
 * PinCodeData.jsx
 *
 * Data layer for Pincode Management page.
 *   - Constants  : DELIVERY_TIME_OPTIONS, STATUS_OPTIONS, emptyPincodeForm
 *   - Utility    : lookupPincode  (India Post API — auto-fill state/city)
 *   - Custom hook: usePincodes   (server-side paginated list)
 *
 * All API calls → UploadloadPinCodesActions.js
 * All URLs      → Config/UrlsConfig.js
 */

import { useState, useCallback } from 'react';
import { fetchPincodeListAction } from '../../../Actions/UploadloadPinCodesActions';

// ── Constants ─────────────────────────────────────────────────────────────────
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
  estimated_delivery_time: '',   // exact field name the backend expects
  notes:                   '',
};

// ── India Post pincode lookup (auto-fill state + city) ────────────────────────
export async function lookupPincode(pincode) {
  if (!pincode || String(pincode).trim().length !== 6) return null;
  try {
    const res  = await fetch(`https://api.postalpincode.in/pincode/${pincode.trim()}`);
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

// ── Custom hook: usePincodes ──────────────────────────────────────────────────
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

      // Normalize status values
      let list = result.pincodes.map((p) => ({
        ...p,
        status: p.status === 'non_serviceable' ? 'non_serviceable' : p.status,
      }));

      // Client-side status filter (API doesn't filter by status yet)
      const sf = opts.filterStatus ?? filterStatus;
      if (sf) list = list.filter((p) => p.status === sf);

      setPincodes(list);
      setTotalRecords(result.total_records);
      setTotalPages(result.total_pages);
    } catch (err) {
      console.error('[usePincodes] fetch error:', err.message);
      setError(err.message || 'Failed to load pincodes');
      setPincodes([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, filterState, filterStatus]);

  // Computed stats from current page (API doesn't return full breakdown)
  const stats = {
    total:          totalRecords,
    serviceable:    pincodes.filter((p) => p.status === 'serviceable').length,
    nonServiceable: pincodes.filter((p) =>
      p.status === 'non_serviceable' || p.status === 'non-serviceable').length,
    lastUpdated: pincodes.length > 0
      ? new Date(Math.max(...pincodes.map((p) =>
          new Date(p.updated_at || p.created_at))))
          .toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
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

// ── Custom hook: useBulkUpload ────────────────────────────────────────────────
import { bulkUploadPincodesAction } from '../../../Actions/UploadloadPinCodesActions';

export function useBulkUpload(onSuccess) {
  const [file,       setFile]       = useState(null);
  const [uploading,  setUploading]  = useState(false);
  const [uploadResult, setUploadResult] = useState(null); // { inserted, failed, errors }
  const [uploadError,  setUploadError]  = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    setUploadResult(null);
    setUploadError('');
  };

  const handleUpload = async () => {
    if (!file) { setUploadError('Please select a CSV or Excel file first.'); return; }
    setUploading(true);
    setUploadError('');
    setUploadResult(null);

    try {
      const data = await bulkUploadPincodesAction(file);
      setUploadResult({
        inserted: Number(data.inserted ?? data.success_count ?? 0),
        failed:   Number(data.failed   ?? data.fail_count    ?? 0),
        errors:   Array.isArray(data.errors) ? data.errors : [],
        message:  data.message || 'Upload complete',
      });
      setFile(null);
      onSuccess?.();
    } catch (err) {
      setUploadError(err.message || 'Bulk upload failed');
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setUploadResult(null);
    setUploadError('');
  };

  return {
    file, handleFileChange,
    uploading, handleUpload,
    uploadResult, uploadError,
    reset,
  };
}
