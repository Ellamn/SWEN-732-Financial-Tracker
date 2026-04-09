import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    coverage: {
      exclude: [
        'src/assets/**',
        'src/**/*.css',
        'src/main.jsx',
        'src/data/**',
        'src/test/**',
      ],
    },
  },
})
