import { createFromSource } from 'fumadocs-core/search/server'

import { getAuthSession, isActiveUserAllowed } from '@/lib/session'
import { getSource } from '@/lib/source'

const IS_BUILD_STATIC = process.env.IS_BUILD_STATIC === '1'

export async function GET(req: Request) {
  const session = await getAuthSession()

  const docSource = getSource({
    isPrivate: isActiveUserAllowed(session),
  })

  // https://docs.orama.com/docs/orama-js/supported-languages
  const { staticGET, GET: ssrGET } = createFromSource(docSource, {
    language: 'english',
  })

  // static search (used when generating static JSON)
  if (IS_BUILD_STATIC) {
    return staticGET()
  }

  const res = await ssrGET(req)

  return res
}
