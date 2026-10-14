import { notFound } from 'next/navigation'
import { type NextRequest, NextResponse } from 'next/server'

import { docsLlms } from '@/lib/llms'
import { getAuthSession } from '@/lib/session'
import { publicSource, source } from '@/lib/source'

export const revalidate = false

export async function GET(_req: NextRequest, { params }: RouteContext<'/llms.mdx/[...slug]'>) {
  const slug = (await params).slug
  const page = source.getPage(slug)
  if (!page) notFound()

  const session = await getAuthSession()

  const headers = {
    headers: {
      'Content-Type': 'text/markdown',
    },
  }

  return session
    ? new NextResponse(await docsLlms(source).page(page), headers)
    : new NextResponse(await docsLlms(publicSource).page(page), headers)
}

export function generateStaticParams() {
  return source.generateParams()
}
