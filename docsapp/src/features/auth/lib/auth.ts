import { betterAuth } from 'better-auth'

import { GOOGLE_AUTH_CONFIGURED } from '@/lib/constants'
import { getHostedDomain, isEmailAllowed } from '@/lib/utils'

import { AUTH_ERROR, B_STATUS_CODES } from '../utils/constants'

// Better Auth settings
export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  user: {
    validateUserInfo: ({ user }) => {
      const userEmail = user?.email || ''

      if (!isEmailAllowed(userEmail)) {
        return {
          error: AUTH_ERROR.ACCESS_DENIED,
          errorDescription: B_STATUS_CODES.FORBIDDEN,
        }
      }
    },
  },
  socialProviders: {
    ...(GOOGLE_AUTH_CONFIGURED && {
      google: {
        prompt: 'select_account',
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        // Use Google's hosted domain parameter if a single email domain is specified
        // This restricts the account picker to only show accounts from that email domain
        ...(getHostedDomain() && { hd: getHostedDomain() }),
      },
    }),
  },
})
