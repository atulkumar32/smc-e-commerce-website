import React, { useState, useEffect, useRef } from 'react';
import { usePWA } from './usePWA';
import { Download, X, Sparkles, Share, Smartphone, Zap } from 'lucide-react';
import './PWA.scss';

const TOTAL_COUNTDOWN_SECONDS = 10;

export const PWAInstallPrompt: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, promptInstall, dismissInstallPrompt } = usePWA();
  const [isMinimized, setIsMinimized] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_COUNTDOWN_SECONDS);
  const [isPaused, setIsPaused] = useState(false);
  const [showBrowserNotice, setShowBrowserNotice] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 10-second auto-close countdown timer
  useEffect(() => {
    if (!isInstallable || isInstalled || isMinimized) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      if (document.hidden) return; // Pause while user is on another tab

      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsMinimized(true); // Auto-minimize into discrete floating pill after 10 seconds
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isInstallable, isInstalled, isMinimized, isPaused]);

  // Listen for browser notice request
  useEffect(() => {
    const handleBrowserNotice = () => setShowBrowserNotice(true);
    window.addEventListener('pwa:show-browser-notice', handleBrowserNotice);
    return () => window.removeEventListener('pwa:show-browser-notice', handleBrowserNotice);
  }, []);

  if (!isInstallable || isInstalled) {
    return null;
  }

  const progressPercent = Math.max(0, Math.min(100, (secondsLeft / TOTAL_COUNTDOWN_SECONDS) * 100));

  return (
    <aside
      className="pwa-install-widget"
      role="complementary"
      aria-label="Install Shree Mahaveer Collections App"
    >
      {isMinimized ? (
        /* Minimized Floating Bottom-Right Pill (Desktop & Mobile) */
        <div
          className="pwa-floating-pill"
          onClick={() => setIsMinimized(false)}
          title="Click to view Shree Mahaveer App details"
        >
          <div className="pill-lead">
            <span className="pill-star">✦</span>
            <span className="pill-title">Install SMC App</span>
          </div>
          <button
            type="button"
            className="pill-btn-install"
            onClick={(e) => {
              e.stopPropagation();
              promptInstall();
            }}
            title={isIOS ? 'Add to Home Screen' : 'Install Application'}
            aria-label="Install Application"
          >
            <Download size={13} />
            <span>Install</span>
          </button>
          <button
            type="button"
            className="pill-btn-close"
            onClick={(e) => {
              e.stopPropagation();
              dismissInstallPrompt(7);
            }}
            title="Dismiss for 7 days"
            aria-label="Close"
          >
            <X size={13} />
          </button>
        </div>
      ) : (
        /* Expanded Luxury Install Card (Bottom-Right Floating on Mobile & Desktop) */
        <div
          className="pwa-install-card"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Card Header Row */}
          <div className="card-top-row">
            <div className="app-icon-preview">
              <img
                src="/pwa-192x192.png"
                alt="Shree Mahaveer Collections Icon"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="fallback-star">✦</span>
            </div>

            <div className="app-info">
              <span className="app-eyebrow">SHREE MAHAVEER COLLECTIONS</span>
              <h4 className="app-title">Install Shree Mahaveer App</h4>
              <p className="app-desc">
                Experience standalone full-screen browsing &amp; offline bag collections access.
              </p>
            </div>

            <button
              type="button"
              className="btn-close-prompt"
              onClick={() => dismissInstallPrompt(7)}
              aria-label="Dismiss installation prompt"
              title="Close for 7 days"
            >
              <X size={15} />
            </button>
          </div>

          {/* Feature Highlights Strip */}
          <div className="card-perks">
            <span className="perk-pill">
              <Zap size={11} className="perk-icon" /> 0.2s Launch
            </span>
            <span className="perk-pill">
              <Sparkles size={11} className="perk-icon" /> Offline Mode
            </span>
            <span className="perk-pill">
              <Smartphone size={11} className="perk-icon" /> Full Screen
            </span>
          </div>

          {/* Browser Address Bar Notice (when browser prompt is waiting in Omnibox) */}
          {showBrowserNotice && (
            <div className="card-browser-guide" role="status">
              <span>Look at your browser&apos;s address / search bar at the top and tap the <strong>Install icon (⊕ or 📥)</strong>!</span>
            </div>
          )}

          {/* Action Buttons Row */}
          <div className="card-actions-row">
            <button
              type="button"
              className="btn-install-cta"
              onClick={promptInstall}
            >
              {isIOS ? <Share size={15} /> : <Download size={15} />}
              <span>{isIOS ? 'Add to Home Screen' : 'Install Application'}</span>
            </button>

            <button
              type="button"
              className="btn-later"
              onClick={() => dismissInstallPrompt(3)}
            >
              Maybe Later
            </button>
          </div>

          {/* 10-Second Auto-Close Progress Bar & Timer */}
          <div className="card-timer-row">
            <span className="timer-text">
              {isPaused ? 'Paused on hover' : `Auto-closing in ${secondsLeft}s`}
            </span>
          </div>
          <div className="card-progress-track" aria-hidden="true">
            <div
              className="card-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </aside>
  );
};

export default PWAInstallPrompt;
