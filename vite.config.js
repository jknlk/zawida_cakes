import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // libraries rarely change: keep them in their own long-cached files so a
        // site update only re-downloads the small app chunk
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (/node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react'
          if (/node_modules[\\/](gsap|lenis)[\\/]/.test(id)) return 'motion'
          return 'vendor'
        },
      },
    },
  },
})
