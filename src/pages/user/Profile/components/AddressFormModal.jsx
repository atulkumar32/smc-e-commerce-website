// Modal form for adding a new shipping address — fields match SaveUserAddress.php
import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Typography, IconButton, Grid,
  FormControlLabel, Checkbox, InputAdornment, Tooltip,
} from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import LocationCityOutlinedIcon from '@mui/icons-material/LocationCityOutlined';

const ADDRESS_TYPES = [
  { value: 'home', label: 'Home', icon: <HomeOutlinedIcon sx={{ fontSize: 16 }} /> },
  { value: 'work', label: 'Work', icon: <WorkOutlineOutlinedIcon sx={{ fontSize: 16 }} /> },
  { value: 'other', label: 'Other', icon: <LocationCityOutlinedIcon sx={{ fontSize: 16 }} /> },
];

const EMPTY_FORM = {
  full_name: '',
  user_email: '',
  phone: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
  address_type: 'home',
  is_default: false,
};

export default function AddressFormModal({ open, onClose, onSave, autoFill = {}, initialData = null, saving = false }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const isEditing = Boolean(initialData);

  // When editing, identity fields are NOT locked — user can change them per-address
  const locked = isEditing
    ? { full_name: false, phone: false, user_email: false }
    : {
        full_name: Boolean(autoFill.full_name),
        phone: Boolean(autoFill.phone),
        user_email: Boolean(autoFill.user_email),
      };

  useEffect(() => {
    if (open) {
      if (initialData) {
        // ── Edit mode: pre-fill ALL fields from the existing address ──
        setForm({
          full_name: initialData.full_name || '',
          user_email: initialData.user_email || initialData.email || '',
          phone: initialData.phone || '',
          address_line1: initialData.address_line1 || '',
          address_line2: initialData.address_line2 || '',
          city: initialData.city || '',
          state: initialData.state || '',
          pincode: initialData.pincode || '',
          country: initialData.country || 'India',
          address_type: initialData.address_type || 'home',
          is_default: Boolean(initialData.is_default),
        });
      } else {
        // ── Add mode: pre-fill identity fields from localStorage ──
        setForm({
          ...EMPTY_FORM,
          full_name: autoFill.full_name || '',
          user_email: autoFill.user_email || '',
          phone: autoFill.phone || '',
        });
      }
      setErrors({});
    }
  }, [open, initialData, autoFill.full_name, autoFill.user_email, autoFill.phone]);

  const lockedAdornment = (
    <InputAdornment position="end">
      <Tooltip title="Auto-filled from your profile" arrow>
        <LockOutlinedIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
      </Tooltip>
    </InputAdornment>
  );

  const setField = (field) => (e) => {
    const value = field === 'is_default' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleTypeSelect = (val) => {
    setForm((prev) => ({ ...prev, address_type: val }));
  };

  const validate = () => {
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = 'Full name is required';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(form.phone.replace(/\s+/g, ''))) {
      errs.phone = 'Enter a valid 10-digit mobile number';
    }
    if (form.user_email && !/^\S+@\S+\.\S+$/.test(form.user_email.trim())) {
      errs.user_email = 'Enter a valid email address';
    }
    if (!form.address_line1.trim()) errs.address_line1 = 'Address line 1 is required';
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
      className="profile-address-dialog"
      PaperProps={{
        sx: {
          borderRadius: '20px',
          boxShadow: '0 24px 60px rgba(0, 31, 63, 0.22)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 2.5, sm: 3 },
          pt: 2.5,
          pb: 2,
          borderBottom: '1px solid #f1f5f9',
          bgcolor: '#fafafa',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #001F3F 0%, #003366 100%)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#D4AF37',
              boxShadow: '0 4px 12px rgba(0, 31, 63, 0.15)',
            }}
          >
            <PlaceOutlinedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800} color="#001F3F" sx={{ fontSize: '1.05rem', lineHeight: 1.2 }}>
              {isEditing ? 'Edit Shipping Address' : 'Add Shipping Address'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.78rem' }}>
              {isEditing ? 'Update your saved delivery details' : 'Saved to your account for faster, one-click checkout'}
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: '#94a3b8', '&:hover': { color: '#0f172a', bgcolor: 'rgba(0,0,0,0.04)' } }}>
          <CloseOutlinedIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit} noValidate>
        <DialogContent sx={{ px: { xs: 2.5, sm: 3 }, py: 2.5 }}>
          <Grid container spacing={2}>
            {/* Recipient Name */}
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" fontWeight={700} color="#334155" sx={{ display: 'block', mb: 0.6, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Recipient Name *
              </Typography>
              <TextField
                fullWidth size="small" placeholder="Full Name"
                value={form.full_name} onChange={setField('full_name')}
                error={Boolean(errors.full_name)}
                helperText={errors.full_name || (locked.full_name ? 'Auto-filled from account' : '')}
                required
                InputProps={{ readOnly: locked.full_name, endAdornment: locked.full_name ? lockedAdornment : undefined }}
                sx={{ '& .MuiInputBase-root': { borderRadius: '10px' } }}
              />
            </Grid>

            {/* Mobile Phone */}
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" fontWeight={700} color="#334155" sx={{ display: 'block', mb: 0.6, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Mobile Phone *
              </Typography>
              <TextField
                fullWidth size="small" placeholder="10-digit number"
                value={form.phone} onChange={setField('phone')}
                error={Boolean(errors.phone)}
                helperText={errors.phone || (locked.phone ? 'Auto-filled from account' : '')}
                required
                InputProps={{ readOnly: locked.phone, endAdornment: locked.phone ? lockedAdornment : undefined }}
                sx={{ '& .MuiInputBase-root': { borderRadius: '10px' } }}
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12}>
              <Typography variant="caption" fontWeight={700} color="#334155" sx={{ display: 'block', mb: 0.6, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Email Address
              </Typography>
              <TextField
                fullWidth size="small" type="email" placeholder="your@email.com"
                value={form.user_email} onChange={setField('user_email')}
                error={Boolean(errors.user_email)}
                helperText={errors.user_email || (locked.user_email ? 'Auto-filled from account' : '')}
                InputProps={{ readOnly: locked.user_email, endAdornment: locked.user_email ? lockedAdornment : undefined }}
                sx={{ '& .MuiInputBase-root': { borderRadius: '10px' } }}
              />
            </Grid>

            {/* Address Line 1 */}
            <Grid item xs={12}>
              <Typography variant="caption" fontWeight={700} color="#334155" sx={{ display: 'block', mb: 0.6, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Flat / House No. / Building / Street *
              </Typography>
              <TextField
                fullWidth size="small" placeholder="e.g. Flat 402, Royal Residency, MG Road"
                value={form.address_line1} onChange={setField('address_line1')}
                error={Boolean(errors.address_line1)} helperText={errors.address_line1} required
                sx={{ '& .MuiInputBase-root': { borderRadius: '10px' } }}
              />
            </Grid>

            {/* Address Line 2 */}
            <Grid item xs={12}>
              <Typography variant="caption" fontWeight={700} color="#334155" sx={{ display: 'block', mb: 0.6, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Landmark / Area (Optional)
              </Typography>
              <TextField
                fullWidth size="small" placeholder="e.g. Near City Mall"
                value={form.address_line2} onChange={setField('address_line2')}
                sx={{ '& .MuiInputBase-root': { borderRadius: '10px' } }}
              />
            </Grid>

            {/* City */}
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" fontWeight={700} color="#334155" sx={{ display: 'block', mb: 0.6, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                City *
              </Typography>
              <TextField
                fullWidth size="small" placeholder="City"
                value={form.city} onChange={setField('city')}
                error={Boolean(errors.city)} helperText={errors.city} required
                sx={{ '& .MuiInputBase-root': { borderRadius: '10px' } }}
              />
            </Grid>

            {/* State */}
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" fontWeight={700} color="#334155" sx={{ display: 'block', mb: 0.6, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                State *
              </Typography>
              <TextField
                fullWidth size="small" placeholder="State"
                value={form.state} onChange={setField('state')}
                error={Boolean(errors.state)} helperText={errors.state} required
                sx={{ '& .MuiInputBase-root': { borderRadius: '10px' } }}
              />
            </Grid>

            {/* Pincode */}
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" fontWeight={700} color="#334155" sx={{ display: 'block', mb: 0.6, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                PIN Code *
              </Typography>
              <TextField
                fullWidth size="small" placeholder="6 Digits"
                value={form.pincode} onChange={setField('pincode')}
                error={Boolean(errors.pincode)} helperText={errors.pincode} required
                sx={{ '& .MuiInputBase-root': { borderRadius: '10px' } }}
              />
            </Grid>

            {/* Address Type Selector */}
            <Grid item xs={12}>
              <Typography variant="caption" fontWeight={700} color="#334155" sx={{ display: 'block', mb: 1, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Address Type
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                {ADDRESS_TYPES.map((t) => {
                  const isSel = form.address_type === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => handleTypeSelect(t.value)}
                      className={`modal-type-btn ${isSel ? 'is-active' : ''}`}
                    >
                      {t.icon}
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </Box>
            </Grid>

            {/* Set as Default */}
            <Grid item xs={12}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: '#f8fafc',
                  p: 1.5,
                  borderRadius: '12px',
                  border: '1px solid #eef2f6',
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.is_default}
                      onChange={setField('is_default')}
                      sx={{
                        color: '#94a3b8',
                        '&.Mui-checked': { color: '#D4AF37' },
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight={700} color="#0f172a" sx={{ fontSize: '0.84rem' }}>
                        Set as Default Delivery Address
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.74rem' }}>
                        This address will be pre-selected on your checkout orders
                      </Typography>
                    </Box>
                  }
                  sx={{ m: 0, width: '100%' }}
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions
          sx={{
            px: { xs: 2.5, sm: 3 },
            py: 2,
            borderTop: '1px solid #f1f5f9',
            bgcolor: '#fafafa',
            gap: 1.5,
          }}
        >
          <Button
            type="button"
            variant="outlined"
            onClick={onClose}
            disabled={saving}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              color: '#475569',
              borderColor: '#cbd5e1',
              px: 2.5,
              py: 0.85,
              '&:hover': { borderColor: '#94a3b8', bgcolor: '#f1f5f9' },
            }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: '#001F3F',
              color: '#ffffff',
              px: 3.5,
              py: 0.85,
              boxShadow: '0 4px 14px rgba(0, 31, 63, 0.2)',
              '&:hover': {
                bgcolor: '#003366',
                boxShadow: '0 6px 18px rgba(0, 31, 63, 0.28)',
              },
            }}
          >
            {saving
              ? (isEditing ? 'Updating…' : 'Saving Address…')
              : (isEditing ? 'Update Address' : 'Save Address')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
