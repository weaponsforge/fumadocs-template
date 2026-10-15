'use client'

import { useRouter } from 'next/navigation'

import type { CustomButtonProps } from '@/components/ui/buttons/ButtonCustom'
import { CustomButton } from '@/components/ui/buttons/ButtonCustom'

import { signOut } from '../lib/client'

export default function SignOutButton(props: CustomButtonProps) {
  const { title, label, image } = props
  const router = useRouter()

  const handleClick = async () => {
    const { error } = await signOut()

    if (error) {
      throw error
    }

    router.replace('/')
    router.refresh()
  }

  return (
    <CustomButton
      title={title}
      label={label}
      image={image}
      callback={handleClick}
    />
  )
}
