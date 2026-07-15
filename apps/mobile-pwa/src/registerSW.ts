import { registerSW } from 'virtual:pwa-register';

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    const updateSW = registerSW({
      onNeedRefresh() {
        if (confirm('Nouvelle version disponible. Actualiser ?')) {
          updateSW(true);
        }
      },
      onOfflineReady() {
        console.log('✅ Prêt pour le mode hors-ligne');
      },
    });
  }
}
