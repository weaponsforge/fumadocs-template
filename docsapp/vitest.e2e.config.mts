import { defineConfig } from 'vitest/config'

// End-to-end tests: src/__tests__/e2e/setup.ts builds the app, serves it with `next start`
// and the tests request it over HTTP, so no path aliases are needed
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/__tests__/e2e/**/*.test.ts'],
    globalSetup: ['src/__tests__/e2e/setup.ts'],
    testTimeout: 30_000,
  },
})
