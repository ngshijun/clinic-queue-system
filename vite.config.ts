import tailwindcss from '@tailwindcss/vite'
import { webUpdateNotice } from '@plugin-web-update-notification/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    webUpdateNotice({
      logVersion: true,
      checkInterval: 10 * 60 * 1000,
      hiddenDefaultNotification: true,
    }),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      includeAssets: ['icon.png'],
      manifest: {
        name: 'Poliklinik Ng PLT Queue',
        short_name: 'Queue',
        description: 'Clinic queue management and display system',
        theme_color: '#F4EDE0',
        background_color: '#F4EDE0',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'icon.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      },
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html',
      },
    }),
  ],
})
