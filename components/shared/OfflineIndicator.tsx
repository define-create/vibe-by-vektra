'use client';

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    // Handle online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      // Hide indicator after 3 seconds when back online
      setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Don't show if online and indicator is not being shown
  if (isOnline && !showIndicator) {
    return null;
  }

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        showIndicator ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border shadow-lg ${
          isOnline
            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
        }`}
      >
        {!isOnline && <WifiOff className="h-4 w-4" />}
        <span className="text-sm font-medium">
          {isOnline ? 'Back online' : 'Offline - changes saved locally'}
        </span>
      </div>
    </div>
  );
}
