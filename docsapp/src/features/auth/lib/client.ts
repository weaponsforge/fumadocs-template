import { createAuthClient } from 'better-auth/react'

import { AUTH_ROUTES } from '../utils/constants'

const {
  signIn: signInMethod,
  signOut: signOutMethod,
  useSession: useSessionHook,
} = createAuthClient()

// Better Auth client-side methods
export const signIn = async (callbackURL: string = '/') => {
  await signInMethod.social({
    provider: 'google',
    callbackURL,
    errorCallbackURL: AUTH_ROUTES.ACCESS_DENIED_FULL,
  })
}

export const signOut = async () => {
  return await signOutMethod()
}

export const useSession = useSessionHook
