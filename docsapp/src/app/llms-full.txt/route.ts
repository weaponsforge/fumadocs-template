import { getAuthSession } from '@/lib/session'
import { getLLMText, publicSource, source } from '@/lib/source'

export const revalidate = false

export async function GET() {
  const session = await getAuthSession()
  let scan

  if (!session) {
    scan = publicSource
      .getPages()
      .map(getLLMText)
  } else {
    scan = source.getPages().map(getLLMText)
  }

  const scanned = await Promise.all(scan)

  return new Response(scanned.join('\n\n'))
}
