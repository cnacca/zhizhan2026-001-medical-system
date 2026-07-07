import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/notifications': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/dashboards': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/messages': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/logistics': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/clinics': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/patients': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/orders': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/files': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/form-configs': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/products': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/workflow-chains': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/tasks': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/process-instance': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/check-records': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/reworks': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/final-inspection-reports': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/work-logs': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/performance': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/staff': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/quality-records': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/doctor': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/production': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/ai': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true,
        changeOrigin: true
      }
    }
  }
})
