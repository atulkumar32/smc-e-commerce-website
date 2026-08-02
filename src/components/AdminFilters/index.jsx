import { useState } from 'react';
import {
  Box, TextField, InputAdornment, IconButton,
  Tooltip, Button,
} from '@mui/material';
import SearchIcon  from '@mui/icons-material/Search';
import ClearIcon   from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';

/**
 * AdminFilters
 *
 * Reusable search + date-range filter bar for admin tables.
 *
 * Props:
 *   onSearch(search, startDate, endDate) — called when Apply or Enter pressed
 *   searchPlaceholder  — placeholder text
 *   showDateFilter     — show/hide date range (default true)
 */
function AdminFilters({
  onSearch,
  searchPlaceholder = 'Search…',
  showDateFilter    = true,
}) {
  const [search,    setSearch]    = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate,   setEndDate]   = useState('');

  const handleApply = () => {
    if (onSearch) onSearch(search.trim(), startDate, endDate);
  };

  const handleClear = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
    if (onSearch) onSearch('', '', '');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleApply();
  };

  const hasFilters = search || startDate || endDate;

  return (
    <Box
      sx={{
        display:    'flex',
        flexWrap:   'wrap',
        gap:        1.5,
        alignItems: 'center',
        mb:         2,
        p:          1.5,
        bgcolor:    'background.paper',
        border:     '1px solid',
        borderColor:'divider',
        borderRadius: '8px',
      }}
    >
      {/* ── Search field ── */}
      <TextField
        size="small"
        placeholder={searchPlaceholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{ flex: '1 1 200px', minWidth: 160 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" color="action" />
            </InputAdornment>
          ),
        }}
      />

      {/* ── Date range ── */}
      {showDateFilter && (
        <>
          <TextField
            size="small"
            type="date"
            // label="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 155 }}
            inputProps={{ max: endDate || undefined }}
          />
          <TextField
            size="small"
            type="date"
            // label="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 155 }}
            inputProps={{ min: startDate || undefined }}
          />
        </>
      )}

      {/* ── Actions ── */}
      <Button
        variant="contained"
        size="small"
        startIcon={<FilterListIcon />}
        onClick={handleApply}
        sx={{ height: 38, borderRadius: '6px', px: 2 }}
      >
        Apply
      </Button>

      {hasFilters && (
        <Tooltip title="Clear all filters">
          <IconButton size="small" onClick={handleClear} color="default">
            <ClearIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}

export default AdminFilters;
