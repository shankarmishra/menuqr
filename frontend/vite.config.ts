import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs'

function prerenderVitePlugin() {
  return {
    name: 'vite-plugin-menusqr-prerender',
    apply: 'build' as const,
    closeBundle() {
      const baseDir = typeof import.meta !== 'undefined' && import.meta.dirname ? import.meta.dirname : __dirname;
      const distIndex = path.resolve(baseDir, 'dist/index.html');
      if (fs.existsSync(distIndex)) {
        console.log('[vite-plugin-menusqr-prerender] Running prerender script post-bundle...');
        execSync(`node "${path.resolve(baseDir, 'scripts/ssr-render.mjs')}"`, { stdio: 'inherit' });
        const scriptPath = path.resolve(baseDir, 'scripts/prerender.cjs');
        execSync(`node "${scriptPath}"`, { stdio: 'inherit' });
      }
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), prerenderVitePlugin()],
  server: {
    proxy: {
      '/api': process.env.MENUSQR_API_PROXY || 'http://127.0.0.1:3001',
    },
  },
  preview: {
    proxy: {
      '/api': process.env.MENUSQR_API_PROXY || 'http://127.0.0.1:3001',
    },
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/framer-motion/')) {
            return 'motion-vendor';
          }
          if (id.includes('node_modules/lucide-react/')) {
            return 'icons';
          }
        },
      },
    },
  },
})
