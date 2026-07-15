import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['assets/logo/b-trans.png'],
      manifest: {
        name: 'ByGagoos Ride',
        short_name: 'ByGagoos Ride',
        description: 'ByGagoos Ride - Votre chauffeur à Madagascar',
        theme_color: '#1a1a2e',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [{ src: 'assets/logo/b-trans.png', sizes: '512x512', type: 'image/png' }]
      }
    })
  ],
  server: { port: 5174 }
})
