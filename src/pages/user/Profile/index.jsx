// Premium Profile Page with tabbed interface and hero avatar
import { useEffect, useState } from 'react';
import { Box, Typography, Avatar, Tabs, Tab, Divider, TextField, Button, Alert, Skeleton, InputAdornment, IconButton } from '@mui/material';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlined from '@mui/icons-material/VisibilityOffOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckIcon from '@mui/icons-material/Check';
import { isUserAuthenticated } from '../../../services/apiClients';
import {
  fetchUserProfileApi,
  updateUserProfileApi,
  updateUserPasswordApi,
  getProfileCredentials,
} from '../../../Actions/Users/FetchUserProfile';

// Helper components (same as original file) – retained for functionality
function SectionCard({ icon, title, subtitle, children }) {
  return (
    <Box sx={{ border: '1px solid #e5e7eb', borderRadius: '16px', overflow: 'hidden', bgcolor: '#fff', mb: 2.5 }}>
      <Box sx={{ px: { xs: 2, sm: 2.75 }, py: 2, borderBottom: '1px solid #f3f4f6', bgcolor: '#fafafa', display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ color: '#1565c0', '& svg': { fontSize: 18 } }}>{icon}</Box>
        </Box>
        <Box>
          <Typography variant="subtitle2" fontWeight={700} color="#111827">{title}</Typography>
          {subtitle && <Typography variant="caption" color="#9ca3af">{subtitle}</Typography>}
        </Box>
      </Box>
      <Box sx={{ px: { xs: 2, sm: 2.75 }, py: 2.5 }}>{children}</Box>
    </Box>
  );
}

