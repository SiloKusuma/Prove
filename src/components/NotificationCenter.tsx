import React, { useEffect, useState, useRef } from 'react';
import { ShieldAlert, Check, Copy, Bell, Lock } from 'lucide-react';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time?: string;
  icon?: 'shield' | 'check' | 'copy' | 'lock' | 'bell';
}

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [slidingId, setSlidingId] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Listen for global notification events
  useEffect(() => {
    const handleSecurityToast = (e: any) => {
      const msg = e.detail?.message || 'Context inspection blocked';
      addNotification({
        id: `sec-${Date.now()}-${Math.random()}`,
        title: 'Security Alert',
        message: msg,
        time: 'now',
        icon: 'shield',
      });
    };

    const handleCustomNotify = (e: any) => {
      const detail = e.detail || {};
      addNotification({
        id: detail.id || `notif-${Date.now()}-${Math.random()}`,
        title: detail.title || 'Notification',
        message: detail.message || '',
        time: detail.time || 'now',
        icon: detail.icon || 'bell',
      });
    };

    window.addEventListener('prove:security-toast', handleSecurityToast);
    window.addEventListener('prove:notify', handleCustomNotify);

    // Initial welcome notification on app load
    const welcomeTimer = setTimeout(() => {
      addNotification({
        id: `welcome-${Date.now()}`,
        title: 'Prove Protocol',
        message: 'Welcome. Talk is cheap. Prove it here.',
        time: 'now',
        icon: 'lock',
      });
    }, 450);

    return () => {
      clearTimeout(welcomeTimer);
      window.removeEventListener('prove:security-toast', handleSecurityToast);
      window.removeEventListener('prove:notify', handleCustomNotify);
    };
  }, []);

  const addNotification = (item: AppNotification) => {
    setNotifications((prev) => [...prev, item]);
  };

  // Timer logic: Wait 2 seconds, slide first notification to the left, then replace with the second
  useEffect(() => {
    if (notifications.length === 0) return;

    const currentItem = notifications[0];

    // Wait 2 seconds (2000ms), then trigger slide to left
    timerRef.current = setTimeout(() => {
      setSlidingId(currentItem.id);

      // Wait 350ms for the slide-to-left transition to finish
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== currentItem.id));
        setSlidingId(null);
      }, 350);
    }, 2000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [notifications]);

  if (notifications.length === 0) return null;

  const current = notifications[0];
  const isSlidingLeft = slidingId === current.id;
  const stackCount = notifications.length;

  const getIcon = (type?: string) => {
    switch (type) {
      case 'shield':
        return <ShieldAlert className="w-5 h-5 text-neutral-200" />;
      case 'check':
        return <Check className="w-5 h-5 text-emerald-400" />;
      case 'copy':
        return <Copy className="w-5 h-5 text-neutral-200" />;
      case 'lock':
        return <Lock className="w-5 h-5 text-neutral-200" />;
      default:
        return <Bell className="w-5 h-5 text-neutral-200" />;
    }
  };

  return (
    <div className="fixed top-3 sm:top-4 inset-x-0 z-[9999] flex justify-center pointer-events-none px-4">
      <div className="relative w-full max-w-[390px] pointer-events-auto">
        {/* Layer 3 of Stack (Visible if 3 or more notifications exist) */}
        {stackCount >= 3 && (
          <div
            className="absolute inset-x-0 top-0 h-18 rounded-[22px] bg-[#141416]/75 border border-white/5 shadow-md transition-all duration-300"
            style={{
              transform: 'translateY(16px) scale(0.90)',
              transformOrigin: 'top center',
              zIndex: 1,
            }}
          />
        )}

        {/* Layer 2 of Stack (Visible if 2 or more notifications exist - matches reference image) */}
        {stackCount >= 2 && (
          <div
            className="absolute inset-x-0 top-0 h-18 rounded-[22px] bg-[#1A1A1D]/85 border border-white/10 shadow-lg backdrop-blur-md transition-all duration-300"
            style={{
              transform: 'translateY(9px) scale(0.95)',
              transformOrigin: 'top center',
              zIndex: 2,
            }}
          />
        )}

        {/* Main Active Notification (Front layer) */}
        <div
          className={`relative z-10 w-full rounded-[22px] bg-[#1C1C1E]/90 border border-white/15 p-3.5 sm:p-4 shadow-[0_12px_36px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-350 ease-out select-none ${
            isSlidingLeft
              ? '-translate-x-[125%] opacity-0'
              : 'translate-x-0 translate-y-0 opacity-100'
          }`}
          style={{
            animation: !isSlidingLeft ? 'iosSlideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1)' : undefined,
          }}
        >
          <div className="flex items-center gap-3">
            {/* iOS circular icon avatar */}
            <div className="w-10 h-10 rounded-full bg-[#2C2C2E] border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
              {getIcon(current.icon)}
            </div>

            {/* Content area */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className="font-semibold text-sm text-white truncate tracking-tight">
                  {current.title}
                </span>
                <span className="text-[11px] font-normal text-neutral-400 shrink-0">
                  {current.time || 'now'}
                </span>
              </div>
              <p className="text-xs text-neutral-300 font-normal leading-snug line-clamp-1">
                {current.message}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
