import Image from 'next/image'

import SignOutLink from '@/components/auth/linkSignout'
import { getAuthSession } from '@/lib/session'

import { appName } from './constants'
import { gitConfig } from './constants'

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

  const isGitHub = process.env.GH_USERNAME && process.env.GH_REPOSITORY
  const githubRepoUrl = isGitHub ? `${gitConfig.repo}` : ''

  return {
    githubUrl: githubRepoUrl,
    nav: {
      title: (
        <>
          <Image
            src="/images/logo_01_64.png"
            alt={`${appName}`}
            width={24}
            height={24}
            aria-hidden="true"
          />
          {appName}
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
