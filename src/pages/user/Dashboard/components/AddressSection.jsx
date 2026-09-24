import { useState, useEffect } from 'react';
import { Card, Box, Typography, Button, IconButton, Chip, Tooltip } from '@mui/material';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import { toast } from 'react-toastify';
import AddressModal from './AddressModal';
import { updateUserProfileApi } from '../../../../Actions/Users/FetchUserProfile';

const STORAGE_KEY = 'smc_user_addresses';

export default function AddressSection({ userProfile, onAddressCountChange }) {
  const [addresses, setAddresses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [saving, setSaving] = useState(false);

  // Initialize from user profile and local storage
  useEffect(() => {
    let list = [];
    try {
      list = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      list = [];
    }

    // If profile has an address and it's not in the list, create primary default entry
    if (userProfile?.address || userProfile?.shipping_address) {
      const primaryAddr = userProfile.address || userProfile.shipping_address;
      const exists = list.some((a) => a.address === primaryAddr);
      if (!exists) {
        const defaultEntry = {
          id: 'primary-1',
          name: userProfile.name || userProfile.full_name || 'Primary Recipient',
          phone: userProfile.phone || userProfile.mobile || '',
          address: primaryAddr,
          city: userProfile.city || 'Bangalore',
          state: userProfile.state || 'Karnataka',
          pincode: userProfile.pincode || '560001',
          isDefault: true,
        };
        list = [defaultEntry, ...list.map((a) => ({ ...a, isDefault: false }))];
      }
    }

    if (list.length === 0) {
      // Default placeholder address if none exists
      list = [
        {
          id: 'default-mock-1',
          name: userProfile?.name || 'Primary Recipient',
          phone: userProfile?.phone || '+91 98765 43210',
          address: '42, Heritage Silk Street, Avenue Road Cross',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560002',
          isDefault: true,
        },
      ];
    }

    setAddresses(list);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch { /* ignore */ }

    onAddressCountChange?.(list.length);
  }, [userProfile, onAddressCountChange]);

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (addr) => {
    setEditingAddress(addr);
    setModalOpen(true);
  };

  const handleSaveAddress = async (formData) => {
    setSaving(true);
    try {
      let updatedList = [];

      if (editingAddress) {
        // Edit existing
        updatedList = addresses.map((a) =>
          a.id === editingAddress.id ? { ...a, ...formData } : a
        );
      } else {
        // Add new
        const newEntry = {
          id: `addr-${Date.now()}`,
          ...formData,
          isDefault: addresses.length === 0,
        };
        updatedList = [...addresses, newEntry];
      }

      setAddresses(updatedList);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      onAddressCountChange?.(updatedList.length);

      // If marked default or only address, sync with profile API
      const defaultAddr = updatedList.find((a) => a.isDefault) || updatedList[0];
      if (defaultAddr && defaultAddr.address) {
        try {
          await updateUserProfileApi({ address: defaultAddr.address });
        } catch { /* silent fallback */ }
      }

      toast.success(editingAddress ? 'Address updated successfully!' : 'New shipping address added!');
      setModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (addrId) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === addrId,
    }));
    setAddresses(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    const selected = updated.find((a) => a.id === addrId);
    if (selected) {
      try {
        await updateUserProfileApi({ address: selected.address });
      } catch { /* silent */ }
      toast.success(`Default address set to ${selected.city}`);
    }
  };

  const handleDelete = (addrId) => {
    if (addresses.length <= 1) {
      toast.warning('You must keep at least one delivery address.');
      return;
    }
    const updated = addresses.filter((a) => a.id !== addrId);
    if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
      updated[0].isDefault = true;
    }
    setAddresses(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    onAddressCountChange?.(updated.length);
    toast.info('Address removed');
  };

  return (
    <Card elevation={0} className="ud-section-card ud-address-section">
      <div className="ud-section-card__header">
        <div>
          <div className="ud-section-card__header-tag">
            <span className="ud-section-card__tag-dot" />
            Logistics & Delivery
          </div>
          <h3 className="ud-section-card__title">Saved Delivery Addresses</h3>
          <p className="ud-section-card__subtitle">
            Manage destinations for fast, one-click order dispatch.
          </p>
        </div>

        <Button
          variant="contained"
          size="small"
          startIcon={<AddOutlinedIcon />}
          onClick={handleOpenAdd}
          className="ud-address-section__add-btn"
        >
          Add New Address
        </Button>
      </div>

      <div className="ud-address-section__grid">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`ud-address-card ${addr.isDefault ? 'ud-address-card--default' : ''}`}
          >
            <div className="ud-address-card__top">
              <div className="ud-address-card__tag-row">
                {addr.isDefault ? (
                  <span className="ud-address-card__default-badge">
                    <CheckCircleOutlinedIcon sx={{ fontSize: 13 }} />
                    Default Delivery
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr.id)}
                    className="ud-address-card__set-default-btn"
                  >
                    Set as Default
                  </button>
                )}
              </div>

              <div className="ud-address-card__actions">
                <Tooltip title="Edit Address" arrow>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenEdit(addr)}
                    className="ud-address-card__action-btn"
                  >
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                {!addr.isDefault && (
                  <Tooltip title="Delete Address" arrow>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(addr.id)}
                      className="ud-address-card__action-btn ud-address-card__action-btn--delete"
                    >
                      <DeleteOutlineOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </div>
            </div>

            <div className="ud-address-card__body">
              <h4 className="ud-address-card__name">{addr.name}</h4>
              <p className="ud-address-card__text">{addr.address}</p>
              <p className="ud-address-card__city">
                {addr.city}, {addr.state} &ndash; <strong>{addr.pincode}</strong>
              </p>
              {addr.phone && (
                <div className="ud-address-card__phone">
                  <PhoneOutlinedIcon sx={{ fontSize: 14 }} />
                  <span>{addr.phone}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <AddressModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveAddress}
        initialData={editingAddress}
        saving={saving}
      />
    </Card>
  );
}

