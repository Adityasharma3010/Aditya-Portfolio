import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import apiDev from './scripts/vite-api.mjs'
import seo from './scripts/vite-seo.mjs'

// https://vite.dev/config/
export default defineConfig({
  // apiDev: runs /api/*.js under `npm run dev` · seo: per-route meta, sitemap and robots after `npm run build`
  plugins: [react(), apiDev(), seo()],
})
