import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, CircularProgress,
  Alert, Grid, Stack, Avatar, Snackbar,
  InputAdornment, IconButton, Tab, Tabs,
} from '@mui/material';
import PersonOutlinedIcon  from '@mui/icons-material/PersonOutlined';
import LockOutlinedIcon    from '@mui/icons-material/LockOutlined';
import VisibilityOutlined  from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlined from '@mui/icons-material/VisibilityOffOutlined';
import { isUserAuthenticated }  from '../../../services/apiClients';
import {
  fetchUserProfileApi, updateUserProfileApi,
  updateUserPasswordApi, getProfileCredentials,
} from '../../../Actions/Users/FetchUserProfile';

// ── Profile form ──────────────────────────────────────────────────────────────
function ProfileForm({ onSnack }) {
  const [form,    setForm]    = useState({ name: '', email: '', phone: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchUserProfileApi();
        setForm({
          name:    data.name    || data.full_name || '',
          email:   data.email   || '',
          phone:   data.phone   || data.mobile   || '',
          address: data.address || data.shipping_address || '',
        });
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const set = (f) => (e) => { setForm((p) => ({ ...p, [f]: e.target.value })); setError(''); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setError('Name and email are required.');
      return;
    }
    setSaving(true);
    try {
      await updateUserProfileApi({
        name:    form.name.trim(),
        email:   form.email.trim(),
        phone:   form.phone.trim(),
        address: form.address.trim(),
      });
      onSnack('Profile updated successfully!', 'success');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
      <CircularProgress size={28} />
    </Box>
  );

  return (
    <Box component="form" onSubmit={handleSave}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth size="small" label="Full Name *"
            value={form.name} onChange={set('name')} required />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth size="small" label="Email *" type="email"
            value={form.email} onChange={set('email')} required />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth size="small" label="Phone"
            value={form.phone} onChange={set('phone')} />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth size="small" label="Shipping Address" multiline rows={2}
            value={form.address} onChange={set('address')} />
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" disabled={saving}
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}>
            {saving ? 'Saving…' : 'Save Profile'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

// ── Password form ─────────────────────────────────────────────────────────────
function PasswordForm({ onSnack }) {
  const [form,   setForm]   = useState({ old_password: '', new_password: '', confirm: '' });
  const [show,   setShow]   = useState({ old: false, new: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const set = (f) => (e) => { setForm((p) => ({ ...p, [f]: e.target.value })); setError(''); };
  const toggleShow = (f) => setShow((p) => ({ ...p, [f]: !p[f] }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.old_password || !form.new_password) {
      setError('Please fill in all fields.'); return;
    }
    if (form.new_password.length < 6) {
      setError('New password must be at least 6 characters.'); return;
    }
    if (form.new_password !== form.confirm) {
      setError('Passwords do not match.'); return;
    }
    setSaving(true);
    try {
      await updateUserPasswordApi({
        old_password: form.old_password,
        new_password: form.new_password,
      });
      setForm({ old_password: '', new_password: '', confirm: '' });
      onSnack('Password changed successfully!', 'success');
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const PwdField = ({ label, field, showField }) => (
    <TextField fullWidth size="small" label={label}
      type={show[showField] ? 'text' : 'password'}
      value={form[field]} onChange={set(field)} required
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton size="small" onClick={() => toggleShow(showField)}>
              {show[showField] ? <VisibilityOffOutlined fontSize="small" />
                               : <VisibilityOutlined fontSize="small" />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );

  return (
    <Box component="form" onSubmit={handleSave}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Grid container spacing={2.5}>
        <Grid item xs={12}>
          <PwdField label="Current Password *" field="old_password" showField="old" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <PwdField label="New Password *" field="new_password" showField="new" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <PwdField label="Confirm New Password *" field="confirm" showField="confirm" />
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="warning" disabled={saving}
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}>
            {saving ? 'Updating…' : 'Change Password'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

// ── Profile page ──────────────────────────────────────────────────────────────
function UserProfile() {
  const navigate = useNavigate();
  const creds    = getProfileCredentials();
  const [tab,    setTab]    = useState(0);
  const [snack,  setSnack]  = useState({ open: false, msg: '', severity: 'success' });

  useEffect(() => {
    if (!isUserAuthenticated()) navigate('/login', { replace: true });
  }, [navigate]);

  const onSnack = (msg, severity = 'success') =>
    setSnack({ open: true, msg, severity });

  const initials = (creds?.name || 'U')
    .split(' ').map((w) => w[0] || '').join('').slice(0, 2).toUpperCase();

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2.5, sm: 3 }, maxWidth: 680, mx: 'auto' }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: '1.25rem', fontWeight: 700 }}>
          {initials}
        </Avatar>
        <Box>
          <Typography variant="h5" fontWeight={700}>{creds?.name || 'My Profile'}</Typography>
          <Typography variant="body2" color="text.secondary">{creds?.email || ''}</Typography>
        </Box>
      </Stack>

      {/* Tabs */}
      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', overflow: 'hidden' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}
          sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
          <Tab icon={<PersonOutlinedIcon fontSize="small" />} iconPosition="start"
            label="Profile" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab icon={<LockOutlinedIcon fontSize="small" />} iconPosition="start"
            label="Password" sx={{ textTransform: 'none', fontWeight: 600 }} />
        </Tabs>

        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {tab === 0 && <ProfileForm onSnack={onSnack} />}
          {tab === 1 && <PasswordForm onSnack={onSnack} />}
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar open={snack.open} autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default UserProfile;
