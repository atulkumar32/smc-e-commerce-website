import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  IconButton,
  Chip,
  Stack,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  Collapse,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Tooltip,
  Grid,
  InputBase,
  MenuItem,
  Select,
  FormControl,
  CircularProgress,
  Divider,
} from '@mui/material';

// ── Icons ─────────────────────────────────────────────────────────────────────
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import CloseIcon from '@mui/icons-material/Close';

// ── Local Components & Helpers ────────────────────────────────────────────────
import ModalComponent from '../../../components/ModalComponent';
import AdminPagination from '../../../components/Paginations';
import AddNewProduct from './Components/AddNewProduct';
import AddNewVariant from './Components/AddNewVarient/index.jsx';
import ProductsPageSkeleton, { ProductTableSkeleton } from './ProductsSkeleton';
import {
  resolveImg,
  getDisplayId,
  getDisplayName,
  getCategoryName,
  getBestPrice,
  getBestPriceNumber,
  getMRP,
  getMRPNumber,
  getTotalStock,
  getStockStatus,
  parseJson,
  flag,
  getProductThumb,
  STATUS_TABS,
  SORT_OPTIONS,
} from './ProductData';

// ── Context & Actions ─────────────────────────────────────────────────────────
import { useAdmin } from '../../../context/AdminContext';
import { deleteProductAction } from '../../../Actions/ProductUploadAction';
import { deleteVariantAction, fetchVariantsAction } from '../../../Actions/ProductVariantAction';
import { resolveProductId } from './AllProductuploadFields';

import './style.scss';

// ── Click-to-copy Product ID Pill ─────────────────────────────────────────────
function CopyIdPill({ id }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!id || id === '—') return;
    navigator.clipboard.writeText(String(id));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Tooltip title={copied ? 'Copied to clipboard!' : 'Click to copy ID'} arrow placement="top">
      <span className="ap-page__id-pill" onClick={handleCopy} role="button" tabIndex={0}>
        {id}
        {copied ? (
          <CheckIcon sx={{ fontSize: 13, color: '#059669' }} />
        ) : (
          <ContentCopyIcon sx={{ fontSize: 12 }} />
        )}
      </span>
    </Tooltip>
  );
}

// ── Visual Stock Badge ────────────────────────────────────────────────────────
function StockBadge({ count }) {
  const status = getStockStatus(count);
  const pillClass =
    count <= 0
      ? 'ap-page__stock-pill ap-page__stock-pill--out'
      : count <= 10
      ? 'ap-page__stock-pill ap-page__stock-pill--low'
      : 'ap-page__stock-pill ap-page__stock-pill--in';

  return (
    <span className={pillClass}>
      <span className="dot" />
      {count} {status.label}
    </span>
  );
}

