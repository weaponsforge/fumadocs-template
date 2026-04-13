'use client'

import { signOut } from 'next-auth/react'

import type { CustomButtonProps } from '@/components/ui/buttons/buttonCustom'
import { CustomButton } from '@/components/ui/buttons/buttonCustom'

export function SignOutButton(props: CustomButtonProps) {
  const { title, label, image } = props

  return (
    <CustomButton
      title={title}
      label={label}
      image={image}
      callback={() => signOut({ callbackUrl: '/' })}
    />
  )
}
