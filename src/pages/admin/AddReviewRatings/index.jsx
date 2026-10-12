/**
 * AddReviewRatings/index.jsx
 *
 * Page shell — composes ReviewsTable + AddReviewModal with quick status filters
 * for Inactive/Pending customer reviews.
 */

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Typography, Button, Stack, Chip, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { useReviewsList } from './AddReviewData';
import ReviewsTable from './Components/Reviews';
import AddReviewModal from './Components/Rating';
import { isInactive } from '../../../Actions/ReviewNotificationActions';

import './index.scss';

export default function AddReviewRatingsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editRow, setEditRow] = useState(null); // null = create, row = edit
  const [searchParams, setSearchParams] = useSearchParams();

  const filterParam = searchParams.get('filter') || 'all';
  const [statusFilter, setStatusFilter] = useState(filterParam);

  const {
    reviews,
    loading,
    error,
    search,
    setSearch,
    page,
    setPage,
    total,
    totalPages,
    refetch,
  } = useReviewsList();

  useEffect(() => {
    const f = searchParams.get('filter') || 'all';
    setStatusFilter(f);
  }, [searchParams]);

  const handleFilterChange = (newFilter) => {
    setStatusFilter(newFilter);
    setPage(1);
    const nextParams = new URLSearchParams(searchParams);
    if (newFilter === 'all') {
      nextParams.delete('filter');
    } else {
      nextParams.set('filter', newFilter);
    }
    setSearchParams(nextParams);
  };

  // Compute pending and active counts
  const pendingCount = useMemo(() => {
    return reviews.filter(isInactive).length;
  }, [reviews]);

  const activeCount = useMemo(() => {
    return reviews.filter((r) => Number(r.status) === 1).length;
  }, [reviews]);

  // Filter reviews based on selected statusFilter
  const displayedReviews = useMemo(() => {
    if (statusFilter === 'pending') {
      return reviews.filter(isInactive);
    }
    if (statusFilter === 'active') {
      return reviews.filter((r) => Number(r.status) === 1);
    }
    return reviews;
  }, [reviews, statusFilter]);

  const openAdd = () => {
    setEditRow(null);
    setModalOpen(true);
  };
  const openEdit = (row) => {
    setEditRow(row);
    setModalOpen(true);
  };
  const onClose = () => {
    setModalOpen(false);
    setEditRow(null);
  };

  return (
    <Box className="arr">
      {/* ── Page header ── */}
      <Box className="arr__header">
        <Box>
          <Typography variant="h5" fontWeight={700} color="#101828">
            Reviews &amp; Ratings
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.4}>
            Manage product reviews and ratings submitted by customers.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openAdd}
          sx={{
            bgcolor: '#1565c0',
            '&:hover': { bgcolor: '#0d47a1' },
            borderRadius: '8px',
            fontWeight: 700,
            textTransform: 'none',
            px: 2.5,
            boxShadow: 'none',
          }}
        >
          Add Review
        </Button>
      </Box>

      {/* ── Pending Alert (if any inactive and unupdated reviews exist) ── */}
      {pendingCount > 0 && statusFilter === 'all' && (
        <Alert
          severity="warning"
          icon={<WarningAmberIcon fontSize="inherit" />}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => handleFilterChange('pending')}
              sx={{ fontWeight: 700, textTransform: 'none' }}
            >
              Filter Pending ({pendingCount})
            </Button>
          }
          sx={{ mb: 2, borderRadius: '10px' }}
        >
          You have <strong>{pendingCount} review(s)</strong> that are inactive and have not been updated yet.
        </Alert>
      )}

      {/* ── Filter Tabs ── */}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }} alignItems="center">
        <Chip
          label={`All Reviews (${total || reviews.length})`}
          onClick={() => handleFilterChange('all')}
          variant={statusFilter === 'all' ? 'filled' : 'outlined'}
          color={statusFilter === 'all' ? 'primary' : 'default'}
          sx={{ fontWeight: 700, cursor: 'pointer' }}
        />
        <Chip
          label={`Pending / Inactive (${pendingCount})`}
          onClick={() => handleFilterChange('pending')}
          variant={statusFilter === 'pending' ? 'filled' : 'outlined'}
          sx={{
            fontWeight: 700,
            cursor: 'pointer',
            bgcolor: statusFilter === 'pending' ? '#d97706' : 'transparent',
            color: statusFilter === 'pending' ? '#ffffff' : '#b45309',
            borderColor: '#f59e0b',
            '&:hover': {
              bgcolor: statusFilter === 'pending' ? '#b45309' : '#fef3c7',
            },
          }}
        />
        {/* <Chip
          label={`Active (${activeCount})`}
          onClick={() => handleFilterChange('active')}
          variant={statusFilter === 'active' ? 'filled' : 'outlined'}
          sx={{
            fontWeight: 700,
            cursor: 'pointer',
            bgcolor: statusFilter === 'active' ? '#16a34a' : 'transparent',
            color: statusFilter === 'active' ? '#ffffff' : '#15803d',
            borderColor: '#86efac',
            '&:hover': {
              bgcolor: statusFilter === 'active' ? '#15803d' : '#dcfce7',
            },
          }}
        /> */}
      </Stack>

      {/* ── Reviews table ── */}
      <ReviewsTable
        reviews={displayedReviews}
        loading={loading}
        error={error} 
        search={search}
        onSearchChange={setSearch}
        page={page}
        totalPages={statusFilter === 'all' ? totalPages : Math.ceil(displayedReviews.length / 10) || 1}
        total={statusFilter === 'all' ? total : displayedReviews.length}
        onPageChange={setPage}
        onRefresh={refetch}
        onEdit={openEdit}
      />

      {/* ── Add / Edit modal ── */}
      {modalOpen && (
        <AddReviewModal
          open={modalOpen}
          onClose={onClose}
          onSaved={refetch}
          editRow={editRow}
        />
      )}
    </Box>
  );
}
