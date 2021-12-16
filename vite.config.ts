import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    minify: false,
    rollupOptions: {
      input: {
        myClient: resolve(__dirname, 'public/index.html'),
        myServer: resolve(__dirname, 'server/entry-server.jsx'),
      },
    }
  }
})
