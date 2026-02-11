"use client";

import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';
import { GaiaCard, GaiaButton } from '@/components/gaia/primitives';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Check if user has dismissed before
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installed');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <GaiaCard className="p-4 shadow-2xl border-[hsl(var(--gaia-accent)/0.3)] bg-[hsl(var(--gaia-panel))]">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[hsl(var(--gaia-accent)/0.1)] text-[hsl(var(--gaia-accent))]">
            <Download size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm mb-1">Install DataVault</h3>
            <p className="text-xs text-[hsl(var(--gaia-muted))] mb-3">
              Install our app for faster access and offline support
            </p>
            <div className="flex gap-2">
              <GaiaButton size="sm" onClick={handleInstall} className="flex-1">
                Install
              </GaiaButton>
              <GaiaButton size="sm" variant="ghost" onClick={handleDismiss}>
                Not now
              </GaiaButton>
            </div>
          </div>
          <button 
            onClick={handleDismiss}
            className="p-1 rounded-lg hover:bg-[hsl(var(--gaia-soft))] text-[hsl(var(--gaia-muted))] transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </GaiaCard>
    </div>
  );
}
