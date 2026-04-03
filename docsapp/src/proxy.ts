import { NextResponse } from 'next/server'

import { isMarkdownPreferred, rewritePath } from 'fumadocs-core/negotiation'
import { type NextRequestWithAuth, withAuth } from 'next-auth/middleware'

import { docsContentRoute, docsRoute } from '@/lib/constants'

const docSource = `${docsRoute}{/*path}`
const docTarget = `${docsContentRoute}{/*path}/content.md`
const mdxSource = `${docsRoute}{/*path}.mdx`

const { rewrite: rewriteDocs } = rewritePath(docSource, docTarget)
const { rewrite: rewriteSuffix } = rewritePath(mdxSource, docTarget)

export default function proxy(req: NextRequestWithAuth) {
  const result = rewriteSuffix(req.nextUrl.pathname)

  if (result) {
    return withAuth(
      NextResponse.rewrite(new URL(result, req.nextUrl)) as unknown as NextRequestWithAuth,
    )
  }

  if (isMarkdownPreferred(req)) {
    const result = rewriteDocs(req.nextUrl.pathname)

    if (result) {
      return withAuth(
        NextResponse.rewrite(new URL(result, req.nextUrl)) as unknown as NextRequestWithAuth,
      )
    }
  }

  return withAuth(req)
}

export const config = {
  // Next.js requires `matcher` to be statically analyzable.
  matcher: [
    '/docs/secrets/:path*',
    '/llms.mdx/docs/secrets/:path*',
  ],
}
