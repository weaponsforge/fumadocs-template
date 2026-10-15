// Client/shared only. The server `auth` instance lives in ./server so this
// barrel never drags server config (and its secrets) into client bundles.
export { default as AuthWidget } from './components/AuthWidget'
export { default as GoogleSignInButton } from './components/GoogleLoginBtn'
export { default as SignOutButton } from './components/SignOutButton'
export { default as SignOutLink } from './components/SignOutButtonWrapper'

export { signIn, signOut } from './lib/client'

export {
  AUTH_CODE,
  AUTH_ERROR,
  AUTH_QUERY,
  AUTH_ROUTES,
  B_STATUS_CODES,
  GOOGLEAPIS_USERINFO_URL,
} from './utils/constants'
