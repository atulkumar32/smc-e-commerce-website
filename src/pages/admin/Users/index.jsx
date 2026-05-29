import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TableComponent from '../../../components/TableComponent';
import { fetchUsersAction } from '../../../Actions/UserAction';

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // MUI TablePagination uses 0-based page; API uses 1-based
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');

  // Debounce search so we don't fire on every keystroke
  const debounceRef = useRef(null);

  const loadUsers = useCallback(async (apiPage, perPage, searchTerm) => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchUsersAction({
        page: apiPage + 1, // convert 0-based → 1-based
        perPage,
        search: searchTerm,
      });
      setUsers(result.users);
      setTotalRecords(result.totalRecords);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload whenever page or rowsPerPage changes immediately
  useEffect(() => {
    loadUsers(page, rowsPerPage, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  // Debounce search input — reset to page 0 and reload
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(0);
      loadUsers(0, rowsPerPage, value);
    }, 400);
  };

  const handlePageChange = (_, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const columns = [
    {
      id: 'user_unique_id',
      label: 'User ID',
      render: (row) => (
        <Typography variant="body2" fontWeight={500} color="text.secondary">
          {row.user_unique_id}
        </Typography>
      ),
    },
    {
      id: 'name',
      label: 'Name',
      render: (row) => `${row.first_name} ${row.last_name}`,
    },
    { id: 'email', label: 'Email' },
    { id: 'phone_number', label: 'Phone' },
    {
      id: 'location',
      label: 'Location',
      render: (row) =>
        [row.city, row.state, row.country].filter(Boolean).join(', ') || '—',
    },
    {
      id: 'landmark_address',
      label: 'Address',
      render: (row) => row.landmark_address || '—',
    },
    {
      id: 'status',
      label: 'Status',
      render: (row) => (
        <Chip
          label={row.status === 1 ? 'Active' : 'Inactive'}
          size="small"
          color={row.status === 1 ? 'success' : 'default'}
          variant="outlined"
        />
      ),
    },
    {
      id: 'created_at',
      label: 'Joined',
      render: (row) => row.created_at?.split(' ')[0] || '—',
    },
  ];

  return (
    <Box>
      {/* Header row: count + search bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {totalRecords} registered customer{totalRecords !== 1 ? 's' : ''} on your platform
        </Typography>

        <TextField
          size="small"
          placeholder="Search by name or email…"
          value={search}
          onChange={handleSearchChange}
          sx={{ width: 280 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Error state */}
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* Table — overlay spinner while loading so layout doesn't jump */}
      <Box sx={{ position: 'relative' }}>
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(255,255,255,0.6)',
              zIndex: 1,
              borderRadius: 1,
            }}
          >
            <CircularProgress size={32} />
          </Box>
        )}

        <TableComponent
          columns={columns}
          rows={users}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalRecords}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          getRowId={(row) => row.id}
          emptyMessage={loading ? ' ' : 'No users found.'}
        />
      </Box>
    </Box>
  );
}

export default UsersPage;
