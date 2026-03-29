import { SignOutButton } from '@/app/components/auth/btnSignout'
import { getAuthSession } from '@/lib/session'

export default async function SignOutLink() {
  const session = await getAuthSession()

  if (!session) {
    return null
  }

  const user = session?.user
  const email = user?.email ?? '-'
  const picture = user?.image ?? '-'

  return (
    <SignOutButton
      title="Sign out"
      label={email as string}
      image={picture as string}
    />
  )
}
