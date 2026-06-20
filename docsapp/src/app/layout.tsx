import './global.css'
import { Geist, Geist_Mono } from 'next/font/google'

import { RootProvider } from 'fumadocs-ui/provider/next'

import PwaClient from '@/components/common/PwaClient'

import { appName, baseUrl } from '@/lib/constants'
import { createMetadata } from '@/lib/metadata'

import type { Metadata } from 'next'

export const metadata: Metadata = createMetadata({
  title: {
    template: `%s | ${appName}`,
    default: appName,
  },
  manifest: '/manifest.webmanifest', // ← Generated at build time from manifest.ts
  description: 'Clean, beautiful, modular documentation template built with Fumadocs + Google OAuth2 and Docker configs',
  metadataBase: baseUrl,
  icons: {
    icon: [
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  appleWebApp: {
    title: appName,
  },
})

const geist = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
})

const mono = Geist_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
})

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${geist.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <PwaClient />
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  )
}
