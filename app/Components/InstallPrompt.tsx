'use client';
import { useState, useEffect } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(true);

  useEffect(() => {
    // Check if prompt was previously dismissed
    const isDismissed = localStorage.getItem('installPromptDismissed');
    if (isDismissed) {
      setShowPrompt(false);
      return;
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setDeferredPrompt(null);
      setShowPrompt(false);
      localStorage.setItem('installPromptDismissed', 'true');
    }
  };

  const handleDismissClick = () => {
    setShowPrompt(false);
    setDeferredPrompt(null);
    localStorage.setItem('installPromptDismissed', 'true');
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', padding: '10px', background: '#fff', border: '1px solid #ccc' }}>
      <p>Install this app for a better experience!</p>
      <button onClick={handleInstallClick} style={{ marginRight: '10px' }}>Install</button>
      <button onClick={handleDismissClick}>Dismiss</button>
    </div>
  );
}