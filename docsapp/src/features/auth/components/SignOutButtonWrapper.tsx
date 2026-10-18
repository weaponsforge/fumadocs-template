'use client'

import SignOutButton from './SignOutButton'
import { useSession } from '../lib/client'

/**
 * Resolves the session on the client so layouts stay static
 */
export default function SignOutButtonWrapper() {
  const { data: session } = useSession()

  if (!session) {
    return null
  }

  const { email, image } = session.user

  return (
    <SignOutButton
      title="Sign out"
      label={email}
      image={image ?? undefined}
    />
  )
}
