import { config as privateRoutes } from '@/proxy'

export const PRIVATE_ROUTES = privateRoutes.matcher.map((item) =>
  item.replace('/:path*', ''),
)

export const appName = process.env.APP_NAME
export const docsRoute = '/docs'
export const docsImageRoute = '/og/docs'
export const docsContentRoute = '/llms.mdx/docs'

// fill this with your actual GitHub info, for example:
export const gitConfig = {
  user: process.env.GH_USERNAME,
  repo: process.env.GH_REPOSITORY,
  branch: process.env.GH_REPO_DEFAULT_BRANCH,
}
