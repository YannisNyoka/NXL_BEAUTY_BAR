import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Optional: Add proxy for API calls if needed
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:3001',
    //     changeOrigin: true,
    //   }
    // }
  },
  // Ensure environment variables are properly handled
  define: {
    'process.env': {}
  }
})
