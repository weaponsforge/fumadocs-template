import { NextRequest, NextResponse } from 'next/server'

import { isMarkdownPreferred, rewritePath } from 'fumadocs-core/negotiation'

import { GOOGLE_AUTH_CONFIGURED } from '@/lib/constants'
import { RouteHandler } from '@/lib/routes'
import { getAuthSession, isActiveUserAllowed } from '@/lib/session'
import { urlBuilder } from '@/lib/utils'

import {
  AUTH_CODE,
  AUTH_ERROR,
  AUTH_QUERY,
  AUTH_ROUTES,
} from '@/features/auth/server'

const { rewrite: rewriteLLM } = rewritePath('/docs/*path', '/llms.mdx/*path')
const { rewrite: rewriteMdx } = rewritePath('/docs{/*path}.md{x}', '/llms.mdx{/*path}')

if (!GOOGLE_AUTH_CONFIGURED) {
  console.warn(
    '[AUTH] Google OAuth credentials not set — all private routes are running in open-access mode.',
  )
}

export default async function proxy(request: NextRequest) {
  const pathName = request.nextUrl.pathname
  const isPrivateRoute = RouteHandler.isPrivateRoute(pathName)

  // Private routes
  if (isPrivateRoute && GOOGLE_AUTH_CONFIGURED) {
    const session = await getAuthSession()

    // Redirect to login
    if (!session) {
      const signInUrl = urlBuilder({
        url: AUTH_ROUTES.SIGNIN,
        requestUrl: request.url,
        searchParams: {
          [AUTH_QUERY.CODE]: AUTH_CODE.SIGN_IN,
          [AUTH_QUERY.CALLBACK_URL]: request.nextUrl.pathname + request.nextUrl.search,
        },
      })

      return NextResponse.redirect(signInUrl)
    }

    // Redirect to AccessDenied with login
    const isAllowed = isActiveUserAllowed(session)

    if (!isAllowed) {
      const forbiddenUrl = urlBuilder({
        url: AUTH_ROUTES.ACCESS_DENIED,
        requestUrl: request.url,
        searchParams: {
          [AUTH_QUERY.CODE]: AUTH_CODE.ERROR,
          [AUTH_QUERY.ERROR]: AUTH_ERROR.ACCESS_DENIED,
          [AUTH_QUERY.CALLBACK_URL]: request.nextUrl.pathname + request.nextUrl.search,
        },
      })

      return NextResponse.redirect(forbiddenUrl)
    }
  }

  // Process txt, mdx URL rewrites
  const result = rewriteMdx(request.nextUrl.pathname)

  if (result) {
    return NextResponse.rewrite(new URL(result, request.nextUrl))
  }

  if (isMarkdownPreferred(request)) {
    const result = rewriteLLM(request.nextUrl.pathname)

    if (result) {
      return NextResponse.rewrite(new URL(result, request.nextUrl), {
        // this URL has two representations, selected by `Accept`
        headers: { Vary: 'Accept' },
      })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher:[
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|bmp|avif|svg|ico|css|js|webp)).*)',
  ],
}
