/**
 * BulkUploadPanel.jsx
 *
 * React functional component for CSV/Excel bulk pincode upload.
 * Logic → useBulkUpload (PinCodeData.jsx)
 * API   → bulkUploadPincodesAction (UploadloadPinCodesActions.js)
 *
 * Props:
 *   onSuccess  — fn() called after a successful upload (parent refreshes list)
 */

import { useRef } from 'react';
import { useBulkUpload } from '../PinCodeData';

function BulkUploadPanel({ onSuccess }) {
  const inputRef = useRef(null);
  const {
    file, handleFileChange,
    uploading, handleUpload,
    uploadResult, uploadError,
    reset,
  } = useBulkUpload(onSuccess);

  return (
    <div className="bulk-upload">
      {/* Header */}
      <div className="bulk-upload__header">
        <span className="bulk-upload__icon">📂</span>
        <div>
          <p className="bulk-upload__title">Bulk Upload Pincodes</p>
          <p className="bulk-upload__sub">Upload a CSV or Excel file to add multiple pincodes at once.</p>
        </div>
      </div>

      {/* Drop / select zone */}
      <div
        className="bulk-upload__zone"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const dropped = e.dataTransfer.files?.[0];
          if (dropped) handleFileChange({ target: { files: [dropped] } });
        }}
      >
        {file ? (
          <div className="bulk-upload__file-info">
            <span className="bulk-upload__file-name">📄 {file.name}</span>
            <span className="bulk-upload__file-size">
              ({(file.size / 1024).toFixed(1)} KB)
            </span>
            <button
              type="button"
              className="bulk-upload__remove"
              onClick={(e) => { e.stopPropagation(); reset(); }}
              aria-label="Remove file"
            >
              ✕
            </button>
          </div>
        ) : (
          <>
            <span className="bulk-upload__zone-icon">⬆️</span>
            <p className="bulk-upload__zone-text">
              <strong>Click to upload</strong> or drag &amp; drop
            </p>
            <p className="bulk-upload__zone-hint">CSV, XLS, XLSX (max 5 MB)</p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xls,.xlsx,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        hidden
        onChange={handleFileChange}
      />

      {/* Format hint */}
      <div className="bulk-upload__format">
        <strong>Required columns:</strong>{' '}
        pincode, state, city, status, delivery_charge, estimated_delivery_time, notes
      </div>

      {/* Error */}
      {uploadError && (
        <div className="bulk-upload__alert bulk-upload__alert--error">
          ❌ {uploadError}
        </div>
      )}

      {/* Success result */}
      {uploadResult && (
        <div className="bulk-upload__alert bulk-upload__alert--success">
          <strong>✅ {uploadResult.message}</strong>
          <ul className="bulk-upload__result-list">
            <li>Inserted: <strong>{uploadResult.inserted}</strong></li>
            <li>Failed:   <strong>{uploadResult.failed}</strong></li>
          </ul>
          {uploadResult.errors?.length > 0 && (
            <details className="bulk-upload__errors">
              <summary>{uploadResult.errors.length} row error(s) — click to expand</summary>
              <ul>
                {uploadResult.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </details>
          )}
        </div>
      )}

      {/* Upload button */}
      <button
        type="button"
        className={`bulk-upload__btn${uploading ? ' bulk-upload__btn--loading' : ''}`}
        onClick={handleUpload}
        disabled={!file || uploading}
      >
        {uploading ? '⏳ Uploading…' : '⬆️ Upload File'}
      </button>
    </div>
  );
}

export default BulkUploadPanel;
