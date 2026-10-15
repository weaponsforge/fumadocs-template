import {
  llms,
  type LoaderConfig,
  type LoaderOutput,
} from 'fumadocs-core/source'

import { getSection } from '@/lib/source/navigation'
import { CATEGORY } from '@/lib/source/navigation'

export const docsLlms = <T extends LoaderConfig>(docsSource: LoaderOutput<T>) => {
  return llms(docsSource, {
    renderPage: async (page) => {
      if (
        !('getText' in page.data) ||
        !(Array.isArray(page.slugs))
      ) {
        return ''
      }

      const slug = page.slugs?.length >= 1 ? page.slugs[0] : undefined
      const section = getSection(slug)
      const category = CATEGORY[section] ?? section
      let processed: string

      try {
        const data = page.data as {
          getText(key: string): Promise<string>
        }

        processed = await data.getText('processed')
      } catch {
        return ''
      }

      return `# ${category}: ${page.data.title}
    URL: ${page.url}

    ${page?.data?.description ?? ''}

    ${processed}`
    },
  })
}
