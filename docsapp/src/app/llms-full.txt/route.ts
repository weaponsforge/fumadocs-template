import { getAuthSession } from '@/lib/session'
import { PRIVATE_ROUTES } from '@/lib/shared'
import { getLLMText, publicSource, source } from '@/lib/source'

export const revalidate = false

export async function GET() {
  const session = await getAuthSession()
  let scan

  if (!session) {
    scan = publicSource.getPages()
      .filter(item => PRIVATE_ROUTES.every(route => !item.url.includes(route)))
      .map(getLLMText)
  } else {
    scan = source.getPages().map(getLLMText)
  }

  const scanned = await Promise.all(scan)

  return new Response(scanned.join('\n\n'))
}
