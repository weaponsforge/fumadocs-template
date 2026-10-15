// Server-only entrypoint: keeps the better-auth instance out of the client barrel
export { auth } from './lib/auth'

// Routing constants, re-exported so middleware/server code can skip the client barrel
export {
  AUTH_CODE,
  AUTH_ERROR,
  AUTH_QUERY,
  AUTH_ROUTES,
} from './utils/constants'
