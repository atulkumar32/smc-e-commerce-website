import React from 'react';
import { usePWA } from './usePWA';
import { RefreshCw } from 'lucide-react';
import './PWA.scss';

export const PWAUpdateToast: React.FC = () => {
  const { updateAvailable, applyUpdate } = usePWA();

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="pwa-update-bar" role="alert" aria-live="assertive">
      <div className="update-text">
        <span>A new <strong>Vorano release</strong> is ready.</span>
      </div>
      <button
        type="button"
        className="btn-reload-update"
        onClick={applyUpdate}
      >
        <RefreshCw size={13} style={{ display: 'inline', marginRight: 4 }} />
        Update Now
      </button>
    </div>
  );
};
