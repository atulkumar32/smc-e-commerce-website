import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, TextField, Stack, Chip,
  IconButton, Select, MenuItem, FormControl, InputLabel,
  RadioGroup, FormControlLabel, Radio, InputAdornment,
  Tooltip, Divider, CircularProgress, Alert, Pagination,
  Drawer,
} from '@mui/material';
import AddIcon            from '@mui/icons-material/Add';
import SearchIcon         from '@mui/icons-material/Search';
import EditOutlinedIcon   from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import RefreshIcon        from '@mui/icons-material/Refresh';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import CheckBoxOutlinedIcon   from '@mui/icons-material/CheckBoxOutlined';
import CancelOutlinedIcon     from '@mui/icons-material/CancelOutlined';
import AccessTimeIcon         from '@mui/icons-material/AccessTime';
import {
  usePincodes, lookupPincode, emptyPincodeForm,
  STATUS_OPTIONS, DELIVERY_TIME_OPTIONS,
} from './PinCodeData';
import './index.scss';

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color }) {
  return (
    <Paper elevation={0} className="pc-stat" sx={{ borderColor: color + '33' }}>
      <Box className="pc-stat__icon" sx={{ bgcolor: color + '18', color }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="h5" fontWeight={700} color={color}>{value}</Typography>
        {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
      </Box>
    </Paper>
  );
}

// ── Add / Edit Drawer ─────────────────────────────────────────────────────────
function PincodeDrawer({ open, editing, onClose, onSave }) {
  const [form,      setForm]      = useState(emptyPincodeForm);
  const [errors,    setErrors]    = useState({});
  const [looking,   setLooking]   = useState(false);
  const [lookupErr, setLookupErr] = useState('');

  useEffect(() => {
    if (open) {
      setForm(editing ? { ...emptyPincodeForm, ...editing } : emptyPincodeForm);
      setErrors({});
      setLookupErr('');
    }
  }, [open, editing]);

  const set = (f) => (e) => {
    const val = e.target.value;
    setForm((p) => ({ ...p, [f]: val }));
    setErrors((p) => { const n = { ...p }; delete n[f]; return n; });
    setLookupErr('');

    // Auto-lookup when pincode reaches 6 digits
    if (f === 'pincode' && val.length === 6) {
      setLooking(true);
      lookupPincode(val).then((info) => {
        if (info) {
          setForm((prev) => ({ ...prev, state: info.state, city: info.city }));
          setLookupErr('');
        } else {
          setLookupErr('Pincode not found. Please fill State & City manually.');
        }
      }).finally(() => setLooking(false));
    }
  };

  const validate = () => {
    const e = {};
    if (!form.pincode || !/^\d{6}$/.test(form.pincode)) e.pincode = 'Enter a valid 6 digit pincode';
    if (!form.state) e.state = 'Required';
    if (!form.city)  e.city  = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({ ...form });
    onClose();
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 400 }, p: 3 } }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
        <Typography variant="h6" fontWeight={700}>
          {editing ? 'Edit Pincode' : 'Add New Pincode'}
        </Typography>
        <IconButton size="small" onClick={onClose}>✕</IconButton>
      </Stack>
      <Typography variant="body2" color="text.secondary" mb={2.5}>
        Add a new pincode to manage whether we can deliver products to this location.
      </Typography>

      <Divider sx={{ mb: 2.5 }} />

      {lookupErr && <Alert severity="warning" sx={{ mb: 2 }}>{lookupErr}</Alert>}

      {/* Pincode field */}
      <Box mb={2}>
        <Typography variant="caption" fontWeight={600} display="block" mb={0.5}>
          Pincode *
        </Typography>
        <TextField fullWidth size="small" placeholder="Enter 6 digit pincode"
          value={form.pincode} onChange={set('pincode')}
          error={!!errors.pincode} helperText={errors.pincode || 'Enter a valid 6 digit pincode'}
          inputProps={{ maxLength: 6, inputMode: 'numeric' }}
          InputProps={{
            endAdornment: looking
              ? <InputAdornment position="end"><CircularProgress size={16} /></InputAdornment>
              : null,
          }}
        />
      </Box>

      {/* State + City */}
      <Stack direction="row" spacing={2} mb={2}>
        <Box flex={1}>
          <Typography variant="caption" fontWeight={600} display="block" mb={0.5}>State *</Typography>
          <TextField fullWidth size="small" placeholder="Select State"
            value={form.state} onChange={set('state')}
            error={!!errors.state} helperText={errors.state} />
        </Box>
        <Box flex={1}>
          <Typography variant="caption" fontWeight={600} display="block" mb={0.5}>City *</Typography>
          <TextField fullWidth size="small" placeholder="Select City"
            value={form.city} onChange={set('city')}
            error={!!errors.city} helperText={errors.city} />
        </Box>
      </Stack>

      {/* Status */}
      <Box mb={2}>
        <Typography variant="caption" fontWeight={600} display="block" mb={0.5}>Status *</Typography>
        <RadioGroup value={form.status} onChange={set('status')}>
          <FormControlLabel value="serviceable"
            control={<Radio size="small" color="success" />}
            label={
              <Box>
                <Typography variant="body2" fontWeight={500} color="success.dark">
                  Serviceable
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  We deliver to this pincode
                </Typography>
              </Box>
            } />
          <FormControlLabel value="non-serviceable"
            control={<Radio size="small" color="error" />}
            label={
              <Box>
                <Typography variant="body2" fontWeight={500} color="error.dark">
                  Non-Serviceable
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  We don't deliver to this pincode
                </Typography>
              </Box>
            } />
        </RadioGroup>
      </Box>

      {/* Delivery Charge */}
      <Box mb={2}>
        <Typography variant="caption" fontWeight={600} display="block" mb={0.5}>
          Delivery Charge (₹)
        </Typography>
        <TextField fullWidth size="small" type="number"
          placeholder="Enter delivery charge"
          value={form.delivery_charge} onChange={set('delivery_charge')}
          InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
          helperText="Leave 0 for free delivery" />
      </Box>

      {/* Delivery Time */}
      <Box mb={2}>
        <Typography variant="caption" fontWeight={600} display="block" mb={0.5}>
          Estimated Delivery Time
        </Typography>
        <FormControl fullWidth size="small">
          <Select value={form.delivery_time} onChange={set('delivery_time')}
            displayEmpty renderValue={(v) => v || 'Select delivery time'}>
            {DELIVERY_TIME_OPTIONS.map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography variant="caption" color="text.secondary">This will be shown to customers</Typography>
      </Box>

      {/* Notes */}
      <Box mb={3}>
        <Typography variant="caption" fontWeight={600} display="block" mb={0.5}>
          Notes (Optional)
        </Typography>
        <TextField fullWidth size="small" multiline rows={2}
          placeholder="Add any additional notes…"
          value={form.notes} onChange={set('notes')} />
      </Box>

      {/* Actions */}
      <Stack direction="row" spacing={1.5} justifyContent="flex-end">
        <Button onClick={onClose} variant="outlined" color="inherit"
          sx={{ borderColor: '#d0d5dd', color: '#344054' }}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave}
          sx={{ bgcolor: '#1565c0', '&:hover': { bgcolor: '#0d47a1' } }}>
          Save Pincode
        </Button>
      </Stack>
    </Drawer>
  );
}

