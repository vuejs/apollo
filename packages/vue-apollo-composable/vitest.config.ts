import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    // Ignore ECONNRESET errors during cleanup - race condition between vitest exit and HTTP connection cleanup
    dangerouslyIgnoreUnhandledErrors: true,
    coverage: {
      include: ['src/useQuery.ts'],
      exclude: ['src/**/*.test.ts', 'src/test-utils/**'],
      reporter: ['text', 'html'],
    },
  },
})
