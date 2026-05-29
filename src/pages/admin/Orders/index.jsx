import { useState } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import TableComponent from '../../../components/TableComponent';
import { useAdmin } from '../../../context/AdminContext';

const statusColor = {
  Pending: 'warning',
  Delivered: 'success',
};

function OrdersPage() {
  const { orders } = useAdmin();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const columns = [
    { id: 'id', label: 'Order ID' },
    { id: 'customerName', label: 'Customer Name' },
    {
      id: 'totalAmount',
      label: 'Total Amount',
      render: (row) => `$${row.totalAmount.toFixed(2)}`,
    },
    {
      id: 'status',
      label: 'Status',
      render: (row) => (
        <Chip
          label={row.status}
          size="small"
          color={statusColor[row.status] || 'default'}
        />
      ),
    },
    { id: 'date', label: 'Date' },
  ];

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        View and track all customer orders
      </Typography>
      <TableComponent
        columns={columns}
        rows={orders}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        getRowId={(row) => row.id}
      />
    </Box>
  );
}

export default OrdersPage;
