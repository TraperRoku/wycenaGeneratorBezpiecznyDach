import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // @react-pdf/renderer potrzebuje tego
    include: ['@react-pdf/renderer'],
  },
})
