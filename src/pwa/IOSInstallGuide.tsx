import React, { useState, useEffect } from 'react';
import { usePWA } from './usePWA';
import { Share, PlusSquare, X } from 'lucide-react';
import './PWA.scss';

export const IOSInstallGuide: React.FC = () => {
  const { showIOSGuide, setShowIOSGuide } = usePWA();
  const [internalOpen, setInternalOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setInternalOpen(true);
    window.addEventListener('pwa:open-ios-guide', handleOpen);
    return () => window.removeEventListener('pwa:open-ios-guide', handleOpen);
  }, []);

  const isOpen = showIOSGuide || internalOpen;

  const handleClose = () => {
    setShowIOSGuide(false);
    setInternalOpen(false);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="ios-guide-backdrop" onClick={handleClose}>
      <div className="ios-guide-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />

        <div className="guide-head">
          <div>
            <span className="brand-badge">SHREE MAHAVEER COLLECTIONS</span>
            <h3>Add to Home Screen</h3>
          </div>
          <button
            type="button"
            className="btn-close-sheet"
            onClick={handleClose}
            aria-label="Close guide"
          >
            <X size={18} />
          </button>
        </div>

        <div className="guide-steps">
          <div className="step-row">
            <span className="step-num">1</span>
            <div className="step-content">
              Tap the <strong>Share</strong> button <Share size={16} className="inline-icon" /> at the bottom of Safari toolbar.
            </div>
          </div>

          <div className="step-row">
            <span className="step-num">2</span>
            <div className="step-content">
              Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare size={16} className="inline-icon" />.
            </div>
          </div>

          <div className="step-row">
            <span className="step-num">3</span>
            <div className="step-content">
              Tap <strong>Add</strong> in the top-right corner to add SMC Collections to your device.
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn-done-guide"
          onClick={handleClose}
        >
          Understood
        </button>
      </div>
    </div>
  );
};
export default IOSInstallGuide;
