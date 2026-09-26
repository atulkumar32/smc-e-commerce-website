import { useNavigate } from 'react-router-dom';
import { Avatar } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import StarsOutlinedIcon from '@mui/icons-material/StarsOutlined';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

export default function ProfileCard({ user, onEdit }) {
  const navigate = useNavigate();

  const fullName = user?.name || user?.full_name || 'Valued Member';
  const email = user?.email || user?.Email || 'No email registered';
  const phone = user?.phone || user?.mobile || user?.phone_number || 'No phone registered';
  const customerId = user?.user_id || user?.id || '4';

  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="ud-profile-card">
      {/* Decorative luxury gradient rim */}
      <div className="ud-profile-card__accent-bar" aria-hidden="true" />

      {/* Top Identity Block */}
      <div className="ud-profile-card__header">
        <div className="ud-profile-card__avatar-wrap">
          <Avatar className="ud-profile-card__avatar">
            {initials}
          </Avatar>
          <span className="ud-profile-card__verified-badge" title="Verified Member">
            <VerifiedUserOutlinedIcon sx={{ fontSize: 13 }} />
          </span>
        </div>

        <div className="ud-profile-card__meta">
          <div className="ud-profile-card__pills">
            <span className="ud-pill ud-pill--active">
              <span className="ud-pill__dot" />
              Active Account
            </span>
            <span className="ud-pill ud-pill--gold">
              <StarsOutlinedIcon sx={{ fontSize: 11 }} />
              Gold Tier
            </span>
          </div>

          <h2 className="ud-profile-card__name" title={fullName}>
            {fullName}
          </h2>

          <div className="ud-profile-card__id-row">
            <span className="ud-profile-card__id-label">Customer ID:</span>
            <strong className="ud-profile-card__id-value">SMC-{customerId}</strong>
          </div>
        </div>
      </div>

      {/* Contact Details List */}
      <div className="ud-profile-card__contacts">
        <div className="ud-contact-row">
          <div className="ud-contact-row__icon-box">
            <EmailOutlinedIcon sx={{ fontSize: 16 }} />
          </div>
          <div className="ud-contact-row__info">
            <span className="ud-contact-row__label">EMAIL ADDRESS</span>
            <span className="ud-contact-row__val" title={email}>{email}</span>
          </div>
        </div>

        <div className="ud-contact-row">
          <div className="ud-contact-row__icon-box">
            <PhoneOutlinedIcon sx={{ fontSize: 16 }} />
          </div>
          <div className="ud-contact-row__info">
            <span className="ud-contact-row__label">MOBILE NUMBER</span>
            <span className="ud-contact-row__val">{phone}</span>
          </div>
        </div>
      </div>

      {/* Luxury Member Perks */}
      <div className="ud-profile-card__perks">
        <div className="ud-perk-item">
          <div className="ud-perk-item__icon">
            <ShieldOutlinedIcon sx={{ fontSize: 14 }} />
          </div>
          <span>100% Authentic Quality Guarantee</span>
        </div>

        <div className="ud-perk-item">
          <div className="ud-perk-item__icon">
            <LocalShippingOutlinedIcon sx={{ fontSize: 14 }} />
          </div>
          <span>Complimentary Express Courier</span>
        </div>
      </div>

      {/* Bottom Action CTA */}
      <div className="ud-profile-card__footer">
        <button
          type="button"
          onClick={onEdit || (() => navigate('/user/profile'))}
          className="ud-profile-card__edit-btn"
        >
          <div className="ud-profile-card__edit-btn-left">
            <EditOutlinedIcon sx={{ fontSize: 15 }} />
            <span>Manage Profile &amp; Security</span>
          </div>
          <ArrowForwardIosIcon sx={{ fontSize: 11 }} />
        </button>
      </div>
    </aside>
  );
}
