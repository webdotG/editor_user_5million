import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
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
    }
  }
})
