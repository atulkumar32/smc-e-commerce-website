import { useState, useCallback } from 'react';

export const DELIVERY_TIME_OPTIONS = [
  '1-2 Business Days',
  '2-3 Business Days',
  '3-5 Business Days',
  '5-7 Business Days',
  'Same Day Delivery',
  'Next Day Delivery',
];

export const STATUS_OPTIONS = [
  { value: 'serviceable',     label: 'Serviceable',     color: '#16a34a', bg: '#dcfce7' },
  { value: 'non-serviceable', label: 'Non-Serviceable', color: '#dc2626', bg: '#fee2e2' },
];

export const emptyPincodeForm = {
  pincode:          '',
  state:            '',
  city:             '',
  status:           'serviceable',
  delivery_charge:  '',
  delivery_time:    '',
  notes:            '',
};

/** Fetch pincode info from India Post API */
export async function lookupPincode(pincode) {
  if (!pincode || pincode.length !== 6) return null;
  try {
    const res  = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await res.json();
    if (!Array.isArray(data) || data[0]?.Status !== 'Success') return null;
    const po = data[0]?.PostOffice?.[0];
    if (!po) return null;
    return {
      state: po.State   || '',
      city:  po.District || po.Block || po.Name || '',
    };
  } catch {
    return null;
  }
}

/** Simple hook for pincode list state + filter */
export function usePincodes() {
  const [pincodes, setPincodes]       = useState([]);
  const [loading,  setLoading]        = useState(false);
  const [search,   setSearch]         = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterState,  setFilterState]  = useState('');
  const [page,     setPage]           = useState(1);
  const PER_PAGE = 10;

  const addPincode = useCallback((entry) => {
    setPincodes((prev) => {
      const exists = prev.some((p) => p.pincode === entry.pincode);
      if (exists) return prev.map((p) => p.pincode === entry.pincode ? { ...p, ...entry } : p);
      return [{ ...entry, id: Date.now(), added_on: new Date().toISOString() }, ...prev];
    });
  }, []);

  const deletePincode = useCallback((pincode) => {
    setPincodes((prev) => prev.filter((p) => p.pincode !== pincode));
  }, []);

  const filtered = pincodes.filter((p) => {
    const matchSearch = !search || p.pincode.includes(search) || p.city?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || p.status === filterStatus;
    const matchState  = !filterState  || p.state?.toLowerCase().includes(filterState.toLowerCase());
    return matchSearch && matchStatus && matchState;
  });

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged       = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const stats = {
    total:          pincodes.length,
    serviceable:    pincodes.filter((p) => p.status === 'serviceable').length,
    nonServiceable: pincodes.filter((p) => p.status === 'non-serviceable').length,
    lastUpdated:    pincodes.length > 0
      ? new Date(Math.max(...pincodes.map((p) => new Date(p.added_on)))).toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric',
        })
      : '—',
  };

  return {
    pincodes: paged, allPincodes: pincodes, loading, setLoading,
    search, setSearch, filterStatus, setFilterStatus, filterState, setFilterState,
    page, setPage, totalPages, filtered,
    stats, addPincode, deletePincode,
  };
}
