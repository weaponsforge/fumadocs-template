import Image from 'next/image'

import { DocsLayout } from 'fumadocs-ui/layouts/docs'

import { baseOptions } from '@/lib/layout.shared'
import { source } from '@/lib/source'

export default async function Layout({ children }: LayoutProps<'/docs'>) {
  const base = await baseOptions()

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

            <div className="font-medium in-[.uwu]:hidden max-md:hidden">
              MU Online
            </div>
          </>
        ),
      }}
    >
      {children}
    </DocsLayout>
  )
}
