import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
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
            'ui-vendor': ['@chakra-ui/react', '@zamio/ui-theme', 'react-hot-toast'],
            'chart-vendor': ['apexcharts', 'react-apexcharts', 'chart.js', 'react-chartjs-2', 'recharts'],
            'utility-vendor': ['axios', 'lodash', 'clsx', 'tailwind-merge'],
            
            // Feature-based chunks
            'auth-pages': [
              './src/pages/Authentication/SignIn',
              './src/pages/Authentication/SignUp',
              './src/pages/Authentication/VerifyEmail',
              './src/pages/Authentication/Password/ForgotPassword',
              './src/pages/Authentication/Password/ConfirmPasswordOTP',
              './src/pages/Authentication/Password/NewPassword',
              './src/pages/Authentication/Onboarding/AdminCompleteProfile'
            ],
            'admin-management': [
              './src/pages/Admin/UserManagement/UserManagementDashboard',
              './src/pages/Admin/StaffManagement/StaffManagementDashboard',
              './src/pages/Admin/UserManagement/KycReviewDashboard',
              './src/pages/Admin/UserManagement/AuditLogViewer',
              './src/pages/Admin/SystemHealth/SystemHealthDashboard',
              './src/pages/Admin/RoyaltyManagement/RoyaltyManagementDashboard',
              './src/pages/Admin/RoyaltyManagement/FinancialOversightDashboard'
            ],
            'entity-management': [
              './src/pages/ArtistManagement/AllArtistsPge',
              './src/pages/StationManagement/AllStationsPage',
              './src/pages/PublisherManagement/AllPublishersPage',
              './src/pages/FanManagement/AllFansPage'
            ],
            'disputes-royalties': [
              './src/pages/Disputes/DisputesList',
              './src/pages/Disputes/DisputeDetails',
              './src/pages/Royalties/RoyaltiesList',
              './src/pages/Royalties/ArtistRoyaltyDetails',
              './src/pages/Royalties/PartnerOps',
              './src/pages/Royalties/PartnerOpsWizard'
            ]
          }
        }
      },
      chunkSizeWarningLimit: 1000
    },
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

