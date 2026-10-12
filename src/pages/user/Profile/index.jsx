import { useEffect, useState, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Box, Typography, Avatar, TextField, Button, Alert, Skeleton,
  InputAdornment, IconButton,
} from '@mui/material';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlined from '@mui/icons-material/VisibilityOffOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckIcon from '@mui/icons-material/Check';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';

import {
  fetchUserProfileApi,
  updateUserProfileApi,
  updateUserPasswordApi,
  getProfileCredentials,
} from '../../../Actions/Users/FetchUserProfile';
import AddressTab from './components/AddressTab';
import './style.scss';

// ── Reusable Field Label ─────────────────────────────────────────
function FieldLabel({ children, required }) {
  return (
    <Typography
      variant="caption"
      className="profile-field-label"
    >
      {children}{required && <span className="profile-field-required">*</span>}
    </Typography>
  );
}

// ── 1. Personal Details Form ─────────────────────────────────────
function ProfileForm({ onSnack }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [usingCache, setUsingCache] = useState(false);

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
        // ── API failed — fall back to localStorage user_profile ──
        const cached = getProfileCredentials();
        let cachedProfile = null;
        try {
          cachedProfile = JSON.parse(localStorage.getItem('user_profile') || '{}');
        } catch { /* ignore */ }

        const fallbackName  = cached?.name || cachedProfile?.name || cachedProfile?.full_name || '';
        const fallbackEmail = cached?.email || cachedProfile?.email || '';
        const fallbackPhone = cached?.phone || cachedProfile?.phone || cachedProfile?.mobile || '';
        const fallbackAddr  = cachedProfile?.address || cachedProfile?.shipping_address || '';

        if (fallbackName || fallbackEmail) {
          setForm({
            name: fallbackName,
            email: fallbackEmail,
            phone: fallbackPhone,
            address: fallbackAddr,
          });
          setUsingCache(true);
        } else {
          setError(err.message || 'Failed to load profile data');
        }
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
    if (!form.name.trim() || !form.email.trim()) {
      setError('Name and email are required.');
      return;
    }
    setSaving(true);
    try {
      await updateUserProfileApi({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      });
      setSaved(true);
      if (typeof onSnack === 'function') {
        onSnack('Profile updated successfully!', 'success');
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5, py: 1 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Box key={i}>
            <Skeleton width={100} height={16} sx={{ mb: 1 }} />
            <Skeleton height={46} sx={{ borderRadius: '10px' }} />
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSave} className="profile-form-wrap">
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', fontWeight: 500 }}>
          {error}
        </Alert>
      )}

      {usingCache && !error && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: '12px', fontWeight: 500 }}>
          Showing your saved details from this device. Changes will sync when the server is reachable.
        </Alert>
      )}

      {/* Trust & Verification Header Strip */}
      <div className="profile-trust-strip">
        <div className="profile-trust-item">
          <VerifiedUserOutlinedIcon sx={{ fontSize: 18, color: '#16a34a' }} />
          <span>Verified Customer Account</span>
        </div>
        <div className="profile-trust-item">
          <ShieldOutlinedIcon sx={{ fontSize: 18, color: '#D4AF37' }} />
          <span>Data Encrypted & Secure</span>
        </div>
      </div>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
        <Box>
          <FieldLabel required>Full Name</FieldLabel>
          <TextField
            fullWidth
            size="small"
            placeholder="e.g. Ram Sharma"
            value={form.name}
            onChange={set('name')}
            sx={{ '& .MuiInputBase-root': { borderRadius: '10px', bgcolor: '#fff' } }}
          />
        </Box>

        <Box>
          <FieldLabel required>Email Address</FieldLabel>
          <TextField
            fullWidth
            size="small"
            type="email"
            placeholder="your@email.com"
            value={form.email}
            onChange={set('email')}
            sx={{ '& .MuiInputBase-root': { borderRadius: '10px', bgcolor: '#fff' } }}
          />
        </Box>

        <Box>
          <FieldLabel>Mobile Phone</FieldLabel>
          <TextField
            fullWidth
            size="small"
            placeholder="+91 98765 43210"
            value={form.phone}
            onChange={set('phone')}
            sx={{ '& .MuiInputBase-root': { borderRadius: '10px', bgcolor: '#fff' } }}
          />
        </Box>

        <Box>
          <FieldLabel>Account Type</FieldLabel>
          <TextField
            fullWidth
            size="small"
            value="SMC VIP Privilege Member"
            disabled
            sx={{ '& .MuiInputBase-root': { borderRadius: '10px', bgcolor: '#f8fafc' } }}
          />
        </Box>

        <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
          <FieldLabel>Default Shipping Address</FieldLabel>
          <TextField
            fullWidth
            size="small"
            multiline
            rows={2.5}
            placeholder="Enter your complete delivery address, landmark and city..."
            value={form.address}
            onChange={set('address')}
            sx={{ '& .MuiInputBase-root': { borderRadius: '10px', bgcolor: '#fff' } }}
          />
        </Box>
      </Box>

      <Box sx={{ mt: 3.5, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
        <Button
          type="submit"
          variant="contained"
          disabled={saving}
          startIcon={saved && !saving ? <CheckIcon /> : saving ? null : <EditOutlinedIcon />}
          className={`profile-save-btn ${saved ? 'is-saved' : ''}`}
        >
          {saving ? 'Saving Profile…' : saved ? 'Saved Successfully!' : 'Save Changes'}
        </Button>
      </Box>
    </Box>
  );
}

