import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import apiDev from './scripts/vite-api.mjs'
import seo from './scripts/vite-seo.mjs'

// https://vite.dev/config/
export default defineConfig({
  // apiDev: runs /api/*.js under `npm run dev` · seo: per-route meta, sitemap and robots after `npm run build`
  plugins: [react(), apiDev(), seo()],
  build: {
    rollupOptions: {
      output: {
        // stable vendor chunks: they are cached across deploys and load in parallel with the app code
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (/node_modules\/(@?gsap)\//.test(id)) return 'gsap'
          if (/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(id)) return 'react'
        },
      },
    },
  },
})
