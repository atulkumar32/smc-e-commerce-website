import React from 'react';
import { usePWA } from '../../usePWA';
import { WifiOff, Wifi } from 'lucide-react';
import './index.scss';

export const NetworkStatusBar: React.FC = () => {
  const { isOnline, wasOffline } = usePWA();

  if (isOnline && !wasOffline) {
    return null;
  }

  return (
    <div
      className={`pwa-network-bar ${isOnline ? 'online' : 'offline'}`}
      role="status"
      aria-live="polite"
    >
      <span className="pulse-dot" />
      {isOnline ? (
        <>
          <Wifi size={14} />
          <span>Connection Restored — Live Inventory Synchronised</span>
        </>
      ) : (
        <>
          <WifiOff size={14} />
          <span>Browsing Offline — Cached Collections Available</span>
        </>
      )}
    </div>
  );
};

export default NetworkStatusBar;
