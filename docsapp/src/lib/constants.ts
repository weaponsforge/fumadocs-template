export const appName = process.env.APP_NAME || 'Fumadocs Template'
export const docsRoute = '/docs'
export const docsImageRoute = '/og/docs'
export const docsContentRoute = '/llms.mdx/docs'

// fill this with your actual GitHub info, for example:
export const gitConfig = {
  user: process.env.GH_USERNAME,
  repo: process.env.GH_REPOSITORY,
  branch: process.env.GH_REPO_DEFAULT_BRANCH,
}

export const baseUrl =
  process.env.NODE_ENV === 'development' || !process.env.BASE_URL
    ? new URL('http://localhost:3000')
    : new URL(`https://${process.env.BASE_URL}`)
