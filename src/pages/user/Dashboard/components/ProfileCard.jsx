import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Avatar, Chip, Tooltip } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';

export default function ProfileCard({ user, onEdit }) {
  const navigate = useNavigate();

  const fullName = user?.name || user?.full_name || 'Valued Member';
  const email = user?.email || user?.Email || 'No email registered';
  const phone = user?.phone || user?.mobile || user?.phone_number || 'No phone registered';
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="ud-profile-card">
      <div className="ud-profile-card__top">
        <div className="ud-profile-card__avatar-box">
          <Avatar className="ud-profile-card__avatar">
            {initials}
          </Avatar>
          <span className="ud-profile-card__badge-icon" title="Verified Customer">
            <VerifiedUserOutlinedIcon />
          </span>
        </div>

        <div className="ud-profile-card__header-info">
          <div className="ud-profile-card__status-row">
            <span className="ud-profile-card__status-pill">Active Account</span>
            <span className="ud-profile-card__tier-pill">Gold Tier</span>
          </div>
          <h2 className="ud-profile-card__name">{fullName}</h2>
          <p className="ud-profile-card__welcome-sub">Customer ID: SMC-{user?.user_id || user?.id || '8841'}</p>
        </div>
      </div>

      <div className="ud-profile-card__details">
        <div className="ud-profile-card__detail-item">
          <EmailOutlinedIcon className="ud-profile-card__detail-icon" />
          <div className="ud-profile-card__detail-text">
            <span className="ud-profile-card__detail-label">Email Address</span>
            <span className="ud-profile-card__detail-value" title={email}>{email}</span>
          </div>
        </div>

        <div className="ud-profile-card__detail-item">
          <PhoneOutlinedIcon className="ud-profile-card__detail-icon" />
          <div className="ud-profile-card__detail-text">
            <span className="ud-profile-card__detail-label">Mobile Number</span>
            <span className="ud-profile-card__detail-value">{phone}</span>
          </div>
        </div>
      </div>

      <div className="ud-profile-card__perks">
        <div className="ud-profile-card__perk-badge">
          <ShieldOutlinedIcon sx={{ fontSize: 16 }} />
          <span>100% Authentic Guarantee</span>
        </div>
        <div className="ud-profile-card__perk-badge">
          <LocalShippingOutlinedIcon sx={{ fontSize: 16 }} />
          <span>Express Delivery Eligible</span>
        </div>
      </div>

      <div className="ud-profile-card__footer">
        <Button
          variant="contained"
          startIcon={<EditOutlinedIcon />}
          onClick={onEdit || (() => navigate('/user/profile'))}
          className="ud-profile-card__edit-btn"
        >
          Edit Profile & Password
        </Button>
      </div>
    </div>
  );
}

