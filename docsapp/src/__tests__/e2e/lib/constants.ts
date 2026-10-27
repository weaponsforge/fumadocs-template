import { randomBytes } from 'node:crypto'
import { join } from 'node:path'

export const PORT = Number(process.env.e2e_PORT || 3100)
export const BASE_URL = `http://localhost:${PORT}`
export const SIGN_IN_ROUTE = '/auth/signin'

export const IS_WINDOWS = process.platform === 'win32'
export const READY_TIMEOUT_MS = 60_000

// A build reused with e2e_SKIP_BUILD=1 is only current if none of these changed since.
export const BUILD_ID_FILE = join(process.cwd(), '.next', 'BUILD_ID')
export const BUILD_INPUTS = [
  'content/docs',
  'src',
  'next.config.mjs',
  'source.config.ts',
  'package-lock.json',
].map((path) => join(process.cwd(), path))
export const TESTS_DIR = join(process.cwd(), 'src', '__tests__')

// Builds the app and serves it with Google OAuth configured using dummy credentials:
// no sign-in ever happens, so every request is made without a session.
// Process env wins over .env.local, so these override any local values.
export const env: NodeJS.ProcessEnv = {
  ...process.env,
  NODE_ENV: 'production',
  NEXT_TELEMETRY_DISABLED: '1',
  GOOGLE_CLIENT_ID: 'privacy-client-id',
  GOOGLE_CLIENT_SECRET: 'privacy-client-secret',
  BETTER_AUTH_SECRET: randomBytes(32).toString('hex'),
  BETTER_AUTH_URL: BASE_URL,
  // `next start` doesn't serve the standalone output
  IS_BUILD_DOCKER: '0',
  IS_BUILD_STATIC: '0',
}

// Resolves which docs are private straight from content/docs/, independent of
// the app's RouteHandler and the generated .source/docs-routes.json, using the
// documented rule: the nearest explicit `private` wins and a missing key inherits.

export const CONTENT_DIR = join(process.cwd(), 'content', 'docs')
export const PROTECTED_DIR = join(process.cwd(), 'protected')

export const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/

// Canaries must be plain enough to match verbatim in HTML, JSON and markdown output
export const CANARY_TEXT = /^[A-Za-z][\w\s.,:;!?()/-]{15,}$/
