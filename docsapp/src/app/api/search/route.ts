import { createFromSource } from 'fumadocs-core/search/server'

import { PRIVATE_ROUTES } from '@/lib/constants'
import { getAuthSession } from '@/lib/session'
import { source } from '@/lib/source'

const IS_BUILD_STATIC = process.env.IS_BUILD_STATIC === '1'

export async function GET(req: Request) {
  // https://docs.orama.com/docs/orama-js/supported-languages
  const { staticGET, GET: ssrGET } = createFromSource(source, {
    language: 'english',
  })

  // static search (used when generating static JSON)
  if (IS_BUILD_STATIC) {
    return staticGET()
  }

  // Dynamic server-side search with secret-result filtering
  const session = await getAuthSession()
  const res = await ssrGET(req)

  // Return all search results if there's a session
  if (session) {
    return res
  }

  // If there's NO session, filter out any results that point into the PRIVATE_ROUTES.
  // TO-DO: optimize the filter method
  const results: Array<{ url?: unknown }> = await res.json()

  const filtered = results.filter((item) => {
    const url = typeof item.url === 'string' ? item.url : ''

    return !PRIVATE_ROUTES.some((prefix) => url.startsWith(prefix))
  })

  return Response.json(filtered, { status: res.status })
}
