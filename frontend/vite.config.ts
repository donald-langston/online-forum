/// <reference types="vitest" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',      // Emulates the browser DOM
    globals: true,             // Avoids importing describe, test, expect in every file
    setupFiles: './src/tests/setup.ts', // Runs before tests begin
  },
});
