/**
 * AddReviewRatings/index.jsx
 *
 * Page shell — composes ReviewsTable + AddReviewModal.
 */

import { useState }                        from 'react';
import { Box, Typography, Button }         from '@mui/material';
import AddIcon                             from '@mui/icons-material/Add';

import { useReviewsList }  from './AddReviewData';
import ReviewsTable        from './Components/Reviews';
import AddReviewModal      from './Components/Rating';

import './index.scss';

export default function AddReviewRatingsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editRow,   setEditRow]   = useState(null);  // null = create, row = edit

  const {
    reviews, loading, error,
    search, setSearch,
    page, setPage,
    total, totalPages,
    refetch,
  } = useReviewsList();

  const openAdd  = ()    => { setEditRow(null);  setModalOpen(true); };
  const openEdit = (row) => { setEditRow(row);   setModalOpen(true); };
  const onClose  = ()    => { setModalOpen(false); setEditRow(null); };

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

        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}
          sx={{
            bgcolor: '#1565c0', '&:hover': { bgcolor: '#0d47a1' },
            borderRadius: '8px', fontWeight: 700,
            textTransform: 'none', px: 2.5, boxShadow: 'none',
          }}>
          Add Review
        </Button>
      </Box>

      {/* ── Reviews table ── */}
      <ReviewsTable
        reviews={reviews} loading={loading} error={error}
        search={search} onSearchChange={setSearch}
        page={page} totalPages={totalPages} total={total}
        onPageChange={setPage} onRefresh={refetch}
        onEdit={openEdit}
      />

      {/* ── Add / Edit modal ── */}
      <AddReviewModal
        open={modalOpen}
        onClose={onClose}
        onSaved={refetch}
        editRow={editRow}
      />
    </Box>
  );
}