// ── 2. Security & Password Form ──────────────────────────────────
function PasswordForm({ onSnack }) {
  const [form, setForm] = useState({ old_password: '', new_password: '', confirm: '' });
  const [show, setShow] = useState({ old: false, new: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (f) => (e) => {
    setForm((p) => ({ ...p, [f]: e.target.value }));
    setError('');
  };
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

  const strengthColor = ['#e2e8f0', '#ef4444', '#f59e0b', '#3b82f6', '#16a34a'][strength];
  const strengthLabel = ['', 'Weak Password', 'Fair Password', 'Good Password', 'Strong & Secure'][strength];

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.old_password || !form.new_password) {
      setError('Please fill in both current and new passwords.');
      return;
    }
    if (form.new_password.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (form.new_password !== form.confirm) {
      setError('New password and confirmation do not match.');
      return;
    }
    setSaving(true);
    try {
      await updateUserPasswordApi({
        old_password: form.old_password,
        new_password: form.new_password,
      });
      setForm({ old_password: '', new_password: '', confirm: '' });
      if (typeof onSnack === 'function') {
        onSnack('Password updated successfully!', 'success');
      }
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const PwdField = ({ label, field, showKey, placeholder }) => (
    <Box sx={{ mb: 2.2 }}>
      <FieldLabel required>{label}</FieldLabel>
      <TextField
        fullWidth
        size="small"
        type={show[showKey] ? 'text' : 'password'}
        placeholder={placeholder}
        value={form[field]}
        onChange={set(field)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => toggleShow(showKey)} edge="end" size="small" sx={{ color: '#94a3b8' }}>
                {show[showKey] ? <VisibilityOutlined /> : <VisibilityOffOutlined />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ '& .MuiInputBase-root': { borderRadius: '10px', bgcolor: '#fff' } }}
      />
    </Box>
  );

  return (
    <Box component="form" onSubmit={handleSave} className="profile-form-wrap">
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', fontWeight: 500 }}>
          {error}
        </Alert>
      )}

      <PwdField
        label="Current Password"
        field="old_password"
        showKey="old"
        placeholder="Enter your current password"
      />

      <PwdField
        label="New Password"
        field="new_password"
        showKey="new"
        placeholder="Enter your new secure password"
      />

      {/* Strength Indicator */}
      <Box sx={{ mt: -1, mb: 2.5 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 0.8 }}>
          {[1, 2, 3, 4].map((step) => (
            <Box
              key={step}
              sx={{
                flex: 1,
                height: 5,
                borderRadius: 2,
                bgcolor: strength >= step ? strengthColor : '#e2e8f0',
                transition: 'background-color 0.25s ease',
              }}
            />
          ))}
        </Box>
        {strength > 0 && (
          <Typography variant="caption" sx={{ color: strengthColor, fontWeight: 700, fontSize: '0.74rem' }}>
            {strengthLabel}
          </Typography>
        )}
      </Box>

      <PwdField
        label="Confirm New Password"
        field="confirm"
        showKey="confirm"
        placeholder="Re-enter your new password"
      />

      {/* Security Guidance Note */}
      <div className="profile-security-card">
        <ShieldOutlinedIcon sx={{ fontSize: 20, color: '#D4AF37', flexShrink: 0 }} />
        <div className="profile-security-text">
          <strong>Password Security Recommendations:</strong>
          <span>Use 8 or more characters with a mix of uppercase letters, numbers & symbols for maximum account protection.</span>
        </div>
      </div>

      <Box sx={{ mt: 3.5, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type="submit"
          variant="contained"
          disabled={saving}
          startIcon={saving ? null : <CheckIcon />}
          className="profile-save-btn"
        >
          {saving ? 'Updating Password…' : 'Update Password'}
        </Button>
      </Box>
    </Box>
  );
}

// ── 3. Account Overview Tab ──────────────────────────────────────
function AccountOverviewTab() {
  const creds = getProfileCredentials();

  return (
    <div className="profile-overview-wrap">
      {/* Luxury Membership VIP Card */}
      <div className="profile-membership-card">
        <div className="profile-membership-card__glow" />
        <div className="profile-membership-card__inner">
          <div className="profile-membership-card__top">
            <span className="profile-membership-card__tier">SMC PRIVILEGE CLUB</span>
            <span className="profile-membership-card__gold-emblem">★ VIP ACTIVE</span>
          </div>

          <div className="profile-membership-card__middle">
            <Typography variant="h5" className="profile-membership-card__holder">
              {creds?.name || 'Valued Customer'}
            </Typography>
            <p className="profile-membership-card__id">
              ACCOUNT ID: <strong>{creds?.id || 'SMC-882910'}</strong>
            </p>
          </div>

          <div className="profile-membership-card__bottom">
            <div>
              <span className="profile-membership-card__label">MEMBER STATUS</span>
              <span className="profile-membership-card__val">Verified Member</span>
            </div>
            <div>
              <span className="profile-membership-card__label">VALID THROUGH</span>
              <span className="profile-membership-card__val">Lifetime Warranty Access</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Stats Grid */}
      <div className="profile-overview-stats">
        <Link to="/user/orders" className="profile-stat-box">
          <div className="profile-stat-box__icon">
            <LocalMallOutlinedIcon />
          </div>
          <div className="profile-stat-box__info">
            <span className="profile-stat-box__title">Orders & Shipments</span>
            <span className="profile-stat-box__sub">Track orders, returns & history</span>
          </div>
          <ChevronRightIcon className="profile-stat-box__chev" />
        </Link>

        <Link to="/user/wishlist" className="profile-stat-box">
          <div className="profile-stat-box__icon profile-stat-box__icon--gold">
            <FavoriteBorderOutlinedIcon />
          </div>
          <div className="profile-stat-box__info">
            <span className="profile-stat-box__title">Saved Wishlist</span>
            <span className="profile-stat-box__sub">Your favorite saved bag collections</span>
          </div>
          <ChevronRightIcon className="profile-stat-box__chev" />
        </Link>
      </div>

      {/* Support & Concierge */}
      <div className="profile-support-banner">
        <div className="profile-support-banner__text">
          <strong>Need Assistance with your Orders or Bags?</strong>
          <span>Our dedicated concierge team is available 7 days a week to support you.</span>
        </div>
        <a
          href="https://wa.me/919876543210"
          target="_blank"
          rel="noopener noreferrer"
          className="profile-support-btn"
        >
          Contact Support →
        </a>
      </div>
    </div>
  );
}

// ── Tab Panel Wrapper ────────────────────────────────────────────
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 1 }}>{children}</Box>}
    </div>
  );
}

