import { isGoogleOauthSet } from '@/lib/utils'

export const appName = process.env.APP_NAME || 'Fumadocs Template'
export const appShortName = process.env.APP_SHORT_NAME || 'Fumadocs'
export const appDescription = process.env.APP_DESCRIPTION || 'Documentation website demo'

export const docsRoute = '/docs'
export const docsImageRoute = '/og/docs'
export const docsLlmsMdxRoute = '/llms.mdx'

// fill this with your actual GitHub info, for example:
export const gitConfig = {
  user: process.env.GH_USERNAME,
  repo: process.env.GH_REPOSITORY,
  branch: process.env.GH_REPO_DEFAULT_BRANCH,
}

export const baseUrl =
  process.env.NODE_ENV === 'development' || !process.env.BETTER_AUTH_URL
    ? new URL('http://localhost:3000')
    : new URL(`${process.env.BETTER_AUTH_URL}`)

export const GOOGLE_AUTH_CONFIGURED = isGoogleOauthSet()
