import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { fetchCurrentUserProfile, updateCurrentUserProfile } from '../../../Actions/UserAction';
import { isUserAuthenticated } from '../../../services/apiClients';
import { notifyError, showSuccess } from '../../../utils/toastNotify';
import './style.scss';

function UserProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isUserAuthenticated()) {
      navigate('/login', { replace: true });
      return;
    }

    const loadProfile = async () => {
      try {
        const data = await fetchCurrentUserProfile();
        setProfile({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
        });
      } catch (err) {
        console.warn('[UserProfile] loadProfile error', err);
        setError(err.message || 'Unable to load profile.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleChange = (field) => (event) => {
    setProfile((prev) => ({ ...prev, [field]: event.target.value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!profile.name.trim() || !profile.email.trim()) {
      setError('Name and email are required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: profile.name.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim(),
        address: profile.address.trim(),
      };
      const data = await updateCurrentUserProfile(payload);
      showSuccess('Profile updated successfully.');
      localStorage.setItem('user_profile', JSON.stringify(data));
    } catch (err) {
      console.error('[UserProfile] update error', err);
      setError(err.message || 'Unable to save profile.');
      notifyError(err, err.message || 'Unable to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box className="user-profile">
      <Box className="user-profile__header">
        <Box>
          <Typography variant="h4" className="user-profile__title">
            My Profile
          </Typography>
          <Typography color="text.secondary">
            Edit your account details and keep your information up to date.
          </Typography>
        </Box>
      </Box>

      {loading ? (
        <Box className="user-profile__loading">
          <CircularProgress />
        </Box>
      ) : (
        <Box component="form" className="user-profile__form" onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Full Name"
                fullWidth
                value={profile.name}
                onChange={handleChange('name')}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Email Address"
                type="email"
                fullWidth
                value={profile.email}
                onChange={handleChange('email')}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Phone Number"
                fullWidth
                value={profile.phone}
                onChange={handleChange('phone')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Shipping Address"
                fullWidth
                value={profile.address}
                onChange={handleChange('address')}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
}

export default UserProfile;
