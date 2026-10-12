// Shipping Address tab — fetches saved addresses and lets the user add new ones
import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Skeleton, Alert, Chip, IconButton, Tooltip } from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import { toast } from 'react-toastify';
import AddressFormModal from './AddressFormModal';
import { fetchUserAddressesApi, saveUserAddressApi } from '../../../../Actions/Users/UserAddressActions';
import { getProfileCredentials } from '../../../../Actions/Users/FetchUserProfile';

function normaliseAddress(a) {
  return {
    id: a.id ?? a.address_id ?? `${a.full_name || ''}-${a.pincode || ''}-${Math.random()}`,
    full_name: a.full_name || a.name || '',
    phone: a.phone || a.mobile || '',
    address_line1: a.address_line1 || a.address || '',
    address_line2: a.address_line2 || '',
    city: a.city || '',
    state: a.state || '',
    pincode: a.pincode || '',
    country: a.country || 'India',
    address_type: (a.address_type || 'home').toLowerCase(),
    is_default: Number(a.is_default) === 1 || a.is_default === true,
  };
}

export default function AddressTab() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [saving, setSaving] = useState(false);
  const creds = getProfileCredentials();

  // Values picked up from the localStorage profile at login — these fields
  // are locked (read-only) in the Add Address form.
  const autoFill = {
    full_name: creds?.name || '',
    user_email: creds?.email || '',
    phone: creds?.phone || '',
  };

  const loadAddresses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const list = await fetchUserAddressesApi();
      setAddresses(list.map(normaliseAddress));
    } catch (err) {
      setError(err.message || 'Unable to load saved addresses.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      // Include the address id when editing so the backend can update
      const payload = editingAddress ? { ...formData, id: editingAddress.id } : formData;
      await saveUserAddressApi(payload);
      toast.success(editingAddress ? 'Address updated successfully!' : 'New shipping address added!');
      setModalOpen(false);
      setEditingAddress(null);
      await loadAddresses();
    } catch (err) {
      toast.error(err.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (addr) => {
    setEditingAddress(addr);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingAddress(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 2.5, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="subtitle1" fontWeight={800} color="#001F3F">Saved Delivery Addresses</Typography>
          <Typography variant="caption" color="text.secondary">
            Add and manage destinations used for your bag deliveries.
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddOutlinedIcon />}
          onClick={handleOpenAdd}
          sx={{
            bgcolor: '#001F3F', color: '#fff', fontWeight: 700, textTransform: 'none',
            borderRadius: '10px', px: 2.25, '&:hover': { bgcolor: '#003366' },
          }}
        >
          Add New Address
        </Button>
      </Box>

      {error && (
        <Alert
          severity="warning"
          sx={{ mb: 2.5, borderRadius: '10px' }}
          action={
            <Button color="inherit" size="small" onClick={loadAddresses} startIcon={<RefreshIcon />}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={150} sx={{ borderRadius: '14px' }} />
          ))}
        </Box>
      ) : addresses.length === 0 ? (
        <Box className="addr-empty-state">
          <PlaceOutlinedIcon sx={{ fontSize: 36, color: '#cbd5e1' }} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            You haven&apos;t saved any delivery addresses yet.
          </Typography>
        </Box>
      ) : (
        <Box className="addr-grid">
          {addresses.map((addr) => (
            <Box key={addr.id} className={`addr-card ${addr.is_default ? 'addr-card--default' : ''}`}>
              <Box className="addr-card__top">
                <Chip
                  size="small"
                  label={addr.address_type.charAt(0).toUpperCase() + addr.address_type.slice(1)}
                  className="addr-card__type-chip"
                />
                <Box className="addr-card__actions">
                  {addr.is_default && (
                    <span className="addr-card__default-badge">
                      <CheckCircleOutlinedIcon sx={{ fontSize: 13 }} />
                      Default
                    </span>
                  )}
                  <Tooltip title="Edit Address" arrow>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenEdit(addr)}
                      className="addr-card__edit-btn"
                    >
                      <EditOutlinedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              <Typography className="addr-card__name">{addr.full_name}</Typography>
              <Typography className="addr-card__line">
                {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}
              </Typography>
              <Typography className="addr-card__line">
                {addr.city}, {addr.state} &ndash; <strong>{addr.pincode}</strong>, {addr.country}
              </Typography>
              {addr.phone && (
                <Box className="addr-card__phone">
                  <PhoneOutlinedIcon sx={{ fontSize: 14 }} />
                  <span>{addr.phone}</span>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}

      <AddressFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        saving={saving}
        autoFill={autoFill}
        initialData={editingAddress}
      />
    </Box>
  );
}
