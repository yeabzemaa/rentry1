/* eslint-env node */
/* global process */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env vars (only VITE_ prefixed are available in client, but all are in config)
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_URL || env.BACKEND_URL || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
          // rewrite: (path) => {
          //   // Remove /api prefix when forwarding to backend
          //   // So /api/admin/login becomes /admin/login on backend
          //   return path.replace(/^\/api/, '');
          // },
        },
      },
    },
  }
})
