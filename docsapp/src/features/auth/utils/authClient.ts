import { createAuthClient } from 'better-auth/client'
import { AUTH_ROUTES } from './constants'

const {
  signIn: signInMethod,
  signOut: signOutMethod,
} = createAuthClient()

// Better Auth client-side methods
export const signIn = async (callbackURL: string = '/') => {
  await signInMethod.social({
    provider: 'google',
    callbackURL,
    errorCallbackURL: AUTH_ROUTES.ACCESS_DENIED_FULL
  })
}

export const signOut = async () => {
  return await signOutMethod()
}
