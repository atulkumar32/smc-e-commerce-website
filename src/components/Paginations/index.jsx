import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { Box, Typography, Select, MenuItem, FormControl } from '@mui/material';

/**
 * AdminPagination
 *
 * Props:
 *   page          – 0-based current page (MUI Pagination is 1-based, we convert)
 *   totalRecords  – total number of records
 *   rowsPerPage   – how many per page (default 10)
 *   onPageChange  – fn(newPage0Based)
 *   onRowsPerPageChange – fn(newLimit)
 */
function AdminPagination({
  page         = 0,
  totalRecords = 0,
  rowsPerPage  = 10,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 25, 50],
}) {
  const totalPages  = Math.max(1, Math.ceil(totalRecords / rowsPerPage));
  const currentPage = page + 1;                        // convert 0-based → 1-based
  const from        = totalRecords === 0 ? 0 : page * rowsPerPage + 1;
  const to          = Math.min(totalRecords, (page + 1) * rowsPerPage);

  const handleChange = (_, value) => {
    if (onPageChange) onPageChange(value - 1);         // convert 1-based → 0-based
  };

  return (
    <Box
      sx={{
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'space-between',
        flexWrap:        'wrap',
        gap:             1.5,
        px: 2, py: 1.5,
        borderTop:       '1px solid',
        borderColor:     'divider',
        bgcolor:         'background.paper',
      }}
    >
      {/* ── Record count ── */}
      <Typography variant="body2" color="text.secondary">
        {totalRecords === 0
          ? 'No records'
          : `Showing ${from}–${to} of ${totalRecords.toLocaleString()}`}
      </Typography>

      {/* ── Rows per page ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary" noWrap>
          Rows per page:
        </Typography>
        <FormControl size="small" variant="outlined" sx={{ minWidth: 70 }}>
          <Select
            value={rowsPerPage}
            onChange={(e) => {
              if (onRowsPerPageChange) onRowsPerPageChange(Number(e.target.value));
            }}
            sx={{ fontSize: '0.8rem', height: 32 }}
          >
            {rowsPerPageOptions.map((n) => (
              <MenuItem key={n} value={n} sx={{ fontSize: '0.8rem' }}>{n}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* ── Page navigation ── */}
      <Stack spacing={1}>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handleChange}
          color="primary"
          size="small"
          showFirstButton
          showLastButton
          siblingCount={1}
          disabled={totalRecords === 0}
        />
      </Stack>
    </Box>
  );
}

export default AdminPagination;
