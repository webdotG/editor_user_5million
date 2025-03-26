import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
    worker: {
    format: 'es',
  },
  optimizeDeps: {
    exclude: ['@faker-js/faker']
  },
  server: {
    fs: {
      strict: false // Для работы с большими файлами
    },
    proxy: {
      '/api': {
        target: 'http://localhost:6969',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/,  '/api')
      }
    }
  },
})
