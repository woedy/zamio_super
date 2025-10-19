import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = process.env.VITE_API_URL || env.VITE_API_URL || 'http://localhost:8000'
  const { hostname } = new URL(target)
  const changeOrigin = !hostname.includes('_')

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 4176,
      proxy: {
        '/api': { target, changeOrigin, secure: false },
        '/media': { target, changeOrigin, secure: false },
      },
    },
  }
})

