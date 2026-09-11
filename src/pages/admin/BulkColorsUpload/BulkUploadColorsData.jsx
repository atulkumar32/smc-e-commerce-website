/**
 * BulkUploadColorsData.jsx
 *
 * Data layer for Bulk Colors Upload page.
 *   - Constants     : COLUMN_DEFINITIONS, ACCEPTED_EXTENSIONS, TABLE_COLUMNS
 *   - Utilities     : excelToCSVBlob, downloadTemplate, normaliseErrors, normaliseUploadResult
 *   - Custom hooks  : useBulkColorsUpload, useUploadedColors
 *
 * All API calls → Actions/BulkUploadColorsActions.js
 * All URLs      → Config/UrlsConfig.js
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  bulkUploadColorsAction,
  fetchUploadedColorsAction,
} from '../../../Actions/BulkUploadColorsActions';

// ── Constants ─────────────────────────────────────────────────────────────────

export const ACCEPTED_EXTENSIONS = '.xlsx,.xls,.csv';
export const ACCEPTED_REGEX      = /\.(xlsx|xls|csv)$/i;

/** Instruction card columns */
export const COLUMN_DEFINITIONS = [
  { label: 'color_name',  desc: 'Name of the colour (e.g. Red, Navy Blue)', required: true  },
  { label: 'hex_code',    desc: 'Hex value including # (e.g. #FF0000)',      required: true  },
  { label: 'description', desc: 'Optional — short description',              required: false },
];

/** Columns rendered in the uploaded-colors table */
export const TABLE_COLUMNS = [
  { key: 'id',         label: '#'          },
  { key: 'name',       label: 'Color Name' },
  { key: 'code',       label: 'Hex Code'   },
  { key: 'created_at', label: 'Added On'   },
];

/** Sample rows for the downloadable template */
const TEMPLATE_ROWS = [
  ['Red',       '#FF0000', 'Bright red'],
  ['Navy Blue', '#001F5B', 'Classic navy'],
  ['Black',     '#000000', 'Standard black'],
  ['Sky Blue',  '#87CEEB', 'Light sky blue'],
  ['Olive',     '#808000', 'Earthy olive tone'],
];

// ── Utility: Excel / CSV → CSV Blob ──────────────────────────────────────────
export function excelToCSVBlob(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data     = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet    = workbook.Sheets[workbook.SheetNames[0]];
        const csv      = XLSX.utils.sheet_to_csv(sheet);
        resolve(new Blob([csv], { type: 'text/csv' }));
      } catch (err) {
        reject(new Error('Failed to read Excel file: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsArrayBuffer(file);
  });
}

// ── Utility: Download sample template ────────────────────────────────────────
export function downloadColorsTemplate() {
  const header = COLUMN_DEFINITIONS.map((c) => c.label);
  const ws     = XLSX.utils.aoa_to_sheet([header, ...TEMPLATE_ROWS]);
  ws['!cols']  = [{ wch: 18 }, { wch: 14 }, { wch: 30 }];
  const wb     = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Colors');
  XLSX.writeFile(wb, 'colors_template.xlsx');
}

// ── Utility: Normalise errors array ──────────────────────────────────────────
/**
 * The API returns errors as either:
 *   - string[]  → ["msg1", "msg2"]
 *   - object[]  → [{"Color code": "msg1"}, {"row": "msg2"}]
 *
 * This always returns string[].
 */
export function normaliseErrors(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    if (typeof item === 'string') return item;
    if (typeof item === 'object' && item !== null) {
      // Join all values of the object into one readable string
      return Object.values(item).join(' — ');
    }
    return String(item);
  });
}

// ── Utility: Normalise API upload response ────────────────────────────────────
export function normaliseUploadResult(data) {
  return {
    inserted: Number(data.inserted      ?? data.success_count ?? data.success ?? 0),
    failed:   Number(data.failed        ?? data.fail_count    ?? 0),
    errors:   normaliseErrors(data.errors),
    message:  data.message || 'Upload complete',
    // treat as visual success only when HTTP was ok AND inserted > 0
    status:   data.status !== false && Number(data.inserted ?? data.success_count ?? data.success ?? 0) > 0,
  };
}

// ── Custom hook: useUploadedColors ────────────────────────────────────────────
export function useUploadedColors() {
  const [colors,  setColors]  = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const list = await fetchUploadedColorsAction();
      setColors(list);
    } catch (err) {
      console.error('[useUploadedColors]', err.message);
      setError(err.message || 'Failed to load colours');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { colors, loading, error, refetch: fetch };
}

// ── Custom hook: useBulkColorsUpload ─────────────────────────────────────────
export function useBulkColorsUpload({ onSuccess } = {}) {
  const fileInputRef            = useRef(null);
  const [file,     setFile]     = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [error,    setError]    = useState('');

  const acceptFile = (f) => {
    if (!f) return;
    if (!ACCEPTED_REGEX.test(f.name)) {
      setError('Only .xlsx, .xls, or .csv files are supported.');
      return;
    }
    setFile(f);
    setResult(null);
    setError('');
  };

  const onInputChange  = (e)  => acceptFile(e.target.files?.[0]);
  const onDrop         = (e)  => { e.preventDefault(); setDragging(false); acceptFile(e.dataTransfer.files?.[0]); };
  const onDragOver     = (e)  => { e.preventDefault(); setDragging(true); };
  const onDragLeave    = ()   => setDragging(false);
  const handleBrowseClick = () => fileInputRef.current?.click();

  const handleRemove = () => {
    setFile(null); setResult(null); setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    setError('');

    try {
      let uploadFile = file;
      if (/\.(xlsx|xls)$/i.test(file.name)) {
        const csvBlob = await excelToCSVBlob(file);
        uploadFile = new File([csvBlob], 'colors.csv', { type: 'text/csv' });
      }
      const raw  = await bulkUploadColorsAction(uploadFile);
      const norm = normaliseUploadResult(raw);
      setResult(norm);
      if (norm.status) onSuccess?.();
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null); setResult(null); setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const hasResult = result !== null;
  const isSuccess = hasResult && result.status === true;

  return {
    fileInputRef,
    file, dragging,
    loading, result, error, setError,
    hasResult, isSuccess,
    onInputChange, onDrop, onDragOver, onDragLeave,
    handleBrowseClick, handleRemove,
    handleUpload, handleReset,
  };
}
