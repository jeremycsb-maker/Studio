import { defineConfig } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ command, mode }) => {
  // On active Electron uniquement si on le demande explicitement
  const isElectron = mode === 'electron' || command === 'build'

  return {
    plugins: [
      isElectron && electron({
        main: {
          entry: 'electron/main.js',
        },
        preload: {
          input: 'electron/preload.js',
        },
        renderer: {},
      }),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        manifest: {
          name: 'Mangaka Studio',
          short_name: 'Studio',
          description: 'Gestion de projet immersive pour Mangakas',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          display: 'standalone',
          icons: [
            {
              src: 'icon.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'icon.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'icon.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ].filter(Boolean),
  }
})


