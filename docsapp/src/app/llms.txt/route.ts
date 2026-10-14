import { docsLlms } from '@/lib/llms'
import { getAuthSession } from '@/lib/session'
import { publicSource, source } from '@/lib/source'

export const revalidate = false

export async function GET() {
  const session = await getAuthSession()

  return session
    ? new Response(await docsLlms(source).index())
    : new Response(await docsLlms(publicSource).index())
}
