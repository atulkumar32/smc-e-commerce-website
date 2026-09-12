/**
 * BulkColorsUpload/index.jsx
 *
 * UI only — all logic in BulkUploadColorsData.jsx
 *
 * Layout:
 *   ┌─ Page header (title + "Upload Colors" button) ──┐
 *   │  Colour List table (search + pagination)         │
 *   │  Upload Modal (drop-zone → result → re-upload)   │
 *   └──────────────────────────────────────────────────┘
 */

import { useState } from 'react';
import {
  Box, Typography, Button, Paper, Stack,
  CircularProgress, Alert, Chip, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Tooltip, TextField, InputAdornment, Pagination,
} from '@mui/material';
import UploadFileIcon    from '@mui/icons-material/UploadFile';
import CheckCircleIcon   from '@mui/icons-material/CheckCircle';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import DownloadIcon      from '@mui/icons-material/Download';
import PaletteIcon       from '@mui/icons-material/Palette';
import RefreshIcon       from '@mui/icons-material/Refresh';
import SearchIcon        from '@mui/icons-material/Search';
import AddIcon           from '@mui/icons-material/Add';
import CloseIcon         from '@mui/icons-material/Close';

import {
  ACCEPTED_EXTENSIONS,
  COLUMN_DEFINITIONS,
  TABLE_COLUMNS,
  downloadColorsTemplate,
  useBulkColorsUpload,
  useUploadedColors,
} from './BulkUploadColorsData';

import './index.scss';

// ─────────────────────────────────────────────────────────────────────────────
//  Drop-zone
// ─────────────────────────────────────────────────────────────────────────────
function DropZone({
  file, dragging, fileInputRef,
  onInputChange, onDrop, onDragOver, onDragLeave,
  handleBrowseClick, handleRemove,
}) {
  return (
    <Paper
      elevation={0}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => !file && handleBrowseClick()}
      className={[
        'bcu-dropzone',
        dragging ? 'bcu-dropzone--drag'   : '',
        file      ? 'bcu-dropzone--filled' : '',
      ].filter(Boolean).join(' ')}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        style={{ display: 'none' }}
        onChange={onInputChange}
      />

      {file ? (
        <>
          <Box className="bcu-dropzone__icon bcu-dropzone__icon--ok">
            <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 28 }} />
          </Box>
          <Typography variant="subtitle1" fontWeight={700} color="#101828">
            {file.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {(file.size / 1024).toFixed(1)} KB
          </Typography>
          <Button size="small" color="error" variant="text"
            onClick={(e) => { e.stopPropagation(); handleRemove(); }}
            sx={{ textTransform: 'none', mt: 0.5 }}>
            Remove file
          </Button>
        </>
      ) : (
        <>
          <Box className="bcu-dropzone__icon bcu-dropzone__icon--empty">
            <UploadFileIcon sx={{ color: '#1565c0', fontSize: 28 }} />
          </Box>
          <Box textAlign="center">
            <Typography variant="subtitle1" fontWeight={700} color="#101828">
              Drag &amp; drop your file here
            </Typography>
            <Typography variant="body2" color="text.secondary">
              or{' '}
              <Typography component="span" variant="body2"
                color="primary" fontWeight={600} sx={{ cursor: 'pointer' }}>
                browse to choose
              </Typography>
            </Typography>
          </Box>
          <Chip label=".xlsx  •  .xls  •  .csv" size="small"
            sx={{ bgcolor: '#e0e7ff', color: '#3730a3', fontWeight: 600, fontSize: '0.7rem' }} />
        </>
      )}
    </Paper>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Result card (shown inside modal after upload)
