// src/components/Card/index.jsx
import React from 'react';
import './index.scss';

const Card = ({
  children,
  title,
  subtitle,
  icon,
  action,
  className = '',
  variant = 'default', // 'default', 'outlined', 'elevated', 'glass'
  padding = '24px',
  ...props
}) => {
  return (
    <div className={`custom-card custom-card--${variant} ${className}`} style={{ padding }} {...props}>
      {/* Header */}
      {(title || subtitle || icon || action) && (
        <div className="custom-card__header">
          {icon && <div className="custom-card__icon">{icon}</div>}

          <div className="custom-card__title-wrapper">
            {title && <h3 className="custom-card__title">{title}</h3>}
            {subtitle && <p className="custom-card__subtitle">{subtitle}</p>}
          </div>

          {action && <div className="custom-card__action">{action}</div>}
        </div>
      )}

      {/* Content */}
      <div className="custom-card__content">
        {children}
      </div>
    </div>
  );
};

export default Card;