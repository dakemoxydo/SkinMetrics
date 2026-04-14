'use client';

import { useEffect } from 'react';

async function unregisterAllServiceWorkers() {
  if (!('serviceWorker' in navigator)) return;

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));

  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  }
}

export function ServiceWorkerProvider() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const setupServiceWorker = async () => {
      try {
        // Never keep SW active in development, it breaks Next chunk loading.
        if (process.env.NODE_ENV !== 'production') {
          await unregisterAllServiceWorkers();
          return;
        }

        await navigator.serviceWorker.register('/sw.js');
      } catch (error) {
        console.error('Service worker setup failed:', error);
      }
    };

    void setupServiceWorker();
  }, []);

  return null;
}
