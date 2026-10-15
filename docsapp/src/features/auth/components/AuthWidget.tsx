'use client'

import { useEffect } from 'react'

import Link from 'next/link'

import GoogleSignInButton from './GoogleLoginBtn'
import { useAuthError } from '../hooks/useAuthError'
import { signOut } from '../lib/client'

export default function AuthWidget() {
  const { errorCode, errorInfo, callbackURL } = useAuthError()

  useEffect(() => {
    signOut()
  }, [])

  return (
    <div className="flex flex-col items-center gap-3 min-w-sm p-8 rounded-xl bg-white ">
      <h1 className="font-medium text-4xl">
        {errorCode}
      </h1>

      <div
        className="my-4 text-lg font-light text-center"
        dangerouslySetInnerHTML={{ __html: errorInfo }}
      />

      <GoogleSignInButton callbackURL={callbackURL} />

      <div className="mt-4 hover:underline">
        <Link href="/">
          Go to Home
        </Link>
      </div>
    </div>
  )
}
