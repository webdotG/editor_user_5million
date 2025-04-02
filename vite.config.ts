import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
    worker: {
    format: 'es',
  },
  server: {
    fs: {
      strict: false, // Для работы с большими файлами
    },
    proxy: {
      '/api': 'http://localhost:6969'
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        implementation: 'sass' 
      }
    }
  },
  optimizeDeps: {
    exclude: ['sass'] // Исключаем из оптимизации
  }
  },
)
