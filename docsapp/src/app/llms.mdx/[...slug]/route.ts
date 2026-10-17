import { notFound } from 'next/navigation'
import { type NextRequest, NextResponse } from 'next/server'

import { docsLlms } from '@/lib/llms'
import { getAuthSession, isActiveUserAllowed } from '@/lib/session'
import { getSource, source } from '@/lib/source'

export const revalidate = false

export async function GET(_req: NextRequest, { params }: RouteContext<'/llms.mdx/[...slug]'>) {
  const slug = (await params).slug
  const session = await getAuthSession()

  const docSource = getSource({
    isPrivate: isActiveUserAllowed(session),
  })

  const page = docSource.getPage(slug)

  if (!page) notFound()

  const headers = {
    headers: {
      'Content-Type': 'text/markdown',
    },
  }

  return new NextResponse(await docsLlms(docSource).page(page), headers)
}

export function generateStaticParams() {
  return source.generateParams()
}
