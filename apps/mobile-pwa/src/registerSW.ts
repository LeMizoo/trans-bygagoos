import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('🔄 Nouvelle version disponible. Recharger ?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('📱 Prêt pour le mode hors ligne');
  },
});

// Force le skip du service worker au chargement
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
      console.log('🔧 Service Worker désinstallé pour forcer la mise à jour');
    }
  });
}
