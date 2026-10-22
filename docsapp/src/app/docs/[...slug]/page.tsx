import { notFound } from 'next/navigation'

import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
} from 'fumadocs-ui/layouts/docs/page'
import { createRelativeLink } from 'fumadocs-ui/mdx'
import { DocsPageProps } from 'fumadocs-ui/page'

import { getMDXComponents } from '@/components/mdx'

import { appDescription, appName } from '@/lib/constants'
import { createMetadata, getPageImageUrl } from '@/lib/metadata'
import { source } from '@/lib/source'

import type { Metadata } from 'next'

export default async function Page(props: PageProps<'/docs/[...slug]'>) {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page) notFound()

  const { body: MDX, toc, lastModified } = await page.data.load()
  const timestamp = lastModified ?? new Date()
  const pageProps = {} satisfies Partial<DocsPageProps>
  const markdownUrl = `${page?.url}.mdx`

  const lastModifiedDate = new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <DocsPage
      toc={toc}
      {...pageProps}
      // lastUpdate={new Date(page.data.lastModified)}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <div className="flex flex-row gap-2 items-center border-b pb-6">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
      </div>
      <div className="w-full text-sm text-zinc-500 ">
        Last updated on {lastModifiedDate}
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  )
}

export async function generateMetadata(
  props: PageProps<'/docs/[...slug]'>,
): Promise<Metadata> {
  const { slug = [] } = await props.params
  const page = source.getPage(slug)

  if (!page) {
    return createMetadata({
      title: 'Not found',
    })
  }

  const {
    description = appDescription,
    title = appName,
  } = page?.data

  const image = {
    url: getPageImageUrl(page).url,
    width: 1200,
    height: 630,
  }

  return createMetadata({
    title,
    description,
    openGraph: {
      url: `/docs/${page.slugs.join('/')}`,
      images: [image],
    },
    twitter: {
      images: [image],
    },
  })
}

export async function generateStaticParams() {
  return source.generateParams()
}
