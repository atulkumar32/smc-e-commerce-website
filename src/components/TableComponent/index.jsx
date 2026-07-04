import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from '@mui/material';

/**
 * TableComponent
 *
 * Props:
 *   columns           – [{ id, label, align?, render? }]
 *   rows              – data rows for the current page
 *   page              – 0-based current page (used for TablePagination)
 *   rowsPerPage       – rows per page
 *   onPageChange      – fn(event, page) — if omitted, pagination is hidden
 *   onRowsPerPageChange
 *   rowsPerPageOptions
 *   emptyMessage      – text shown when rows is empty
 *   getRowId          – fn(row) → unique key
 *   totalCount        – when provided, rows are already sliced by the caller;
 *                       disables internal slicing AND hides built-in TablePagination
 *                       (use AdminPagination externally instead)
 */
function TableComponent({
  columns,
  rows,
  page              = 0,
  rowsPerPage       = 10,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 25, 50],
  emptyMessage       = 'No data available',
  getRowId           = (row) => row.id,
  totalCount,          // if set → rows are pre-sliced, hide built-in pagination
}) {
  // When totalCount is given, the parent already sliced the rows
  const displayRows = totalCount !== undefined
    ? rows
    : rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Show the built-in MUI TablePagination only when:
  //   • onPageChange is provided  (caller wants it)
  //   • totalCount is NOT provided (rows aren't pre-sliced)
  const showBuiltInPagination = !!onPageChange && totalCount === undefined;

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              {columns.map((col) => (
                <TableCell key={col.id} align={col.align || 'left'} sx={{ fontWeight: 600 }}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {displayRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              displayRows.map((row) => (
                <TableRow key={getRowId(row)} hover>
                  {columns.map((col) => (
                    <TableCell key={col.id} align={col.align || 'left'}>
                      {col.render ? col.render(row) : row[col.id]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {showBuiltInPagination && (
        <TablePagination
          component="div"
          count={rows.length}
          page={page}
          onPageChange={onPageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={onRowsPerPageChange}
          rowsPerPageOptions={rowsPerPageOptions}
        />
      )}
    </Paper>
  );
}

export default TableComponent;
