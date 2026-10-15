import Image from 'next/image'

import { SignOutLink } from '@/features/auth'

import { appName } from './constants'
import { gitConfig, GOOGLE_AUTH_CONFIGURED } from './constants'

import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'

/**
 * Shared layout configurations
 *
 * You can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export function baseOptions(): BaseLayoutProps {
  const isGitHub = process.env.GH_USERNAME && process.env.GH_REPOSITORY
  const githubUrl = isGitHub ? gitConfig.repo : undefined
  const showAuthWidget = GOOGLE_AUTH_CONFIGURED

  return {
    githubUrl,
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
    // session is resolved client-side so layouts remain statically rendered
    links: showAuthWidget
      ? [
        {
          type: 'custom',
          children: <SignOutLink />,
          secondary: true,
        },
      ]
      : [],
  }
}
