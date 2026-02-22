
import React, { useState, useEffect } from 'react';
import CaptureService from '../../services/CaptureService';
import CaptureDrawer from './CaptureDrawer';

interface CaptureBubbleProps {
  onNavigateInbox: () => void;
}

const CaptureBubble: React.FC<CaptureBubbleProps> = ({ onNavigateInbox }) => {
  const [badgeCount, setBadgeCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const unsub = CaptureService.subscribe((count) => {
      setBadgeCount(count);
    });
    return unsub;
  }, []);

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setDrawerOpen(true)}
        aria-label={`Open capture drawer${badgeCount > 0 ? `, ${badgeCount} unreviewed` : ''}`}
        className="n-press fixed bottom-[84px] right-5 z-50 w-12 h-12 rounded-full bg-n-white text-n-black flex items-center justify-center transition-transform duration-150 active:scale-95 shadow-[0_0_0_1px_rgba(255,255,255,0.15)]"
        style={{ touchAction: 'manipulation' }}
      >
        <span className="material-symbols-outlined text-[22px] font-bold">add</span>
        {badgeCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-n-black border border-n-white flex items-center justify-center ndot text-[9px] leading-none"
          >
            {badgeCount > 99 ? '99' : badgeCount}
          </span>
        )}
      </button>

      {/* Inbox shortcut — only shown when badge > 0 */}
      {badgeCount > 0 && (
        <button
          onClick={onNavigateInbox}
          aria-label={`View inbox, ${badgeCount} unreviewed`}
          className="n-press fixed bottom-[84px] right-[76px] z-50 h-12 px-3 rounded-full bg-n-surface n-border flex items-center gap-[6px] transition-all duration-150"
        >
          <span className="material-symbols-outlined text-[16px] opacity-70">inbox</span>
          <span className="ndot text-[10px] tracking-widest opacity-70">INBOX</span>
        </button>
      )}

      {/* Capture Drawer */}
      <CaptureDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
};

export default CaptureBubble;
