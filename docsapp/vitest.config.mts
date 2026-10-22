import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

// Mirrors the `@/*` and `collections/*` paths in tsconfig.json
export default defineConfig({
  resolve: {
    alias: [
      { find: /^@\//, replacement: fileURLToPath(new URL('./src/', import.meta.url)) },
      { find: /^collections\//, replacement: fileURLToPath(new URL('./.source/', import.meta.url)) },
    ],
  },
  test: {
    environment: 'node',
    include: ['src/__tests__/**/*.test.{ts,tsx}'],
  },
})