// ─────────────────────────────────────────────────────────────────────────────
function ResultCard({ result, isSuccess, onUploadAnother }) {
  const { inserted, insertedList = [], failed, errors: errList, message } = result;

  return (
    <Paper elevation={0} sx={{
      border: `1px solid ${isSuccess ? '#a7f3d0' : '#fecaca'}`,
      borderRadius: '12px', overflow: 'hidden',
    }}>
      {/* Header */}
      <Box sx={{
        px: 2.5, py: 1.75,
        bgcolor: isSuccess ? '#f0fdf4' : '#fef2f2',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {isSuccess
            ? <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 22 }} />
            : <ErrorOutlinedIcon sx={{ color: '#dc2626', fontSize: 22 }} />}
          <Box>
            <Typography variant="subtitle2" fontWeight={700}
              color={isSuccess ? '#14532d' : '#7f1d1d'}>
              {message}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isSuccess
                ? `${inserted} colour${inserted !== 1 ? 's' : ''} inserted${failed > 0 ? `, ${failed} skipped` : ''}`
                : 'Fix the errors below and re-upload your file'}
            </Typography>
          </Box>
        </Box>

        {/* Re-upload — clears state so drop-zone reappears */}
        <Button size="small" variant="outlined"
          startIcon={<UploadFileIcon fontSize="small" />}
          onClick={onUploadAnother}
          sx={{
            borderColor: '#d0d5dd', color: '#344054',
            borderRadius: '8px', fontWeight: 600, textTransform: 'none',
            '&:hover': { borderColor: '#1565c0', color: '#1565c0', bgcolor: '#f0f7ff' },
          }}>
          Upload Another File
        </Button>
      </Box>

      {/* Summary chips */}
      {(inserted > 0 || failed > 0) && (
        <>
          <Divider />
          <Stack direction="row" gap={1.5} sx={{ px: 2.5, py: 1.5 }}>
            {inserted > 0 && (
              <Chip icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
                label={`${inserted} Inserted`} size="small"
                sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 700, border: '1px solid #86efac' }} />
            )}
            {failed > 0 && (
              <Chip icon={<ErrorOutlinedIcon sx={{ fontSize: '14px !important' }} />}
                label={`${failed} Failed`} size="small"
                sx={{ bgcolor: '#fee2e2', color: '#b91c1c', fontWeight: 700, border: '1px solid #fca5a5' }} />
            )}
          </Stack>
        </>
      )}

      {/* Inserted colours mini-grid */}
      {isSuccess && insertedList.length > 0 && (
        <>
          <Divider />
          <Box sx={{ px: 2.5, py: 1.75 }}>
            <Typography variant="caption" fontWeight={700} color="#374151"
              sx={{ display: 'block', mb: 1.25, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Colours Added
            </Typography>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))',
              gap: 0.85,
            }}>
              {insertedList.map((c, i) => (
                <Box key={i} sx={{
                  display: 'flex', alignItems: 'center', gap: 1,
                  px: 1.25, py: 0.8,
                  border: '1px solid #e5e7eb', borderRadius: '8px', bgcolor: '#fff',
                }}>
                  <Box sx={{
                    width: 20, height: 20, borderRadius: '4px',
                    bgcolor: c.code, border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0,
                  }} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" fontWeight={600} color="#101828"
                      sx={{ display: 'block', lineHeight: 1.3 }}>
                      {c.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary"
                      sx={{ fontFamily: 'monospace', fontSize: '0.68rem' }}>
                      {c.code}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </>
      )}

      {/* Row-level errors */}
      {errList.length > 0 && (
        <>
          <Divider />
          <Box sx={{ px: 2.5, py: 1.75 }}>
            <Typography variant="caption" fontWeight={700} color="#7f1d1d"
              sx={{ display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Row errors ({errList.length})
            </Typography>
            <Stack gap={0.6}>
              {errList.slice(0, 20).map((msg, i) => (
                <Box key={i} sx={{
                  display: 'flex', alignItems: 'flex-start', gap: 1,
                  px: 1.5, py: 0.85,
                  bgcolor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px',
                }}>
                  <ErrorOutlinedIcon sx={{ fontSize: 13, mt: '2px', flexShrink: 0, color: '#b91c1c' }} />
                  <Typography variant="caption" color="#7f1d1d">{String(msg)}</Typography>
                </Box>
              ))}
              {errList.length > 20 && (
                <Typography variant="caption" color="text.secondary" sx={{ pl: 0.5 }}>
                  …and {errList.length - 20} more errors
                </Typography>
              )}
            </Stack>
          </Box>
        </>
      )}
    </Paper>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Upload Modal
// ─────────────────────────────────────────────────────────────────────────────
function UploadModal({ open, onClose, onUploaded }) {
  const {
    fileInputRef, file, dragging,
    loading, result, error, setError,
    hasResult, isSuccess,
    onInputChange, onDrop, onDragOver, onDragLeave,
    handleBrowseClick, handleRemove,
    handleUpload, handleReset,
  } = useBulkColorsUpload({ onSuccess: onUploaded });

  const handleClose = () => { handleReset(); onClose(); };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: '16px' } }}>

      {/* Header */}
      <DialogTitle sx={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        px: 3, py: 2,
        borderBottom: '1px solid #e4e7ec', bgcolor: '#fafafa',
      }}>
        <Box>
          <Typography variant="subtitle1" fontWeight={700} color="#101828">
            Bulk Upload Colours
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Excel or CSV — columns: color_name, hex_code
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleClose}
          sx={{ color: '#667085', '&:hover': { bgcolor: '#f2f4f7' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2.5, bgcolor: '#fff' }}>

        {/* Column guide */}
        <Stack direction="row" flexWrap="wrap" gap={0.75} mb={2}>
          {COLUMN_DEFINITIONS.map((col) => (
            <Box key={col.label} sx={{
              display: 'flex', alignItems: 'center', gap: 0.65,
              px: 1.25, py: 0.55,
              bgcolor: '#f8faff', border: '1px solid #e4e7ec', borderRadius: '7px',
            }}>
              <PaletteIcon sx={{ fontSize: 12, color: '#1565c0' }} />
              <Typography variant="caption" fontWeight={700} color="#101828"
                sx={{ fontFamily: 'monospace', fontSize: '0.74rem' }}>
                {col.label}
                {col.required && (
                  <Typography component="span" sx={{ color: '#dc2626', ml: 0.25 }}>*</Typography>
                )}
              </Typography>
            </Box>
          ))}
        </Stack>

        {/* Drop-zone — hidden when result is shown */}
        {!hasResult && (
          <>
            <DropZone
              file={file} dragging={dragging} fileInputRef={fileInputRef}
              onInputChange={onInputChange} onDrop={onDrop}
              onDragOver={onDragOver} onDragLeave={onDragLeave}
              handleBrowseClick={handleBrowseClick} handleRemove={handleRemove}
            />
            {error && (
              <Alert severity="error" sx={{ mt: 1.5, borderRadius: '8px' }}
                onClose={() => setError('')}>
                {error}
              </Alert>
            )}
          </>
        )}

        {/* Result card replaces drop-zone */}
        {hasResult && (
          <ResultCard result={result} isSuccess={isSuccess} onUploadAnother={handleReset} />
        )}

      </DialogContent>

      <DialogActions sx={{
        px: 3, py: 1.75,
        borderTop: '1px solid #e4e7ec', bgcolor: '#fafafa', gap: 1,
      }}>
        {/* Template download — always visible */}
        <Button size="small" variant="outlined"
          startIcon={<DownloadIcon fontSize="small" />}
          onClick={downloadColorsTemplate}
          sx={{
            mr: 'auto',
            borderColor: '#d0d5dd', color: '#344054',
            borderRadius: '8px', fontWeight: 600, textTransform: 'none',
            '&:hover': { borderColor: '#1565c0', color: '#1565c0', bgcolor: '#f0f7ff' },
          }}>
          Template
        </Button>

        <Button onClick={handleClose} variant="outlined" size="small"
          sx={{
            borderColor: '#d0d5dd', color: '#344054',
            borderRadius: '8px', fontWeight: 600, textTransform: 'none',
          }}>
          {isSuccess ? 'Done' : 'Cancel'}
        </Button>

        {/* Upload button — hidden when result card is showing */}
        {!hasResult && (
          <Button variant="contained" size="small"
            onClick={handleUpload}
            disabled={!file || loading}
            startIcon={loading
              ? <CircularProgress size={14} color="inherit" />
              : <UploadFileIcon />}
            sx={{
              bgcolor: '#1565c0', '&:hover': { bgcolor: '#0d47a1' },
              borderRadius: '8px', fontWeight: 700, textTransform: 'none',
              boxShadow: 'none', px: 2.5,
            }}>
            {loading ? 'Uploading…' : 'Upload'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Colours table (search + pagination)
// ─────────────────────────────────────────────────────────────────────────────
function ColorsTable({
  colors, loading, error,
  search, onSearchChange,
  page, totalPages, total, PER_PAGE,
  onPageChange, onRefresh,
}) {
  const from = colors.length === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const to   = Math.min(page * PER_PAGE, total);

  return (
    <Paper elevation={0} sx={{
      border: '1px solid #e4e7ec', borderRadius: '12px', overflow: 'hidden',
    }}>
      {/* Header */}
      <Box sx={{
        px: 2.5, py: 1.75,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5,
        borderBottom: '1px solid #e4e7ec', bgcolor: '#fafafa',
      }}>
        <Typography variant="subtitle2" fontWeight={700} color="#101828">
          Colour List
          {!loading && (
            <Typography component="span" variant="caption" color="text.secondary" ml={1}>
              ({total} total)
            </Typography>
          )}
        </Typography>

        <Stack direction="row" gap={1} alignItems="center">
          <TextField size="small" placeholder="Search colours…"
            value={search} onChange={(e) => onSearchChange(e.target.value)}
            sx={{ width: 220 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: '#9ca3af' }} />
                </InputAdornment>
              ),
              sx: { borderRadius: '8px', fontSize: '0.83rem' },
            }} />
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={onRefresh} disabled={loading}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress size={26} />
        </Box>
      )}

      {/* Error */}
      {!loading && error && (
        <Box sx={{ px: 3, py: 3 }}>
          <Alert severity="error" sx={{ borderRadius: '8px' }}>{error}</Alert>
        </Box>
      )}

      {/* Empty */}
      {!loading && !error && colors.length === 0 && (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <PaletteIcon sx={{ fontSize: 38, color: '#d1d5db', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {search
              ? `No colours found for "${search}".`
              : 'No colours yet. Click "Upload Colors" to get started.'}
          </Typography>
        </Box>
      )}

      {/* Table */}
      {!loading && !error && colors.length > 0 && (
        <Box sx={{ overflowX: 'auto' }}>
          <table className="bcu-table">
            <thead>
              <tr>
                {TABLE_COLUMNS.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {colors.map((row, i) => (
                <tr key={row.id ?? i}>
                  <td className="bcu-table__num">{(page - 1) * PER_PAGE + i + 1}</td>

                  <td>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {row.code && (
                        <Box sx={{
                          width: 18, height: 18, borderRadius: '4px',
                          bgcolor: row.code,
                          border: '1px solid rgba(0,0,0,0.12)', flexShrink: 0,
                        }} />
                      )}
                      <Typography variant="body2" fontWeight={500}>
                        {row.name || '—'}
                      </Typography>
                    </Box>
                  </td>

                  <td>
                    <Typography variant="caption" sx={{
                      fontFamily: 'monospace', fontWeight: 700,
                      bgcolor: '#f3f4f6', px: 1, py: 0.4,
                      borderRadius: '5px', color: '#374151', fontSize: '0.78rem',
                    }}>
                      {row.code || '—'}
                    </Typography>
                  </td>

                  <td>
                    <Typography variant="caption" color="text.secondary">
                      {row.created_at
                        ? new Date(row.created_at).toLocaleString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          })
                        : '—'}
                    </Typography>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      )}

      {/* Pagination footer */}
      {!loading && totalPages > 0 && (
        <Box sx={{
          px: 2.5, py: 1.5,
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: 1,
          borderTop: '1px solid #e4e7ec', bgcolor: '#fafafa',
        }}>
          <Typography variant="caption" color="text.secondary">
            {colors.length === 0 ? 'No results' : `Showing ${from}–${to} of ${total}`}
          </Typography>
          {totalPages > 1 && (
            <Pagination count={totalPages} page={page}
              onChange={(_, p) => onPageChange(p)}
              size="small" color="primary" showFirstButton showLastButton />
          )}
        </Box>
      )}
    </Paper>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main page
// ─────────────────────────────────────────────────────────────────────────────
function BulkColorsUploadPage() {
  const [modalOpen, setModalOpen] = useState(false);

  const {
    colors, loading, error,
    search, setSearch,
    page, setPage,
    total, totalPages,
    refetch, PER_PAGE,
  } = useUploadedColors();

  const handleUploaded = () => {
    // keep modal open so user can see result card — modal closes via Done/Cancel
    refetch();
  };

  return (
    <Box className="bcu">

      {/* ── Page header ── */}
      <Box className="bcu__header">
        <Box>
          <Typography variant="h5" fontWeight={700} color="#101828">
            Colour Management
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.4}>
            View all uploaded colours and bulk-import new ones via Excel or CSV.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setModalOpen(true)}
          sx={{
            bgcolor: '#1565c0', '&:hover': { bgcolor: '#0d47a1' },
            borderRadius: '8px', fontWeight: 700,
            textTransform: 'none', px: 2.5, boxShadow: 'none',
          }}>
          Upload Colors
        </Button>
      </Box>

      {/* ── Colour list table ── */}
      <ColorsTable
        colors={colors} loading={loading} error={error}
        search={search} onSearchChange={setSearch}
        page={page} totalPages={totalPages} total={total} PER_PAGE={PER_PAGE}
        onPageChange={setPage} onRefresh={refetch}
      />

      {/* ── Upload modal ── */}
      <UploadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onUploaded={handleUploaded}
      />

    </Box>
  );
}

export default BulkColorsUploadPage;
