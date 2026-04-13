import { update } from 'fumadocs-core/source'

import { docs } from 'collections/server'

import { cleanSourceRoute } from '@/lib/utils'

interface IBuildCustomSource {
  excludedRoutes?: string[];
  includedRoutes?: string[];
}

/**
 * Builds the docs source by filtering the `excludedRoutes` or `includedRoutes` docs
 * @param {string[]} excludedRoutes list of docs routes to exclude, eg., `/docs/secrets`
 * @param {string[]} includedRoutes list of docs routes to include, all else are excluded.
 * @returns Fumadocs `Source`
 */
export const buildCustomSource = ({
  excludedRoutes,
  includedRoutes,
}: IBuildCustomSource) => {
  if (Array.isArray(excludedRoutes) && Array.isArray(includedRoutes)) {
    throw new Error('Only 1 of excludedRoutes[] or includedRoutes[] should be provided')
  }

  let cleanExcluded: string[] = []
  let cleanIncluded: string[] = []

  if (excludedRoutes) {
    cleanExcluded = excludedRoutes?.map(cleanSourceRoute)
  }

  if (includedRoutes) {
    cleanIncluded = includedRoutes?.map(cleanSourceRoute)
  }

  return update(docs.toFumadocsSource())
    .files((files) =>
      files.filter((file) => {
        const isFilePath = file?.data?.info?.fullPath

        if (!isFilePath) return true
        const fileFullPath = file.data.info.fullPath.replaceAll('\\', '/')
        const cleanFilePath = cleanSourceRoute(fileFullPath)

        if (excludedRoutes) {
          return cleanExcluded.every((route) => !cleanFilePath.includes(route))
        }

        if (includedRoutes) {
          return cleanIncluded.every((route) => cleanFilePath.includes(route))
        }
      }),
    )
    .build()
}