// ── Left Column Tab Definitions (Ready for 4 tabs + next tabs) ───
const NAV_ITEMS = [
  {
    id: 0,
    label: 'Personal Details',
    description: 'Name, email & contact information',
    icon: <PersonOutlinedIcon />,
    badge: 'Core Info',
  },
  {
    id: 1,
    label: 'Security & Password',
    description: 'Update your login password & 2FA',
    icon: <LockOutlinedIcon />,
    badge: 'Security',
  },
  {
    id: 2,
    label: 'Shipping Addresses',
    description: 'Manage saved delivery destinations',
    icon: <PlaceOutlinedIcon />,
    badge: 'Delivery',
  },
  {
    id: 3,
    label: 'Account Overview',
    description: 'VIP membership tier & quick stats',
    icon: <AssignmentIndOutlinedIcon />,
    badge: 'Privilege',
  },
];

// ── Main Profile Page Component ──────────────────────────────────
export default function ProfilePage({ onSnack, initialTab = 0 }) {
  const location = useLocation();

  const getInitialTab = () => {
    if (location.pathname.includes('security')) return 1;
    return initialTab;
  };

  const [tab, setTab] = useState(getInitialTab);
  const navRef = useRef(null);

  useEffect(() => {
    if (location.pathname.includes('security')) {
      setTab(1);
    } else if (location.pathname.includes('profile')) {
      setTab(initialTab);
    }
  }, [location.pathname, initialTab]);

  useEffect(() => {
    const activeEl = navRef.current?.querySelector('.profile-nav__item.is-active');
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [tab]);

  const handleTabClick = (itemId, e) => {
    setTab(itemId);
    if (e?.currentTarget) {
      e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  const creds = getProfileCredentials();
  const initials = (creds?.name || 'User')
    .split(' ')
    .map((w) => w[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const activeItem = NAV_ITEMS.find((item) => item.id === tab) || NAV_ITEMS[0];

  return (
    <Box className="profile-shell">
      {/* ═══ LEFT COLUMN: IDENTITY PROFILE + VERTICAL TABS ═══ */}
      <aside className="profile-shell__sidebar">
        {/* User Identity Header Card */}
        <div className="profile-sidebar__identity">
          <div className="profile-sidebar__avatar-ring">
            <Avatar className="profile-sidebar__avatar">{initials}</Avatar>
          </div>

          <Typography className="profile-sidebar__name">
            {creds?.name || 'Customer Account'}
          </Typography>

          <Typography className="profile-sidebar__email">
            {creds?.email || 'customer@smc.com'}
          </Typography>

          <div className="profile-sidebar__badge">
            <span className="profile-sidebar__badge-dot" />
            <span>SMC Privilege Member</span>
          </div>
        </div>

        {/* Navigation Tabs (Vertical on Desktop, 1-Row on Mobile/Tablet) */}
        <nav className="profile-nav" ref={navRef} aria-label="Profile sections">
          {NAV_ITEMS.map((item) => {
            const isActive = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`profile-nav__item${isActive ? ' is-active' : ''}`}
                onClick={(e) => handleTabClick(item.id, e)}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="profile-nav__icon">{item.icon}</span>
                <span className="profile-nav__text">
                  <span className="profile-nav__label">{item.label}</span>
                  <span className="profile-nav__desc">{item.description}</span>
                </span>
                <ChevronRightIcon className="profile-nav__chevron" />
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ═══ RIGHT COLUMN: ACTIVE TAB PAGE CONTENT ═══ */}
      <section className="profile-shell__content">
        {/* Active Tab Header Banner */}
        <div className="profile-content__header">
          <div className="profile-content__header-left">
            <span className="profile-content__header-icon">{activeItem.icon}</span>
            <div>
              <Typography className="profile-content__title">{activeItem.label}</Typography>
              <Typography className="profile-content__subtitle">{activeItem.description}</Typography>
            </div>
          </div>
          <span className="profile-content__step-badge">{activeItem.badge}</span>
        </div>

        {/* Active Tab Page Body */}
        <div className="profile-content__body">
          <TabPanel value={tab} index={0}>
            <ProfileForm onSnack={onSnack} />
          </TabPanel>

          <TabPanel value={tab} index={1}>
            <PasswordForm onSnack={onSnack} />
          </TabPanel>

          <TabPanel value={tab} index={2}>
            <AddressTab />
          </TabPanel>

          <TabPanel value={tab} index={3}>
            <AccountOverviewTab />
          </TabPanel>
        </div>
      </section>
    </Box>
  );
}
