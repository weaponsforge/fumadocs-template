import { docsLlms } from '@/lib/llms'
import { getAuthSession, isActiveUserAllowed } from '@/lib/session'
import { publicSource, source } from '@/lib/source'

export const revalidate = false

export async function GET() {
  const session = await getAuthSession()

  const scanned = isActiveUserAllowed(session)
    ? await docsLlms(source).full()
    : await docsLlms(publicSource).full()

  return new Response(scanned)
}
