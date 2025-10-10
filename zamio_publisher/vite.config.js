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
            'ui-vendor': ['@chakra-ui/react', '@zamio/ui-theme'],
            'chart-vendor': ['apexcharts', 'react-apexcharts', 'chart.js', 'react-chartjs-2', 'recharts'],
            'utility-vendor': ['axios', 'lodash', 'clsx', 'tailwind-merge'],
            
            // Feature-based chunks
            'auth-pages': [
              './src/pages/Authentication/SignIn',
              './src/pages/Authentication/SignUp',
              './src/pages/Authentication/VerifyEmail',
              './src/pages/Authentication/Onboarding/CompleteProfile',
              './src/pages/Authentication/Onboarding/RevenueSplit',
              './src/pages/Authentication/Onboarding/LinkArtist',
              './src/pages/Authentication/Onboarding/PaymentInfo'
            ],
            'artist-management': [
              './src/pages/ManageArtists/AllArtists',
              './src/pages/ManageArtists/ArtistDetails'
            ],
            'contract-management': [
              './src/pages/ContractManagement/AllArtistsContracts',
              './src/pages/ContractManagement/ContractDetails',
              './src/pages/ContractManagement/AddContract'
            ],
            'royalties-disputes': [
              './src/pages/Royalties/AllArtistsRoyalties',
              './src/pages/Royalties/ArtistRoyaltiesDetail',
              './src/pages/Disputes/DisputesList',
              './src/pages/Disputes/DisputeDetails'
            ]
          }
        }
      },
      chunkSizeWarningLimit: 1000
    },
    server: {
      host: '0.0.0.0',
      port: 4175,
      proxy: {
        '/api': { target, changeOrigin, secure: false },
        '/media': { target, changeOrigin, secure: false },
      },
    },
  }
})

