'use client'

import { CustomButton } from '@/components/ui/buttons/ButtonCustom'

import { signIn } from '../lib/client'

export default function GoogleSignInButton({ callbackURL }: { callbackURL?: string }) {
  return (
    <CustomButton
      title="Sign-in with Google"
      image="/images/icon-google.svg"
      callback={async () => signIn(callbackURL)}
      styles={{
        container:
          'flex items-center gap-2 rounded-lg border p-3 text-sm cursor-pointer w-50',
      }}
    />
  )
}