// ── Status Chip ───────────────────────────────────────────────────────────────
function StatusChip({ status }) {
  const s = STATUS_OPTIONS.find((o) => o.value === status) || STATUS_OPTIONS[0];
  return (
    <Chip label={s.label} size="small"
      sx={{ bgcolor: s.bg, color: s.color, fontWeight: 600, fontSize: '0.7rem',
        border: `1px solid ${s.color}44` }} />
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
function AddNewPinCodePage() {
  const {
    pincodes, stats, loading,
    search, setSearch,
    filterStatus, setFilterStatus,
    filterState,  setFilterState,
    page, setPage, totalPages, filtered,
    addPincode, deletePincode,
  } = usePincodes();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing,    setEditing]    = useState(null);

  const openAdd  = ()      => { setEditing(null); setDrawerOpen(true); };
  const openEdit = (entry) => { setEditing(entry); setDrawerOpen(true); };

  const handleSave = (entry) => { addPincode(entry); };

  const handleReset = () => {
    setSearch(''); setFilterStatus(''); setFilterState(''); setPage(1);
  };

  return (
    <Box>
      {/* ── Header ── */}
      <Box sx={{ display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Pincode Management</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage serviceable pincodes for product delivery
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}
          sx={{ bgcolor: '#1565c0', '&:hover': { bgcolor: '#0d47a1' }, borderRadius: '8px' }}>
          Add New Pincode
        </Button>
      </Box>

      {/* ── Stat Cards ── */}
      <Stack direction="row" flexWrap="wrap" gap={2} mb={3}>
        <StatCard icon={<LocationOnOutlinedIcon />} label="Total Pincodes"
          value={stats.total.toLocaleString('en-IN')} sub="All added pincodes" color="#1565c0" />
        <StatCard icon={<CheckBoxOutlinedIcon />} label="Serviceable"
          value={stats.serviceable.toLocaleString('en-IN')} sub="Pincodes we deliver to" color="#16a34a" />
        <StatCard icon={<CancelOutlinedIcon />} label="Non-Serviceable"
          value={stats.nonServiceable.toLocaleString('en-IN')} sub="Pincodes we don't deliver to" color="#dc2626" />
        <StatCard icon={<AccessTimeIcon />} label="Last Updated"
          value={stats.lastUpdated} color="#7c3aed" />
      </Stack>

      {/* ── Filters ── */}
      <Paper elevation={0} sx={{ p: 1.5, mb: 2.5, border: '1px solid',
        borderColor: 'divider', borderRadius: '10px',
        display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
        <TextField size="small" placeholder="Search by pincode..."
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          sx={{ flex: '1 1 180px', minWidth: 160 }}
          InputProps={{ startAdornment: <InputAdornment position="start">
            <SearchIcon fontSize="small" color="action" /></InputAdornment> }} />

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            displayEmpty renderValue={(v) => v ? (v === 'serviceable' ? 'Serviceable' : 'Non-Serviceable') : 'Select Status'}>
            <MenuItem value="">All Status</MenuItem>
            {STATUS_OPTIONS.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
          </Select>
        </FormControl>

        <TextField size="small" placeholder="Filter by state…"
          value={filterState} onChange={(e) => { setFilterState(e.target.value); setPage(1); }}
          sx={{ minWidth: 140 }} />

        <Button size="small" startIcon={<RefreshIcon />} onClick={handleReset}
          sx={{ whiteSpace: 'nowrap' }}>
          Reset
        </Button>
      </Paper>

      {/* ── Table ── */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '10px', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <>
            <Box sx={{ overflowX: 'auto' }}>
              <table className="pc-table">
                <thead>
                  <tr>
                    {['#','Pincode','State','City','Status','Added On','Actions'].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pincodes.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                        {search || filterStatus || filterState
                          ? 'No pincodes match your filters.'
                          : 'No pincodes added yet. Click "Add New Pincode" to get started.'}
                      </td>
                    </tr>
                  ) : pincodes.map((entry, i) => (
                    <tr key={entry.pincode}>
                      <td className="pc-table__num">{((page - 1) * 10) + i + 1}</td>
                      <td className="pc-table__pin">{entry.pincode}</td>
                      <td>{entry.state || '—'}</td>
                      <td>{entry.city  || '—'}</td>
                      <td><StatusChip status={entry.status} /></td>
                      <td className="pc-table__date">
                        {entry.added_on
                          ? new Date(entry.added_on).toLocaleString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit',
                            })
                          : '—'}
                      </td>
                      <td>
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Edit">
                            <IconButton size="small" color="primary" onClick={() => openEdit(entry)}>
                              <EditOutlinedIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error"
                              onClick={() => deletePincode(entry.pincode)}>
                              <DeleteOutlinedIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>

            {/* Footer */}
            <Box sx={{ px: 2.5, py: 1.5, display: 'flex',
              alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 1, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2" color="text.secondary">
                Showing {pincodes.length === 0 ? 0 : (page - 1) * 10 + 1} to{' '}
                {Math.min(page * 10, filtered.length)} of {filtered.length} entries
              </Typography>
              {totalPages > 1 && (
                <Pagination count={totalPages} page={page}
                  onChange={(_, p) => setPage(p)} color="primary" size="small"
                  showFirstButton showLastButton />
              )}
            </Box>
          </>
        )}
      </Paper>

      {/* ── Add / Edit Drawer ── */}
      <PincodeDrawer
        open={drawerOpen}
        editing={editing}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSave}
      />
    </Box>
  );
}

export default AddNewPinCodePage;
