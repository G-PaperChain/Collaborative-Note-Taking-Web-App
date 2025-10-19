import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    'process.env': {},
  },
  optimizeDeps: {
    include: ['@excalidraw/excalidraw']
  },
  css: {
    modules: {
      localsConvention: 'camelCase'
    }
  }
})