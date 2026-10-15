import { HomeLayout } from 'fumadocs-ui/layouts/home'

import { baseOptions } from '@/lib/layout.shared'

export default async function Layout({ children }: LayoutProps<'/'>) {
  const base = baseOptions()

  return <HomeLayout {...base}>{children}</HomeLayout>
}