function FieldLabel({ children, required }) {
  return (
    <Typography variant="caption" fontWeight={700} color="#374151" sx={{ display: 'block', mb: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem' }}>
      {children}{required && <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>}
    </Typography>
  );
}

// ProfileForm (unchanged from original)
function ProfileForm({ onSnack }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchUserProfileApi();
        setForm({
          name: data.name || data.full_name || '',
          email: data.email || '',
          phone: data.phone || data.mobile || '',
          address: data.address || data.shipping_address || '',
        });
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const set = (f) => (e) => {
    setForm((p) => ({ ...p, [f]: e.target.value }));
    setError('');
    setSaved(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) { setError('Name and email are required.'); return; }
    setSaving(true);
    try {
      await updateUserProfileApi({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), address: form.address.trim() });
      setSaved(true);
      onSnack('Profile updated successfully!', 'success');
    } catch (err) { setError(err.message || 'Failed to update profile'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', flexDirection: 'grid', gap: 2 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <Box key={i}>
          <Skeleton width={80} height={14} sx={{ mb: 0.75 }} />
          <Skeleton height={40} sx={{ borderRadius: '8px' }} />
        </Box>
      ))}
      <Skeleton width={120} height={40} sx={{ borderRadius: '8px', mt: 1 }} />
    </Box>
  );

  return (
    <Box component="form" onSubmit={handleSave}>
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{error}</Alert>}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        <Box>
          <FieldLabel required>Full Name</FieldLabel>
          <TextField fullWidth size="small" placeholder="Your full name" value={form.name} onChange={set('name')} sx={{ '& .MuiInputBase-root': { borderRadius: '8px' } }} />
        </Box>
        <Box>
          <FieldLabel required>Email</FieldLabel>
          <TextField fullWidth size="small" type="email" placeholder="your@email.com" value={form.email} onChange={set('email')} sx={{ '& .MuiInputBase-root': { borderRadius: '8px' } }} />
        </Box>
        <Box>
          <FieldLabel>Phone</FieldLabel>
          <TextField fullWidth size="small" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={set('phone')} sx={{ '& .MuiInputBase-root': { borderRadius: '8px' } }} />
        </Box>
        <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
          <FieldLabel>Shipping Address</FieldLabel>
          <TextField fullWidth size="small" multiline rows={2} placeholder="Enter your delivery address" value={form.address} onChange={set('address')} sx={{ '& .MuiInputBase-root': { borderRadius: '8px' } }} />
        </Box>
      </Box>
      <Box sx={{ mt: 2.5, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="submit" variant="contained" disabled={saving} startIcon={saved && !saving ? <CheckIcon /> : saving ? null : <EditOutlinedIcon />} sx={{ bgcolor: saved ? '#16a34a' : '#1565c0', '&:hover': { bgcolor: saved ? '#15803d' : '#0d47a1' }, borderRadius: '8px', fontWeight: 700, textTransform: 'none', boxShadow: 'none', px: 3 }}>
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Profile'}
        </Button>
      </Box>
    </Box>
  );
}

// PasswordForm (unchanged)
function PasswordForm({ onSnack }) {
  const [form, setForm] = useState({ old_password: '', new_password: '', confirm: '' });
  const [show, setShow] = useState({ old: false, new: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
  const strengthColor = ['#e5e7eb', '#ef4444', '#f59e0b', '#3b82f6', '#16a34a'][strength];
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];

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
      <TextField fullWidth size="small" type={show[showKey] ? 'text' : 'password'} placeholder={placeholder} value={form[field]} onChange={set(field)} InputProps={{ endAdornment: (
        <InputAdornment position="end">
          <IconButton onClick={() => toggleShow(showKey)} edge="end" size="small">
            {show[showKey] ? <VisibilityOutlined /> : <VisibilityOffOutlined />}
          </IconButton>
        </InputAdornment>
      ) }} sx={{ '& .MuiInputBase-root': { borderRadius: '8px' } }} />
    </Box>
  );

  return (
    <Box component="form" onSubmit={handleSave}>
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{error}</Alert>}
      <PwdField label="Current Password" field="old_password" showKey="old" placeholder="••••••••" />
      <PwdField label="New Password" field="new_password" showKey="new" placeholder="••••••••" />
      <Box sx={{ mt: 1, mb: 2 }}>
        <Box sx={{ width: '100%', height: 6, bgcolor: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ width: `${(strength / 4) * 100}%`, height: '100%', bgcolor: strengthColor, transition: 'width 0.3s' }} />
        </Box>
        <Typography variant="caption" sx={{ mt: 0.5, color: strengthColor }}>{strengthLabel}</Typography>
      </Box>
      <PwdField label="Confirm New Password" field="confirm" showKey="confirm" placeholder="••••••••" />
      <Box sx={{ mt: 2.5, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="submit" variant="contained" disabled={saving} startIcon={saving ? null : <CheckIcon />} sx={{ bgcolor: '#1565c0', '&:hover': { bgcolor: '#0d47a1' }, borderRadius: '8px', fontWeight: 700, textTransform: 'none', boxShadow: 'none', px: 3 }}>
          {saving ? 'Saving…' : 'Change Password'}
        </Button>
      </Box>
    </Box>
  );
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`profile-tabpanel-${index}`} aria-labelledby={`profile-tab-${index}`} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}
function a11yProps(index) {
  return { id: `profile-tab-${index}`, 'aria-controls': `profile-tabpanel-${index}` };
}

export default function ProfilePage({ onSnack }) {
  const [tab, setTab] = useState(0);
  const handleChange = (event, newValue) => setTab(newValue);
  const creds = getProfileCredentials();
  const initials = (creds?.name || 'U').split(' ').map((w) => w[0] || '').join('').slice(0, 2).toUpperCase();

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: { xs: 2, sm: 3 } }}>
      {/* Hero avatar */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
        <Box sx={{ position: 'relative', width: 96, height: 96, borderRadius: '50%', background: 'linear-gradient(135deg, #D4AF37, #9a7a0a)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: '#0f1c2e', color: '#F5D77F', fontWeight: 800 }}>{initials}</Avatar>
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>{creds?.name || 'User'}</Typography>
        <Typography variant="subtitle2" color="text.secondary">{creds?.email || ''}</Typography>
      </Box>

      <Tabs value={tab} onChange={handleChange} centered>
        <Tab label="Personal Details" {...a11yProps(0)} />
        <Tab label="Security & Password" {...a11yProps(1)} />
        <Tab label="Account Overview" {...a11yProps(2)} />
      </Tabs>
      <Divider sx={{ my: 2 }} />

      <TabPanel value={tab} index={0}>
        <ProfileForm onSnack={onSnack} />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <PasswordForm onSnack={onSnack} />
      </TabPanel>
      <TabPanel value={tab} index={2}>
        <Box sx={{ p: 2 }}>
          <Typography variant="body1" gutterBottom>Account ID: <strong>{creds?.id || 'N/A'}</strong></Typography>
          <Typography variant="body1" gutterBottom>Member since: <strong>{creds?.joined || 'N/A'}</strong></Typography>
          <Typography variant="body2" color="text.secondary">For support, visit the Help Center or contact us via WhatsApp.</Typography>
        </Box>
      </TabPanel>
    </Box>
  );
}
