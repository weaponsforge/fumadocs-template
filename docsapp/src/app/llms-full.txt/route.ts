import { docsLlms } from '@/lib/llms'
import { getAuthSession } from '@/lib/session'
import { publicSource, source } from '@/lib/source'

export const revalidate = false

export async function GET() {
  const session = await getAuthSession()

  const scanned = session
    ? await docsLlms(source).full()
    : await docsLlms(publicSource).full()

  return new Response(scanned)
}
