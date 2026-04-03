import Image from 'next/image'

import SignOutLink from '@/components/auth/linkSignout'
import { getAuthSession } from '@/lib/session'

import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export async function baseOptions(): Promise<BaseLayoutProps> {
  const session = await getAuthSession()

  return {
    nav: {
      title: (
        <>
          <Image
            src="/images/logo_01_64.png"
            alt="MU Online"
            width={24}
            height={24}
            aria-hidden="true"
          />
          MU Online
        </>
      ),
    },
    // see https://fumadocs.dev/docs/ui/navigation/links
    ...(session && {
      links: [
        {
          type: 'custom',
          children: <SignOutLink />,
          secondary: true,
        },
      ],
    }),
  }
}
