import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.ts',
        registerType: 'autoUpdate',
        injectRegister: false,
        manifest: false,
        injectManifest: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,json,webmanifest,woff2,pmtiles}'],
          maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR can be disabled via DISABLE_HMR for low-noise agent editing sessions.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': {
          target: 'http://localhost:3002',
          changeOrigin: true,
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 1100,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              const modulePath = id.split('node_modules/')[1] || '';
              const segments = modulePath.split('/');
              const packageName = segments[0]?.startsWith('@')
                ? `${segments[0]}/${segments[1] || ''}`
                : segments[0] || '';

              if (packageName === 'react' || packageName === 'react-dom' || packageName === 'scheduler') {
                return 'react-core';
              }
              if (packageName === 'lucide-react') {
                return 'icons';
              }
              if (packageName === 'i18next' || packageName === 'react-i18next') {
                return 'i18n';
              }
              if (packageName === 'maplibre-gl') {
                return 'maplibre';
              }
              if (packageName === 'leaflet') {
                return 'leaflet';
              }
              if (packageName === 'pmtiles') {
                return 'pmtiles';
              }
              if (packageName === 'minisearch') {
                return 'search';
              }
              return 'vendor';
            }

            if (id.includes('processedAssets.json')) {
              return 'processed-assets';
            }
          },
        },
      },
    },
  };
});
