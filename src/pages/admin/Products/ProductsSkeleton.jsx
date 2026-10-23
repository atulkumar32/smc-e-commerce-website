import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Skeleton,
  Stack,
  Grid,
} from '@mui/material';

/**
 * Skeleton for the Top Metric Overview KPI Cards
 */
export function ProductStatsSkeleton() {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {[0, 1, 2, 3].map((i) => (
        <Grid xs={12} sm={6} md={3} key={i}>
          <Paper
            elevation={0}
            sx={{
              p: 2.25,
              borderRadius: '12px',
              border: '1px solid #eef2f6',
              bgcolor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ width: '65%' }}>
              <Skeleton variant="text" width="60%" height={16} animation="wave" />
              <Skeleton variant="text" width="45%" height={32} sx={{ mt: 0.5 }} animation="wave" />
              <Skeleton variant="text" width="80%" height={14} sx={{ mt: 0.5 }} animation="wave" />
            </Box>
            <Skeleton
              variant="rounded"
              width={48}
              height={48}
              sx={{ borderRadius: '12px' }}
              animation="wave"
            />
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

/**
 * Skeleton for Search & Filter Bar
 */
export function ProductFiltersSkeleton() {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2.5,
        borderRadius: '12px',
        border: '1px solid #eef2f6',
        bgcolor: '#ffffff',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2,
        alignItems: { xs: 'stretch', md: 'center' },
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ display: 'flex', gap: 1.5, flex: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        <Skeleton variant="rounded" width={280} height={40} sx={{ borderRadius: '8px' }} animation="wave" />
        <Skeleton variant="rounded" width={140} height={40} sx={{ borderRadius: '8px' }} animation="wave" />
        <Skeleton variant="rounded" width={160} height={40} sx={{ borderRadius: '8px' }} animation="wave" />
      </Box>
      <Stack direction="row" spacing={1}>
        <Skeleton variant="rounded" width={80} height={32} sx={{ borderRadius: '16px' }} animation="wave" />
        <Skeleton variant="rounded" width={90} height={32} sx={{ borderRadius: '16px' }} animation="wave" />
        <Skeleton variant="rounded" width={80} height={32} sx={{ borderRadius: '16px' }} animation="wave" />
      </Stack>
    </Paper>
  );
}

/**
 * Skeleton for the Main Product Table rows
 */
export function ProductTableSkeleton({ rowCount = 8 }) {
  return (
    <TableContainer className="ap-page__table-scroll-container">
      <Table size="medium" sx={{ minWidth: 1120 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <TableCell sx={{ width: 44, py: 1.5 }}>
              <Skeleton variant="circular" width={22} height={22} animation="wave" />
            </TableCell>
            <TableCell sx={{ width: 40 }}>
              <Skeleton variant="text" width={16} animation="wave" />
            </TableCell>
            <TableCell sx={{ minWidth: 320 }}>
              <Skeleton variant="text" width={140} height={20} animation="wave" />
            </TableCell>
            <TableCell sx={{ minWidth: 130 }}>
              <Skeleton variant="text" width={75} height={20} animation="wave" />
            </TableCell>
            <TableCell sx={{ minWidth: 140 }}>
              <Skeleton variant="text" width={80} height={20} animation="wave" />
            </TableCell>
            <TableCell sx={{ minWidth: 110 }}>
              <Skeleton variant="text" width={65} height={20} animation="wave" />
            </TableCell>
            <TableCell sx={{ minWidth: 120 }}>
              <Skeleton variant="text" width={70} height={20} animation="wave" />
            </TableCell>
            <TableCell sx={{ minWidth: 110 }}>
              <Skeleton variant="text" width={65} height={20} animation="wave" />
            </TableCell>
            <TableCell align="right" sx={{ minWidth: 110 }}>
              <Skeleton variant="text" width={65} sx={{ ml: 'auto' }} height={20} animation="wave" />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: rowCount }).map((_, idx) => (
            <TableRow key={idx} sx={{ borderBottom: '1px solid #f1f5f9' }}>
              {/* 1. Expand arrow */}
              <TableCell sx={{ py: 1.75 }}>
                <Skeleton variant="circular" width={24} height={24} animation="wave" />
              </TableCell>

              {/* 2. Index # */}
              <TableCell>
                <Skeleton variant="text" width={18} height={18} animation="wave" />
              </TableCell>

              {/* 3. Product Thumb + Title + Meta */}
              <TableCell>
                <Stack direction="row" spacing={1.75} sx={{ alignItems: 'center' }}>
                  <Skeleton
                    variant="rounded"
                    width={54}
                    height={54}
                    sx={{ borderRadius: '12px', flexShrink: 0 }}
                    animation="wave"
                  />
                  <Box sx={{ width: '100%', minWidth: 180 }}>
                    <Skeleton variant="text" width="85%" height={19} animation="wave" />
                    <Stack direction="row" spacing={0.75} sx={{ mt: 0.5 }}>
                      <Skeleton variant="rounded" width={65} height={18} sx={{ borderRadius: '4px' }} animation="wave" />
                      <Skeleton variant="rounded" width={55} height={18} sx={{ borderRadius: '4px' }} animation="wave" />
                    </Stack>
                  </Box>
                </Stack>
              </TableCell>

              {/* 4. Price */}
              <TableCell>
                <Skeleton variant="text" width={70} height={22} animation="wave" />
                <Skeleton variant="text" width={45} height={14} animation="wave" />
              </TableCell>

              {/* 5. Inventory */}
              <TableCell>
                <Skeleton
                  variant="rounded"
                  width={80}
                  height={24}
                  sx={{ borderRadius: '12px' }}
                  animation="wave"
                />
              </TableCell>

              {/* 6. Status */}
              <TableCell>
                <Skeleton
                  variant="rounded"
                  width={75}
                  height={24}
                  sx={{ borderRadius: '12px' }}
                  animation="wave"
                />
              </TableCell>

              {/* 7. Variants count */}
              <TableCell>
                <Skeleton
                  variant="rounded"
                  width={70}
                  height={24}
                  sx={{ borderRadius: '8px' }}
                  animation="wave"
                />
              </TableCell>

              {/* 8. Date Added */}
              <TableCell>
                <Skeleton variant="text" width={75} height={16} animation="wave" />
              </TableCell>

              {/* 9. Actions */}
              <TableCell align="right">
                <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end', alignItems: 'center' }}>
                  <Skeleton variant="circular" width={28} height={28} animation="wave" />
                  <Skeleton variant="circular" width={28} height={28} animation="wave" />
                  <Skeleton variant="circular" width={28} height={28} animation="wave" />
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
    </Table>
  </TableContainer>
  );
}

/**
 * Complete Products Page Skeleton with Stats, Filters, and Table
 */
export default function ProductsPageSkeleton({ rowCount = 8 }) {
  return (
    <Box sx={{ width: '100%' }}>
      {/* Filters Skeleton */}
      <ProductFiltersSkeleton />

      {/* Table Skeleton inside Paper Container */}
      <Paper
        elevation={0}
        className="ap-page__table-card"
      >
        <ProductTableSkeleton rowCount={rowCount} />
      </Paper>
    </Box>
  );
}
