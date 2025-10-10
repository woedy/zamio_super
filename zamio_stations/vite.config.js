import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load Vite env files (e.g., .env, .env.local) so we can read VITE_* values here
  const env = loadEnv(mode, process.cwd(), '')
  // Prefer real env (e.g., from Docker Compose), then .env files, then fallback
  const target = process.env.VITE_API_URL || env.VITE_API_URL || 'http://localhost:8000'
  const { hostname } = new URL(target)
  const changeOrigin = !hostname.includes('_')

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['@chakra-ui/react', '@zamio/ui-theme'],
            'chart-vendor': ['apexcharts', 'react-apexcharts', 'chart.js', 'react-chartjs-2', 'recharts'],
            'utility-vendor': ['axios', 'lodash', 'clsx', 'tailwind-merge'],
            
            // Feature-based chunks
            'auth-pages': [
              './src/pages/Authentication/SignIn',
              './src/pages/Authentication/SignUp',
              './src/pages/Authentication/VerifyEmail',
              './src/pages/Authentication/Onboarding/CompleteProfile',
              './src/pages/Authentication/Onboarding/PaymentInfo',
              './src/pages/Authentication/Onboarding/AddStaff'
            ],
            'station-management': [
              './src/pages/StationManagement/StationProfile',
              './src/pages/StationManagement/StationStaffManagement',
              './src/pages/StationManagement/StationCompliance',
              './src/pages/StationManagement/PlaylogManagement'
            ],
            'match-dispute': [
              './src/pages/MatchLogViewer/FullDetectionTable',
              './src/pages/MatchDisputeManagement/AllDisputeMatch',
              './src/pages/MatchDisputeManagement/DisputeDetails'
            ],
            'complaint-system': [
              './src/pages/ComplaintManagement/ComplaintsList',
              './src/pages/ComplaintManagement/ComplaintDetails',
              './src/pages/ComplaintManagement/CreateComplaint'
            ]
          }
        }
      },
      chunkSizeWarningLimit: 1000
    },
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
