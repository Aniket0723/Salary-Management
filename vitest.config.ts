import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./frontend/src/__tests__/setup.ts'],
    include: ['frontend/src/**/*.test.{ts,tsx}', 'backend/**/*.test.js'],
    restoreMocks: true,
  },
})
