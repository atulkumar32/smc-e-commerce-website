import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Typography, IconButton, Grid
} from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';

export default function AddressModal({
  open,
  onClose,
  onSave,
  initialData = null,
  saving = false,
}) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
        city: initialData.city || '',
        state: initialData.state || '',
        pincode: initialData.pincode || '',
        isDefault: Boolean(initialData.isDefault),
      });
    } else {
      setForm({
        name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false,
      });
    }
    setErrors({});
  }, [initialData, open]);

  const setField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(form.phone.replace(/\s+/g, ''))) {
      errs.phone = 'Enter a valid 10-digit mobile number';
    }
    if (!form.address.trim()) errs.address = 'Street address is required';
    if (!form.city.trim()) errs.city = 'City is required';
    if (!form.state.trim()) errs.state = 'State is required';
    if (!form.pincode.trim()) errs.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(form.pincode.trim())) {
      errs.pincode = 'Enter a valid 6-digit postal pincode';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(form);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          p: 1,
          boxShadow: '0 24px 60px rgba(0, 31, 63, 0.25)',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <div className="ud-modal-icon-badge">
            <PlaceOutlinedIcon />
          </div>
          <div>
            <Typography variant="h6" fontWeight={800} color="#0f172a">
              {initialData ? 'Edit Shipping Address' : 'Add New Shipping Address'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Ensure accurate delivery for your bespoke bag orders
            </Typography>
          </div>
        </Box>

        <IconButton size="small" onClick={onClose} sx={{ color: '#94a3b8' }}>
          <CloseOutlinedIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit} noValidate>
        <DialogContent sx={{ pt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Recipient Full Name"
                placeholder="e.g. Pradip Sharma"
                value={form.name}
                onChange={setField('name')}
                error={Boolean(errors.name)}
                helperText={errors.name}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Mobile Phone"
                placeholder="10-digit phone"
                value={form.phone}
                onChange={setField('phone')}
                error={Boolean(errors.phone)}
                helperText={errors.phone}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                label="Street / Flat / House Address"
                placeholder="Street address, building, apartment number"
                value={form.address}
                onChange={setField('address')}
                error={Boolean(errors.address)}
                helperText={errors.address}
                required
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="City / Town"
                placeholder="City"
                value={form.city}
                onChange={setField('city')}
                error={Boolean(errors.city)}
                helperText={errors.city}
                required
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="State"
                placeholder="State"
                value={form.state}
                onChange={setField('state')}
                error={Boolean(errors.state)}
                helperText={errors.state}
                required
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="PIN Code"
                placeholder="6 digits"
                value={form.pincode}
                onChange={setField('pincode')}
                error={Boolean(errors.pincode)}
                helperText={errors.pincode}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, pt: 1, gap: 1 }}>
          <Button
            onClick={onClose}
            sx={{ textTransform: 'none', fontWeight: 600, color: '#64748b' }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            sx={{
              bgcolor: '#001F3F',
              color: '#ffffff',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: '10px',
              px: 3,
              '&:hover': { bgcolor: '#003366' },
            }}
          >
            {saving ? 'Saving...' : initialData ? 'Update Address' : 'Save Address'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

