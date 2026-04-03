import { llms } from 'fumadocs-core/source'

import { getAuthSession } from '@/lib/session'
import { publicSource, source } from '@/lib/source'

export const revalidate = false

export async function GET() {
  const session = await getAuthSession()

  if (!session) {
    return new Response(llms(publicSource).index())
  }

  return new Response(llms(source).index())
}
