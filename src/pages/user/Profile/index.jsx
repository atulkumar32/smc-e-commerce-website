import { useEffect, useState }     from 'react';
import { useNavigate }              from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Stack,
  Alert, Skeleton, Snackbar, InputAdornment, IconButton,
} from '@mui/material';
import PersonOutlinedIcon      from '@mui/icons-material/PersonOutlined';
import LockOutlinedIcon        from '@mui/icons-material/LockOutlined';
import VisibilityOutlined      from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlined   from '@mui/icons-material/VisibilityOffOutlined';
import EditOutlinedIcon        from '@mui/icons-material/EditOutlined';
import CheckIcon               from '@mui/icons-material/Check';
import { isUserAuthenticated } from '../../../services/apiClients';
import {
  fetchUserProfileApi, updateUserProfileApi,
  updateUserPasswordApi, getProfileCredentials,
} from '../../../Actions/Users/FetchUserProfile';

// ── Section card wrapper ──────────────────────────────────────────────────────
function SectionCard({ icon, title, subtitle, children }) {
  return (
    <Box sx={{
      border: '1px solid #e5e7eb', borderRadius: '16px',
      overflow: 'hidden', bgcolor: '#fff', mb: 2.5,
    }}>
      <Box sx={{
        px: { xs: 2, sm: 2.75 }, py: 2,
        borderBottom: '1px solid #f3f4f6', bgcolor: '#fafafa',
        display: 'flex', alignItems: 'center', gap: 1.5,
      }}>
        <Box sx={{
          width: 36, height: 36, borderRadius: '10px',
          bgcolor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Box sx={{ color: '#1565c0', '& svg': { fontSize: 18 } }}>{icon}</Box>
        </Box>
        <Box>
          <Typography variant="subtitle2" fontWeight={700} color="#111827">{title}</Typography>
          {subtitle && <Typography variant="caption" color="#9ca3af">{subtitle}</Typography>}
        </Box>
      </Box>
      <Box sx={{ px: { xs: 2, sm: 2.75 }, py: 2.5 }}>
        {children}
      </Box>
    </Box>
  );
}

// ── Field label ───────────────────────────────────────────────────────────────
function FieldLabel({ children, required }) {
  return (
    <Typography variant="caption" fontWeight={700} color="#374151"
      sx={{ display: 'block', mb: 0.6, textTransform: 'uppercase',
        letterSpacing: '0.05em', fontSize: '0.72rem' }}>
      {children}
      {required && <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>}
    </Typography>
  );
}

// ── Profile form ──────────────────────────────────────────────────────────────
function ProfileForm({ onSnack }) {
  const [form,    setForm]    = useState({ name: '', email: '', phone: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [saved,   setSaved]   = useState(false);

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
      } catch (err) { setError(err.message || 'Failed to load profile'); }
      finally { setLoading(false); }
    })();
  }, []);

  const set = (f) => (e) => { setForm((p) => ({ ...p, [f]: e.target.value })); setError(''); setSaved(false); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) { setError('Name and email are required.'); return; }
    setSaving(true);
    try {
      await updateUserProfileApi({ name: form.name.trim(), email: form.email.trim(),
        phone: form.phone.trim(), address: form.address.trim() });
      setSaved(true);
      onSnack('Profile updated successfully!', 'success');
    } catch (err) { setError(err.message || 'Failed to update profile'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <Stack spacing={2}>
      {Array.from({ length: 4 }).map((_, i) => (
        <Box key={i}>
          <Skeleton width={80} height={14} sx={{ mb: 0.75 }} />
          <Skeleton height={40} sx={{ borderRadius: '8px' }} />
        </Box>
      ))}
      <Skeleton width={120} height={40} sx={{ borderRadius: '8px', mt: 1 }} />
    </Stack>
  );

  return (
    <Box component="form" onSubmit={handleSave}>
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{error}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        <Box>
          <FieldLabel required>Full Name</FieldLabel>
          <TextField fullWidth size="small" placeholder="Your full name"
            value={form.name} onChange={set('name')}
            sx={{ '& .MuiInputBase-root': { borderRadius: '8px' } }} />
        </Box>
        <Box>
          <FieldLabel required>Email</FieldLabel>
          <TextField fullWidth size="small" type="email" placeholder="your@email.com"
            value={form.email} onChange={set('email')}
            sx={{ '& .MuiInputBase-root': { borderRadius: '8px' } }} />
        </Box>
        <Box>
          <FieldLabel>Phone</FieldLabel>
          <TextField fullWidth size="small" placeholder="+91 XXXXX XXXXX"
            value={form.phone} onChange={set('phone')}
            sx={{ '& .MuiInputBase-root': { borderRadius: '8px' } }} />
        </Box>
        <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
          <FieldLabel>Shipping Address</FieldLabel>
          <TextField fullWidth size="small" multiline rows={2}
            placeholder="Enter your delivery address"
            value={form.address} onChange={set('address')}
            sx={{ '& .MuiInputBase-root': { borderRadius: '8px' } }} />
        </Box>
      </Box>

      <Box sx={{ mt: 2.5, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="submit" variant="contained" disabled={saving}
          startIcon={saved && !saving ? <CheckIcon /> : saving ? null : <EditOutlinedIcon />}
          sx={{
            bgcolor: saved ? '#16a34a' : '#1565c0',
            '&:hover': { bgcolor: saved ? '#15803d' : '#0d47a1' },
            borderRadius: '8px', fontWeight: 700, textTransform: 'none',
            boxShadow: 'none', px: 3,
          }}>
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Profile'}
        </Button>
      </Box>
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

  const strength = (() => {
    const p = form.new_password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const strengthColor = ['#e5e7eb','#ef4444','#f59e0b','#3b82f6','#16a34a'][strength];
  const strengthLabel = ['','Weak','Fair','Good','Strong'][strength];

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.old_password || !form.new_password) { setError('Please fill in all fields.'); return; }
    if (form.new_password.length < 6) { setError('New password must be at least 6 characters.'); return; }
    if (form.new_password !== form.confirm) { setError('Passwords do not match.'); return; }
    setSaving(true);
    try {
      await updateUserPasswordApi({ old_password: form.old_password, new_password: form.new_password });
      setForm({ old_password: '', new_password: '', confirm: '' });
      onSnack('Password changed successfully!', 'success');
    } catch (err) { setError(err.message || 'Failed to change password'); }
    finally { setSaving(false); }
  };

  const PwdField = ({ label, field, showKey, placeholder }) => (
    <Box>
      <FieldLabel>{label}</FieldLabel>
      <TextField fullWidth size="small"
        type={show[showKey] ? 'text' : 'password'}
        placeholder={placeholder || '••••••••'}
        value={form[field]} onChange={set(field)}
        sx={{ '& .MuiInputBase-root': { borderRadius: '8px' } }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => toggleShow(showKey)} tabIndex={-1}>
                {show[showKey]
                  ? <VisibilityOffOutlined sx={{ fontSize: 18 }} />
                  : <VisibilityOutlined sx={{ fontSize: 18 }} />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );

  return (
    <Box component="form" onSubmit={handleSave}>
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{error}</Alert>}

      <Stack spacing={2}>
        <PwdField label="Current Password *" field="old_password" showKey="old" />

        <Box>
          <FieldLabel>New Password *</FieldLabel>
          <TextField fullWidth size="small"
            type={show.new ? 'text' : 'password'}
            placeholder="At least 6 characters"
            value={form.new_password} onChange={set('new_password')}
            sx={{ '& .MuiInputBase-root': { borderRadius: '8px' } }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => toggleShow('new')} tabIndex={-1}>
                    {show.new ? <VisibilityOffOutlined sx={{ fontSize: 18 }} /> : <VisibilityOutlined sx={{ fontSize: 18 }} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {/* Strength bar */}
          {form.new_password && (
            <Box sx={{ mt: 0.75 }}>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {[1,2,3,4].map((n) => (
                  <Box key={n} sx={{
                    flex: 1, height: 3, borderRadius: 2,
                    bgcolor: n <= strength ? strengthColor : '#e5e7eb',
                    transition: 'background 0.2s',
                  }} />
                ))}
              </Box>
              <Typography variant="caption" sx={{ color: strengthColor, fontWeight: 600 }}>
                {strengthLabel}
              </Typography>
            </Box>
          )}
        </Box>

        <PwdField label="Confirm New Password *" field="confirm" showKey="confirm" />
      </Stack>

      <Box sx={{ mt: 2.5, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="submit" variant="contained" color="warning" disabled={saving}
          sx={{
            borderRadius: '8px', fontWeight: 700,
            textTransform: 'none', boxShadow: 'none', px: 3,
          }}>
          {saving ? 'Updating…' : 'Change Password'}
        </Button>
      </Box>
    </Box>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
function UserProfile() {
  const navigate = useNavigate();
  const creds    = getProfileCredentials();
  const [snack,  setSnack]  = useState({ open: false, msg: '', severity: 'success' });

  useEffect(() => {
    if (!isUserAuthenticated()) navigate('/login', { replace: true });
  }, [navigate]);

  const initials = (creds?.name || 'U').split(' ').map((w) => w[0] || '').join('').slice(0, 2).toUpperCase();
  const onSnack  = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto' }}>

      {/* ── Profile hero ── */}
      <Box sx={{
        borderRadius: '18px',
        background: 'linear-gradient(135deg, #1a2236 0%, #1565c0 100%)',
        px: { xs: 2.5, sm: 3.5 }, py: { xs: 2.25, sm: 3 },
        mb: 3,
        display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap',
      }}>
        <Box sx={{
          width: { xs: 52, sm: 64 }, height: { xs: 52, sm: 64 },
          borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)',
          border: '2px solid rgba(255,255,255,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: { xs: '1.1rem', sm: '1.3rem' }, fontWeight: 800, color: '#fff',
          flexShrink: 0,
        }}>
          {initials}
        </Box>
        <Box>
          <Typography fontWeight={800} fontSize={{ xs: '1.1rem', sm: '1.3rem' }}
            color="#fff" lineHeight={1.2}>
            {creds?.name || 'My Account'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)' }}>
            {creds?.email || 'Manage your profile & security'}
          </Typography>
        </Box>
      </Box>

      {/* ── Profile info ── */}
      <SectionCard icon={<PersonOutlinedIcon />} title="Personal Information"
        subtitle="Update your name, email and contact details">
        <ProfileForm onSnack={onSnack} />
      </SectionCard>

      {/* ── Password ── */}
      <SectionCard icon={<LockOutlinedIcon />} title="Change Password"
        subtitle="Use a strong password you don't use elsewhere">
        <PasswordForm onSnack={onSnack} />
      </SectionCard>

      {/* ── Snackbar ── */}
      <Snackbar open={snack.open} autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} sx={{ borderRadius: '10px', fontWeight: 600 }}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default UserProfile;
