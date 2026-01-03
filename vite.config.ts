import { defineConfig } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './',
  plugins: [
    tailwindcss(),
    react(),
    electron({
      main: { entry: 'electron/main.ts' },
      preload: { input: path.join(__dirname, 'electron/preload.ts') },
      renderer: process.env.NODE_ENV === 'test' ? undefined : {},
    }),
  ],

  // ✅ Fix "Top-level await is not available..." for Electron builds
  // Electron’s Chromium supports it; your previous target list (chrome87, es2020, etc.) didn’t.
  esbuild: {
    target: 'esnext',
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        overlay: path.resolve(__dirname, 'overlay.html'),
        endgame: path.resolve(__dirname, 'endgame.html'),
      },
    },
  },

  // ✅ Sometimes needed if the offending code is coming from dependency pre-bundling
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },
})
