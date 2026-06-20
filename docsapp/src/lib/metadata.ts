import type { Metadata } from 'next/types'

import { appName, baseUrl } from './constants'

export function createMetadata(override: Metadata): Metadata {
  return {
    ...override,
    openGraph: {
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      url: baseUrl,
      images: '/images/banner.png',
      siteName: appName,
      ...override.openGraph,
    },
    twitter: {
      card: 'summary_large_image',
      creator: '@weaponsforge',
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      images: '/images/banner.png',
      ...override.twitter,
    },
  }
}