// ── Search & Filter Controls Bar ──────────────────────────────────────────────
function ProductFiltersBar({
  search,
  onSearchChange,
  activeStatus,
  onStatusChange,
  selectedCategory,
  onCategoryChange,
  categories,
  sortBy,
  onSortChange,
  statusCounts,
  onReset,
}) {
  const hasActiveFilters = search || activeStatus !== 'all' || selectedCategory !== 'all' || sortBy !== 'newest';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2.5,
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        bgcolor: '#ffffff',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
      }}
    >
      {/* Top Controls Row */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 1.5,
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: 'space-between',
          mb: 1.75,
        }}
      >
        {/* Search Input */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '9px',
            px: 1.5,
            py: 0.6,
            flex: { xs: 1, md: '0 1 380px' },
            transition: 'all 0.15s ease',
            '&:focus-within': { borderColor: '#2563eb', bgcolor: '#ffffff', boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)' },
          }}
        >
          <SearchIcon sx={{ color: '#94a3b8', fontSize: 19, mr: 1 }} />
          <InputBase
            placeholder="Search by product name, ID, brand, category…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            sx={{ fontSize: '0.84rem', width: '100%', color: '#0f172a' }}
          />
          {search && (
            <IconButton size="small" onClick={() => onSearchChange('')} sx={{ p: 0.25 }}>
              <ClearIcon sx={{ fontSize: 15 }} />
            </IconButton>
          )}
        </Box>

        {/* Dropdowns Row */}
        <Stack direction="row" spacing={1.25} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              displayEmpty
              sx={{ fontSize: '0.82rem', borderRadius: '8px', bgcolor: '#f8fafc', height: 38 }}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 170 }}>
            <Select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              sx={{ fontSize: '0.82rem', borderRadius: '8px', bgcolor: '#f8fafc', height: 38 }}
            >
              {SORT_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {hasActiveFilters && (
            <Button
              size="small"
              variant="text"
              color="inherit"
              onClick={onReset}
              startIcon={<CloseIcon sx={{ fontSize: 15 }} />}
              sx={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'none', height: 36, px: 1 }}
            >
              Reset Filters
            </Button>
          )}
        </Stack>
      </Box>

      {/* Segmented Status Tabs */}
      <Divider sx={{ my: 1.5, borderColor: '#f1f5f9' }} />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflowX: 'auto', pb: 0.25 }}>
        {STATUS_TABS.map((tab) => {
          const isSelected = activeStatus === tab.value;
          const count = statusCounts?.[tab.value] ?? 0;
          return (
            <Box
              key={tab.value}
              onClick={() => onStatusChange(tab.value)}
              className={`ap-page__segmented-tab ${isSelected ? 'ap-page__segmented-tab--active' : ''}`}
            >
              <span>{tab.label}</span>
              <Chip
                label={count}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  bgcolor: isSelected ? '#2563eb' : '#f1f5f9',
                  color: isSelected ? '#ffffff' : '#64748b',
                  cursor: 'pointer',
                }}
              />
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}

// ── Variant sub-table (inline, with cached API support) ───────────────────────
function VariantTable({ productId, variants, loading, onEdit, onDelete }) {
  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
        <CircularProgress size={20} />
        <Typography variant="body2" color="text.secondary">
          Fetching product variants…
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="ap-page__variant-drawer">
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.84rem' }}>
            Product Variants ({variants.length})
          </Typography>
          <Chip label={productId} size="small" sx={{ fontFamily: 'monospace', fontSize: '0.72rem', height: 20 }} />
        </Stack>
      </Stack>

      {variants.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            textAlign: 'center',
            bgcolor: '#ffffff',
            borderRadius: '10px',
            border: '1px dashed #cbd5e1',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No variants listed for this product.
          </Typography>
        </Paper>
      ) : (
        <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
          <TableContainer className="ap-page__table-scroll-container">
            <Table size="small" sx={{ bgcolor: '#ffffff', minWidth: 800 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  {['Preview', 'Variant ID', 'Color', 'Size', 'MRP', 'Selling Price', 'Stock', 'SKU', 'Status', 'Actions'].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#475569', py: 1.25 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {variants.map((v) => {
                  const imgs = Array.isArray(v.images) ? v.images : [];
                  const mainImg = imgs.find((i) => i.is_main) || imgs[0];
                  const rawPath = mainImg?.image_url || '';
                  const thumb = resolveImg(rawPath);
                  const isActive = v.status === '1' || v.status === 1 || v.status === 'active';

                  return (
                    <TableRow key={v.variant_id || v.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                      {/* Thumbnail */}
                      <TableCell sx={{ width: 44, px: 1 }}>
                        {thumb ? (
                          <Box
                            component="img"
                            src={thumb}
                            alt={v.color_name || 'Variant'}
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: '6px',
                              objectFit: 'cover',
                              border: '1px solid #e2e8f0',
                              display: 'block',
                            }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              if (e.currentTarget.nextSibling) {
                                e.currentTarget.nextSibling.style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '6px',
                            bgcolor: v.color_hex || '#f1f5f9',
                            border: '1px solid #e2e8f0',
                            display: thumb ? 'none' : 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.62rem',
                            color: '#64748b',
                          }}
                        >
                          {v.color_hex ? '' : 'No img'}
                        </Box>
                      </TableCell>

                      {/* ID */}
                      <TableCell sx={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 600 }}>
                        {v.variant_id || v.id || '—'}
                      </TableCell>

                      {/* Color Swatch & Name */}
                      <TableCell>
                        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                          {v.color_hex && (
                            <Box
                              sx={{
                                width: 14,
                                height: 14,
                                borderRadius: '50%',
                                bgcolor: v.color_hex,
                                border: '1px solid #cbd5e1',
                                flexShrink: 0,
                              }}
                            />
                          )}
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                            {v.color_name || '—'}
                          </Typography>
                        </Stack>
                      </TableCell>

                      {/* Size */}
                      <TableCell sx={{ fontSize: '0.75rem' }}>{v.size || '—'}</TableCell>

                      {/* MRP */}
                      <TableCell sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {Number(v.mrp) > 0 ? `₹${Number(v.mrp).toLocaleString('en-IN')}` : '—'}
                      </TableCell>

                      {/* Selling Price */}
                      <TableCell sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                        ₹{Number(v.selling_price || 0).toLocaleString('en-IN')}
                      </TableCell>

                      {/* Stock */}
                      <TableCell>
                        <StockBadge count={Number(v.stock ?? 0)} />
                      </TableCell>

                      {/* SKU */}
                      <TableCell sx={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#475569' }}>
                        {v.sku || '—'}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <span className={`ap-page__status-badge ap-page__status-badge--${isActive ? 'published' : 'draft'}`}>
                          <span className="status-dot" />
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Edit variant">
                            <IconButton
                              size="small"
                              onClick={() => onEdit(v)}
                              className="ap-page__action-btn ap-page__action-btn--edit"
                            >
                              <EditOutlinedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete variant">
                            <IconButton
                              size="small"
                              onClick={() => onDelete(v)}
                              className="ap-page__action-btn ap-page__action-btn--delete"
                            >
                              <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}

// ── Product Row ───────────────────────────────────────────────────────────────
function ProductRow({
  row,
  index,
  expanded,
  onExpand,
  onView,
  onEdit,
  onDelete,
  variants,
  variantsLoading,
  onEditVariant,
  onDeleteVariant,
}) {
  const variantCount = Array.isArray(row.variants) ? row.variants.length : 0;
  const thumb = getProductThumb(row);
  const totalStock = getTotalStock(row);
  const isPublished = row.status === 'published';
  const mrp = getMRP(row);
  const bestPrice = getBestPrice(row);
  const mrpNumber = getMRPNumber(row);
  const bestPriceNumber = getBestPriceNumber(row);
  const displayId = getDisplayId(row);
  const displayName = getDisplayName(row);

  // Calculate discount percentage
  const discountPct =
    mrpNumber > bestPriceNumber && mrpNumber > 0
      ? Math.round(((mrpNumber - bestPriceNumber) / mrpNumber) * 100)
      : 0;

  // Extract unique color swatches from variants
  const colors = useMemo(() => {
    if (!Array.isArray(row.variants)) return [];
    const map = new Map();
    for (const v of row.variants) {
      const hex = v.color_hex?.trim();
      const name = v.color_name?.trim();
      const key = hex || name;
      if (key && !map.has(key)) {
        map.set(key, { hex, name });
      }
    }
    return Array.from(map.values());
  }, [row.variants]);

  return (
    <React.Fragment>
      <TableRow
        hover
        className={`ap-page__table-row ${expanded ? 'ap-page__table-row--expanded' : ''}`}
        sx={{ borderBottom: expanded ? 'none' : '1px solid #f1f5f9' }}
      >
        {/* 1. Expand toggle */}
        <TableCell sx={{ width: 44, px: 1, py: 1.5 }}>
          <Tooltip title={expanded ? 'Collapse variants' : `View ${variantCount} variant(s)`}>
            <IconButton
              size="small"
              onClick={() => onExpand(row)}
              sx={{
                color: expanded ? '#2563eb' : '#64748b',
                bgcolor: expanded ? '#eff6ff' : 'transparent',
                borderRadius: '6px',
                p: 0.5,
                transition: 'all 0.15s ease',
                '&:hover': { bgcolor: '#f1f5f9', color: '#0f172a' },
              }}
            >
              {expanded ? (
                <KeyboardArrowUpIcon fontSize="small" />
              ) : (
                <KeyboardArrowDownIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </TableCell>

        {/* 2. Index # */}
        <TableCell sx={{ fontWeight: 600, color: '#94a3b8', width: 40, fontSize: '0.78rem' }}>
          {index + 1}
        </TableCell>

        {/* 3. Product Details (Hero column: Image + Title + ID + Category + Brand + Swatches) */}
        <TableCell sx={{ minWidth: 320 }}>
          <Stack direction="row" spacing={1.75} sx={{ alignItems: 'center' }}>
            <Box className="ap-page__product-thumb">
              {thumb ? (
                <Box
                  component="img"
                  src={thumb}
                  alt={displayName}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextSibling) {
                      e.currentTarget.nextSibling.style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  bgcolor: '#f1f5f9',
                  display: thumb ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                }}
              >
                🎒
              </Box>
            </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 700,
                  color: '#0f172a',
                  lineHeight: 1.35,
                  fontSize: '0.86rem',
                  mb: 0.4,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 240,
                  cursor: 'pointer',
                  transition: 'color 0.15s ease',
                  '&:hover': { color: '#2563eb' },
                }}
                onClick={() => onView(row)}
              >
                {displayName}
              </Typography>

              <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                <CopyIdPill id={displayId} />

                <Chip
                  label={getCategoryName(row)}
                  size="small"
                  sx={{
                    fontSize: '0.7rem',
                    height: 20,
                    fontWeight: 600,
                    bgcolor: '#f1f5f9',
                    color: '#475569',
                    borderRadius: '5px',
                  }}
                />

                {row.brand && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#64748b',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      bgcolor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      px: 0.75,
                      py: 0.1,
                      borderRadius: '4px',
                    }}
                  >
                    {row.brand}
                  </Typography>
                )}
              </Stack>

              {/* Color swatches preview */}
              {colors.length > 0 && (
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 0.6 }}>
                  {colors.slice(0, 5).map((c, i) => (
                    <Tooltip key={i} title={c.name || c.hex} arrow placement="top">
                      <span
                        className="ap-page__swatch-dot"
                        style={{ backgroundColor: c.hex || '#cbd5e1' }}
                      />
                    </Tooltip>
                  ))}
                  {colors.length > 5 && (
                    <Typography
                      variant="caption"
                      sx={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 700 }}
                    >
                      +{colors.length - 5}
                    </Typography>
                  )}
                </Stack>
              )}
            </Box>
          </Stack>
        </TableCell>

        {/* 4. Price & MRP with Discount badge */}
        <TableCell sx={{ minWidth: 130 }}>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem', lineHeight: 1.2 }}>
              {bestPrice}
            </Typography>
            {mrp && mrp !== bestPrice && (
              <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mt: 0.35 }}>
                <Typography
                  variant="caption"
                  sx={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.72rem' }}
                >
                  {mrp}
                </Typography>
                {discountPct > 0 && (
                  <span className="ap-page__discount-badge">
                    {discountPct}% OFF
                  </span>
                )}
              </Stack>
            )}
          </Box>
        </TableCell>

        {/* 5. Inventory / Total Stock */}
        <TableCell sx={{ minWidth: 140 }}>
          <StockBadge count={totalStock} />
        </TableCell>

        {/* 6. Status */}
        <TableCell sx={{ minWidth: 110 }}>
          <span className={`ap-page__status-badge ap-page__status-badge--${isPublished ? 'published' : 'draft'}`}>
            <span className="status-dot" />
            {isPublished ? 'Published' : 'Draft'}
          </span>
        </TableCell>

        {/* 7. Variants count interactive pill */}
        <TableCell sx={{ minWidth: 120 }}>
          <Tooltip title={variantCount > 0 ? (expanded ? 'Click to collapse variants' : 'Click to view variants') : 'No variants created'}>
            <Box
              onClick={() => variantCount > 0 && onExpand(row)}
              className={`ap-page__variant-pill ${variantCount > 0 ? 'ap-page__variant-pill--has-variants' : ''}`}
              sx={{ cursor: variantCount > 0 ? 'pointer' : 'default' }}
            >
              <span>{variantCount} {variantCount === 1 ? 'Var' : 'Vars'}</span>
              {variantCount > 0 && (
                expanded ? <KeyboardArrowUpIcon sx={{ fontSize: 15 }} /> : <KeyboardArrowDownIcon sx={{ fontSize: 15 }} />
              )}
            </Box>
          </Tooltip>
        </TableCell>

        {/* 8. Date Added */}
        <TableCell sx={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap', minWidth: 110 }}>
          {row.created_at
            ? new Date(row.created_at).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : '—'}
        </TableCell>

        {/* 9. Actions (View, Edit, Delete only) */}
        <TableCell align="right" sx={{ minWidth: 110 }}>
          <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end', alignItems: 'center' }}>
            <Tooltip title="View full details">
              <IconButton
                size="small"
                onClick={() => onView(row)}
                className="ap-page__action-btn ap-page__action-btn--view"
              >
                <VisibilityOutlinedIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit product">
              <IconButton
                size="small"
                onClick={() => onEdit(row)}
                className="ap-page__action-btn ap-page__action-btn--edit"
              >
                <EditOutlinedIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete product">
              <IconButton
                size="small"
                onClick={() => onDelete(row)}
                className="ap-page__action-btn ap-page__action-btn--delete"
              >
                <DeleteOutlinedIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </TableCell>
      </TableRow>

      {/* Expanded Variant Sub-Table */}
      <TableRow>
        <TableCell colSpan={9} sx={{ p: 0, border: 0 }}>
          <Collapse in={expanded} unmountOnExit timeout="auto">
            <VariantTable
              productId={displayId}
              variants={variants}
              loading={variantsLoading}
              onEdit={onEditVariant}
              onDelete={onDeleteVariant}
            />
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

// ── Detail helper row in ProductViewModal ─────────────────────────────────────
function DR({ label, value, xs = 6 }) {
  if (value == null || value === '' || value === '0' || value === 0) return null;
  return (
    <Grid xs={12} sm={xs}>
      <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.25, fontWeight: 500 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
        {String(value)}
      </Typography>
    </Grid>
  );
}

// ── Full Product View Modal ───────────────────────────────────────────────────
function ProductViewModal({ product: p, open, onClose }) {
  if (!p) return null;

  const features = parseJson(p.features);
  const selColors = parseJson(p.selected_colors);
  const variants = Array.isArray(p.variants) ? p.variants : [];
  const mrp = getMRP(p);
  const selling = getBestPrice(p);
  const hasMrp = mrp && mrp !== selling;
  const isPublished = p.status === 'published';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      PaperProps={{ sx: { borderRadius: '16px', maxHeight: '90vh' } }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e2e8f0',
          bgcolor: '#f8fafc',
          px: 3,
          py: 2,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
            {getDisplayName(p)}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', fontFamily: 'monospace' }}>
            {getDisplayId(p)} · {getCategoryName(p)}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Chip
            label={isPublished ? 'Published' : 'Draft'}
            size="small"
            color={isPublished ? 'success' : 'default'}
            sx={{ fontWeight: 600 }}
          />
          <IconButton size="small" onClick={onClose}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Box sx={{ overflowY: 'auto', px: 3, py: 2.5 }}>
        {/* KPI Strip */}
        <Paper
          elevation={0}
          sx={{
            bgcolor: '#f0f7ff',
            border: '1px solid #dbeafe',
            borderRadius: '10px',
            p: 2,
            mb: 3,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 3,
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
              Selling Price
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1d4ed8' }}>
              {selling}
            </Typography>
          </Box>
          {hasMrp && (
            <Box>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                MRP
              </Typography>
              <Typography variant="body2" sx={{ textDecoration: 'line-through', color: '#94a3b8' }}>
                {mrp}
              </Typography>
            </Box>
          )}
          <Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
              Total Stock
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
              {getTotalStock(p)} units
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
              Variants Count
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
              {variants.length}
            </Typography>
          </Box>
          {p.brand && (
            <Chip
              label={p.brand}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 600, bgcolor: '#ffffff' }}
            />
          )}
          {selColors?.map((c, i) => (
            <Tooltip key={i} title={c.label || ''}>
              <Box
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  bgcolor: c.hex,
                  border: '2px solid #fff',
                  boxShadow: '0 0 0 1px #cbd5e1',
                }}
              />
            </Tooltip>
          ))}
        </Paper>

        {/* Specifications */}
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b', mb: 1.5 }}>
          Specifications & Details
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <DR label="Product ID" value={p.product_id} />
          <DR label="Generic Name" value={p.generic_name} />
          <DR label="Brand" value={p.brand} />
          <DR label="Category" value={getCategoryName(p)} />
          <DR label="Material" value={p.material} />
          <DR label="Pattern" value={p.pattern} />
          <DR label="Character" value={p.character_name} />
          <DR label="Gender" value={p.gender} />
          <DR label="Class Type" value={p.class_type} />
          <DR label="Backpack Style" value={p.backpack_style} />
          <DR label="Capacity" value={p.capacity} />
          <DR label="Recommended Age" value={p.recommended_age} />
          <DR label="Size" value={p.size} />
          <DR label="Net Weight" value={p.net_weight} />
          <DR label="Country of Origin" value={p.country_of_origin} />
          <DR
            label="Actual Cost Price"
            value={p.actual_cost_price ? `₹${Number(p.actual_cost_price).toLocaleString('en-IN')}` : null}
          />
          <DR label="GST" value={p.gst ? `${p.gst}%` : null} />
          <DR label="Created At" value={p.created_at} />
        </Grid>

        {/* Visibility Flags */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>
            Web Visibility
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {[
              ['Live', flag(p.is_live)],
              ['New Arrival', flag(p.is_new_arrival)],
              ['Card Slider', flag(p.show_in_card_slider)],
              ['Published', flag(p.is_published)],
              ['Visible on Website', flag(p.is_visible_on_website)],
              ['Homepage Banner', flag(p.homepage_banner_enabled)],
            ].map(([lbl, active]) => (
              <Chip
                key={lbl}
                label={lbl}
                size="small"
                color={active ? 'success' : 'default'}
                variant={active ? 'filled' : 'outlined'}
                sx={{ fontSize: '0.72rem', fontWeight: 600 }}
              />
            ))}
          </Box>
        </Box>

        {/* Descriptions */}
        {(p.short_description || p.full_description) && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>
              Description
            </Typography>
            {p.short_description && (
              <Typography variant="body2" sx={{ color: '#475569', mb: 1, fontWeight: 500 }}>
                {p.short_description}
              </Typography>
            )}
            {p.full_description && p.full_description !== p.short_description && (
              <Typography variant="body2" sx={{ color: '#1e293b', whiteSpace: 'pre-line' }}>
                {p.full_description}
              </Typography>
            )}
          </Box>
        )}

        {/* Features */}
        {features?.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>
              Features & Highlights
            </Typography>
            {features.map((f, i) => (
              <Box key={i} sx={{ mb: 0.75 }}>
                {f.title && (
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    {f.title}
                  </Typography>
                )}
                {f.description && (
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    {f.description}
                  </Typography>
                )}
                {typeof f === 'string' && (
                  <Typography variant="body2" sx={{ color: '#334155' }}>
                    • {f}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        )}

        {/* Variants List */}
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>
          Associated Variants ({variants.length})
        </Typography>
        {variants.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No variants configured for this product.
          </Typography>
        ) : (
          <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  {['Variant ID', 'Color', 'Size', 'MRP', 'Selling', 'Stock', 'SKU', 'Status'].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#475569', py: 1 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {variants.map((v) => (
                  <TableRow key={v.variant_id || v.id} hover>
                    <TableCell sx={{ fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: 600 }}>
                      {v.variant_id || v.id}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                        {v.color_hex && (
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              bgcolor: v.color_hex,
                              border: '1px solid #cbd5e1',
                            }}
                          />
                        )}
                        <Typography sx={{ fontSize: '0.72rem' }}>{v.color_name || '—'}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.72rem' }}>{v.size || '—'}</TableCell>
                    <TableCell sx={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {Number(v.mrp) > 0 ? `₹${Number(v.mrp).toLocaleString('en-IN')}` : '—'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#2563eb' }}>
                      ₹{Number(v.selling_price || 0).toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.72rem', fontWeight: 600 }}>{v.stock ?? 0}</TableCell>
                    <TableCell sx={{ fontSize: '0.71rem', fontFamily: 'monospace' }}>{v.sku || '—'}</TableCell>
                    <TableCell>
                      <Chip
                        label={flag(v.status) || v.status === 'active' ? 'Active' : 'Inactive'}
                        size="small"
                        color={flag(v.status) || v.status === 'active' ? 'success' : 'default'}
                        sx={{ fontSize: '0.62rem', height: 18 }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Box>

      <Box
        sx={{
          px: 3,
          py: 1.75,
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'flex-end',
          bgcolor: '#f8fafc',
        }}
      >
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: '8px' }}>
          Close
        </Button>
      </Box>
    </Dialog>
  );
}

// ── Main Products Page Component ──────────────────────────────────────────────
function ProductsPage() {
  const navigate = useNavigate();
  const { products, productsLoading, upsertProduct, deleteProduct, refreshProducts } = useAdmin();

  // ── Local State ─────────────────────────────────────────────────────────────
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [refreshing, setRefreshing] = useState(false);
  const [apiError, setApiError] = useState(null);

  // ── Variant Caching State per Product ID ─────────────────────────────────────
  // Shape: { [productId]: { data: Array, loading: Boolean, error: String|null } }
  const [variantsCache, setVariantsCache] = useState({});
  const [expandedId, setExpandedId] = useState(null);

  // ── Modals & Action States ──────────────────────────────────────────────────
  const [editModal, setEditModal] = useState({ open: false, product: null });
  const [viewModal, setViewModal] = useState({ open: false, product: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, product: null, isDeleting: false });
  const [variantModal, setVariantModal] = useState({ open: false, variant: null });
  const [deleteVariantDialog, setDeleteVariantDialog] = useState({ open: false, variant: null, isDeleting: false });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnack = useCallback((msg, sev = 'success') => {
    setSnackbar({ open: true, message: msg, severity: sev });
  }, []);

  // ── Initial Mount Effect: Safe load without re-render loop ──────────────────
  const hasMounted = useRef(false);
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      refreshProducts().catch((err) => {
        setApiError(err?.message || 'Failed to fetch products');
      });
    }
  }, [refreshProducts]);

  // ── Compute Unique Categories for Dropdown ───────────────────────────────────
  const categoriesList = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      const cat = getCategoryName(p);
      if (cat && cat !== '—') set.add(cat);
    });
    return Array.from(set).sort();
  }, [products]);

  // ── Compute KPI Stats & Counts ──────────────────────────────────────────────
  const stats = useMemo(() => {
    let published = 0;
    let draft = 0;
    let lowOrOutStock = 0;
    let outOfStock = 0;
    let lowStock = 0;

    products.forEach((p) => {
      if (p.status === 'published') published++;
      else draft++;

      const stock = getTotalStock(p);
      if (stock <= 0) {
        outOfStock++;
        lowOrOutStock++;
      } else if (stock <= 10) {
        lowStock++;
        lowOrOutStock++;
      }
    });

    return {
      total: products.length,
      published,
      draft,
      lowOrOutStock,
      counts: {
        all: products.length,
        published,
        draft,
        low_stock: lowStock,
        out_of_stock: outOfStock,
      },
    };
  }, [products]);

  // ── Filter & Sort Products ──────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'published') {
        list = list.filter((p) => p.status === 'published');
      } else if (statusFilter === 'draft') {
        list = list.filter((p) => p.status !== 'published');
      } else if (statusFilter === 'low_stock') {
        list = list.filter((p) => {
          const s = getTotalStock(p);
          return s > 0 && s <= 10;
        });
      } else if (statusFilter === 'out_of_stock') {
        list = list.filter((p) => getTotalStock(p) <= 0);
      }
    }

    // Category filter
    if (categoryFilter !== 'all') {
      list = list.filter((p) => getCategoryName(p) === categoryFilter);
    }

    // Search query
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          getDisplayName(p).toLowerCase().includes(q) ||
          getDisplayId(p).toLowerCase().includes(q) ||
          getCategoryName(p).toLowerCase().includes(q) ||
          (p.brand || '').toLowerCase().includes(q)
      );
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      }
      if (sortBy === 'price_asc') {
        return getBestPriceNumber(a) - getBestPriceNumber(b);
      }
      if (sortBy === 'price_desc') {
        return getBestPriceNumber(b) - getBestPriceNumber(a);
      }
      if (sortBy === 'stock_asc') {
        return getTotalStock(a) - getTotalStock(b);
      }
      if (sortBy === 'stock_desc') {
        return getTotalStock(b) - getTotalStock(a);
      }
      if (sortBy === 'name_asc') {
        return getDisplayName(a).localeCompare(getDisplayName(b));
      }
      if (sortBy === 'name_desc') {
        return getDisplayName(b).localeCompare(getDisplayName(a));
      }
      return 0;
    });

    return list;
  }, [products, statusFilter, categoryFilter, search, sortBy]);

  // Pagination slice
  const pagedProducts = useMemo(() => {
    return filteredProducts.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  }, [filteredProducts, page, rowsPerPage]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setSortBy('newest');
    setPage(0);
  };

  // ── Expand row with isolated Variant Caching ─────────────────────────────────
  const handleExpand = useCallback(
    async (row) => {
      const id = getDisplayId(row);
      if (expandedId === id) {
        setExpandedId(null);
        return;
      }
      setExpandedId(id);

      // 1. If already cached, don't re-fetch
      if (variantsCache[id]?.data) {
        return;
      }

      // 2. If row already has embedded variants from API, cache them immediately
      const inlineVariants = Array.isArray(row.variants) ? row.variants : [];
      if (inlineVariants.length > 0) {
        setVariantsCache((prev) => ({
          ...prev,
          [id]: { data: inlineVariants, loading: false, error: null },
        }));
        return;
      }

      // 3. Otherwise fetch from API
      setVariantsCache((prev) => ({
        ...prev,
        [id]: { data: [], loading: true, error: null },
      }));

      try {
        const fresh = await fetchVariantsAction(id);
        const list = Array.isArray(fresh) ? fresh : [];
        setVariantsCache((prev) => ({
          ...prev,
          [id]: { data: list, loading: false, error: null },
        }));
      } catch (err) {
        setVariantsCache((prev) => ({
          ...prev,
          [id]: { data: [], loading: false, error: err?.message || 'Failed to load variants' },
        }));
      }
    },
    [expandedId, variantsCache]
  );

  // ── API Actions & Handlers ──────────────────────────────────────────────────
  const handleRefresh = async () => {
    setRefreshing(true);
    setApiError(null);
    try {
      await refreshProducts();
      setVariantsCache({});
      showSnack('Product catalog refreshed successfully');
    } catch (err) {
      setApiError(err?.message || 'Failed to refresh product catalog');
      showSnack('Refresh failed. Please check network connection.', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const handleProductSuccess = async (saved, status) => {
    upsertProduct(saved);
    setEditModal({ open: false, product: null });
    showSnack(status === 'draft' ? 'Product saved as draft' : 'Product published successfully');
    try {
      await refreshProducts();
    } catch {
      // silent
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.product) return;
    const pid = deleteDialog.product.id ?? resolveProductId(deleteDialog.product);
    setDeleteDialog((prev) => ({ ...prev, isDeleting: true }));

    try {
      await deleteProductAction(pid);
      deleteProduct(pid);
      showSnack('Product deleted successfully');
      setDeleteDialog({ open: false, product: null, isDeleting: false });
    } catch (err) {
      showSnack(err.message || 'Failed to delete product', 'error');
      setDeleteDialog((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const handleVariantSuccess = async (result) => {
    const apiOk = result?.success !== false;
    showSnack(
      result?.message || (apiOk ? 'Variant saved successfully' : 'Variant saved'),
      apiOk ? 'success' : 'warning'
    );
    setVariantModal({ open: false, variant: null });

    // Invalidate variant cache for the active product
    if (expandedId) {
      try {
        const fresh = await fetchVariantsAction(expandedId);
        setVariantsCache((prev) => ({
          ...prev,
          [expandedId]: { data: Array.isArray(fresh) ? fresh : [], loading: false, error: null },
        }));
      } catch {
        // silent
      }
    }

    try {
      await refreshProducts();
    } catch {
      // silent
    }
  };

  const handleConfirmDeleteVariant = async () => {
    if (!deleteVariantDialog.variant) return;
    const vid = deleteVariantDialog.variant.variant_id || deleteVariantDialog.variant.id;
    setDeleteVariantDialog((prev) => ({ ...prev, isDeleting: true }));

    try {
      await deleteVariantAction(vid, expandedId);

      // Optimistically update variantsCache
      if (expandedId) {
        setVariantsCache((prev) => {
          const current = prev[expandedId]?.data || [];
          return {
            ...prev,
            [expandedId]: {
              ...prev[expandedId],
              data: current.filter((x) => (x.variant_id || x.id) !== vid),
            },
          };
        });
      }

      showSnack('Variant deleted successfully');
      setDeleteVariantDialog({ open: false, variant: null, isDeleting: false });
    } catch (err) {
      showSnack(err.message || 'Failed to delete variant', 'error');
      setDeleteVariantDialog((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  const isInitialLoading = productsLoading && products.length === 0;

  return (
    <Box className="ap-page" sx={{ pb: 6 }}>
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Products
            </Typography>
            <Chip
              label={`${products.length} items`}
              size="small"
              sx={{ fontWeight: 700, bgcolor: '#eff6ff', color: '#2563eb', height: 24, fontSize: '0.74rem', border: '1px solid #bfdbfe' }}
            />
          </Stack>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            {productsLoading
              ? 'Loading catalog data…'
              : `Showing ${filteredProducts.length} of ${products.length} total products`}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Tooltip title="Refresh Catalog">
            <span>
              <IconButton
                size="medium"
                onClick={handleRefresh}
                disabled={refreshing || productsLoading}
                sx={{
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  bgcolor: '#ffffff',
                }}
              >
                <RefreshIcon
                  fontSize="small"
                  className={refreshing ? 'spin-icon' : ''}
                  sx={{ color: '#475569' }}
                />
              </IconButton>
            </span>
          </Tooltip>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setEditModal({ open: true, product: null })}
            className="ap-page__add-btn"
          >
            Add New Product
          </Button>
        </Stack>
      </Box>

      {/* ── API Error Notice with Retry ─────────────────────────────────────── */}
      {apiError && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: '10px' }}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
          onClose={() => setApiError(null)}
        >
          {apiError}
        </Alert>
      )}

      {/* ── Skeleton / Main Content ────────────────────────────────────────── */}
      {isInitialLoading ? (
        <ProductsPageSkeleton rowCount={rowsPerPage} />
      ) : (
        <React.Fragment>
          {/* Search, Status Tabs & Filters */}
          <ProductFiltersBar
            search={search}
            onSearchChange={(v) => {
              setSearch(v);
              setPage(0);
            }}
            activeStatus={statusFilter}
            onStatusChange={(st) => {
              setStatusFilter(st);
              setPage(0);
            }}
            selectedCategory={categoryFilter}
            onCategoryChange={(c) => {
              setCategoryFilter(c);
              setPage(0);
            }}
            categories={categoriesList}
            sortBy={sortBy}
            onSortChange={(s) => {
              setSortBy(s);
              setPage(0);
            }}
            statusCounts={stats.counts}
            onReset={handleResetFilters}
          />

          {/* Table Container with Horizontal X-Axis Scroller */}
          <Paper
            elevation={0}
            className="ap-page__table-card"
          >
            <TableContainer className="ap-page__table-scroll-container">
              <Table size="medium" sx={{ minWidth: 1120 }}>
                <TableHead>
                  <TableRow>
                    <TableCell className="ap-page__table-head-cell" sx={{ width: 44, py: 1.5 }} />
                    <TableCell className="ap-page__table-head-cell" sx={{ width: 40 }}>#</TableCell>
                    <TableCell className="ap-page__table-head-cell" sx={{ minWidth: 320 }}>
                      Product Details
                    </TableCell>
                    <TableCell className="ap-page__table-head-cell" sx={{ minWidth: 130 }}>
                      Price
                    </TableCell>
                    <TableCell className="ap-page__table-head-cell" sx={{ minWidth: 140 }}>
                      Inventory
                    </TableCell>
                    <TableCell className="ap-page__table-head-cell" sx={{ minWidth: 110 }}>
                      Status
                    </TableCell>
                    <TableCell className="ap-page__table-head-cell" sx={{ minWidth: 120 }}>
                      Variants
                    </TableCell>
                    <TableCell className="ap-page__table-head-cell" sx={{ minWidth: 110 }}>
                      Date Added
                    </TableCell>
                    <TableCell className="ap-page__table-head-cell" sx={{ minWidth: 110 }} align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {pagedProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                        <Box sx={{ maxWidth: 360, mx: 'auto', textAlign: 'center' }}>
                          <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>🔍</Typography>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>
                            No products found
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                            {search || statusFilter !== 'all' || categoryFilter !== 'all'
                              ? 'No products match the selected search criteria or filters.'
                              : 'No products added yet. Click Add New Product to get started.'}
                          </Typography>
                          {search || statusFilter !== 'all' || categoryFilter !== 'all' ? (
                            <Button size="small" variant="outlined" onClick={handleResetFilters}>
                              Clear All Filters
                            </Button>
                          ) : (
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<AddIcon />}
                              onClick={() => setEditModal({ open: true, product: null })}
                            >
                              Add New Product
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    pagedProducts.map((row, i) => {
                      const rowId = getDisplayId(row);
                      const isExpanded = expandedId === rowId;
                      const cachedVar = variantsCache[rowId];
                      const rowVariants = cachedVar?.data ?? row.variants ?? [];
                      const rowVarLoading = Boolean(cachedVar?.loading);

                      return (
                        <ProductRow
                          key={row.product_id || row.id || i}
                          row={row}
                          index={page * rowsPerPage + i}
                          expanded={isExpanded}
                          onExpand={handleExpand}
                          onView={(r) => setViewModal({ open: true, product: r })}
                          onEdit={(r) => setEditModal({ open: true, product: r })}
                          onDelete={(r) => setDeleteDialog({ open: true, product: r, isDeleting: false })}
                          variants={rowVariants}
                          variantsLoading={rowVarLoading}
                          onEditVariant={(v) => setVariantModal({ open: true, variant: v })}
                          onDeleteVariant={(v) =>
                            setDeleteVariantDialog({ open: true, variant: v, isDeleting: false })
                          }
                        />
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <AdminPagination
              page={page}
              totalRecords={filteredProducts.length}
              rowsPerPage={rowsPerPage}
              onPageChange={setPage}
              onRowsPerPageChange={(n) => {
                setRowsPerPage(n);
                setPage(0);
              }}
            />
          </Paper>
        </React.Fragment>
      )}

      {/* ── Modal: Add / Edit Product ───────────────────────────────────────── */}
      <ModalComponent
        open={editModal.open}
        onClose={() => setEditModal({ open: false, product: null })}
        title={editModal.product ? 'Edit Product' : 'Add New Product'}
        maxWidth="lg"
      >
        {editModal.open && (
          <AddNewProduct
            editingProduct={editModal.product}
            onSuccess={handleProductSuccess}
            onCancel={() => setEditModal({ open: false, product: null })}
          />
        )}
      </ModalComponent>

      {/* ── Modal: Full Product View ────────────────────────────────────────── */}
      <ProductViewModal
        product={viewModal.product}
        open={viewModal.open}
        onClose={() => setViewModal({ open: false, product: null })}
      />

      {/* ── Modal: Edit Variant ─────────────────────────────────────────────── */}
      {variantModal.open && variantModal.variant && (
        <ModalComponent
          open={variantModal.open}
          onClose={() => setVariantModal({ open: false, variant: null })}
          title="Edit Product Variant"
          maxWidth="lg"
        >
          <AddNewVariant
            productId={expandedId}
            editingVariant={variantModal.variant}
            onSuccess={handleVariantSuccess}
            onCancel={() => setVariantModal({ open: false, variant: null })}
          />
        </ModalComponent>
      )}

      {/* ── Dialog: Delete Product Confirmation ─────────────────────────────── */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => !deleteDialog.isDeleting && setDeleteDialog({ open: false, product: null, isDeleting: false })}
        PaperProps={{ sx: { borderRadius: '14px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#0f172a' }}>Delete Product</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#475569' }}>
            Are you sure you want to delete &quot;{getDisplayName(deleteDialog.product || {})}&quot;?
            This will permanently remove the product and its variants. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 1.5, px: 2.5 }}>
          <Button
            onClick={() => setDeleteDialog({ open: false, product: null, isDeleting: false })}
            disabled={deleteDialog.isDeleting}
            sx={{ borderRadius: '6px' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={deleteDialog.isDeleting}
            startIcon={deleteDialog.isDeleting ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{ borderRadius: '6px', fontWeight: 600 }}
          >
            {deleteDialog.isDeleting ? 'Deleting…' : 'Delete Product'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Dialog: Delete Variant Confirmation ─────────────────────────────── */}
      <Dialog
        open={deleteVariantDialog.open}
        onClose={() =>
          !deleteVariantDialog.isDeleting &&
          setDeleteVariantDialog({ open: false, variant: null, isDeleting: false })
        }
        PaperProps={{ sx: { borderRadius: '14px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#0f172a' }}>Delete Variant</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#475569' }}>
            Delete variant &quot;{deleteVariantDialog.variant?.variant_id || deleteVariantDialog.variant?.id || ''}&quot;?
            This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 1.5, px: 2.5 }}>
          <Button
            onClick={() => setDeleteVariantDialog({ open: false, variant: null, isDeleting: false })}
            disabled={deleteVariantDialog.isDeleting}
            sx={{ borderRadius: '6px' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDeleteVariant}
            disabled={deleteVariantDialog.isDeleting}
            startIcon={deleteVariantDialog.isDeleting ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{ borderRadius: '6px', fontWeight: 600 }}
          >
            {deleteVariantDialog.isDeleting ? 'Deleting…' : 'Delete Variant'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Feedback Snackbar ───────────────────────────────────────────────── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ borderRadius: '10px', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.12)' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ProductsPage;
