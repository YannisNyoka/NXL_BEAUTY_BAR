import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  }
  ,
  build: {
    // output the build into the parent FrontEnd/dist directory
    outDir: '../dist',
    emptyOutDir: true
  }
})
