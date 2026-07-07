import Image from 'next/image'

import { DocsLayout } from 'fumadocs-ui/layouts/docs'

import { appName } from '@/lib/constants'
import { baseOptions } from '@/lib/layout.shared'
import { source } from '@/lib/source'
import { getAppVersion } from '@/lib/utils'

export default async function Layout({ children }: LayoutProps<'/docs'>) {
  const base = await baseOptions()
  const appVersion = getAppVersion()

  return (
    <DocsLayout
      {...base}
      tree={source.pageTree}
      nav={{
        ...base.nav,
        title: (
          <>
            <Image
              src="/images/logo_01_64.png"
              alt="Fumdadocs Template"
              width={24}
              height={24}
              aria-hidden="true"
            />

            <div className="font-medium in-[.uwu]:hidden max-md:hidden flex gap-1 items-center">
              <div>{appName}</div>
              <div className="text-xs font-light">{appVersion}</div>
            </div>
          </>
        ),
      }}
    >
      {children}
    </DocsLayout>
  )
}
