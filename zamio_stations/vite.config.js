import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const fallbackApiUrl = 'http://localhost:8000'

const resolveTargetUrl = (value) => {
  const trimmed = (value ?? '').trim()
  const candidate = trimmed
    ? /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed)
      ? trimmed
      : `http://${trimmed}`
    : fallbackApiUrl

  try {
    return new URL(candidate)
  } catch (error) {
    return new URL(fallbackApiUrl)
  }
}

const toProxyTarget = (url) => {
  if (url.pathname === '/' && !url.search && !url.hash) {
    return url.origin
  }

  return url.toString().replace(/\/$/, '')
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load Vite env files (e.g., .env, .env.local) so we can read VITE_* values here
  const env = loadEnv(mode, process.cwd(), '')
  // Prefer real env (e.g., from Docker Compose), then .env files, then fallback
  const targetUrl = resolveTargetUrl(process.env.VITE_API_URL || env.VITE_API_URL)
  const target = toProxyTarget(targetUrl)
  const changeOrigin = !targetUrl.hostname.includes('_')

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 4174,
      proxy: {
        '/api': { target, changeOrigin, secure: false },
        '/media': { target, changeOrigin, secure: false },
      },
    },
  }
})
