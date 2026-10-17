import { docsLlms } from '@/lib/llms'
import { getAuthSession, isActiveUserAllowed } from '@/lib/session'
import { getSource } from '@/lib/source'

export const revalidate = false

export async function GET() {
  const session = await getAuthSession()

  const docSource = getSource({
    isPrivate: isActiveUserAllowed(session),
  })

  return new Response(await docsLlms(docSource).index())
}
