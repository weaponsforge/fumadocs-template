import { update } from 'fumadocs-core/source'

import { docs } from 'collections/server'

/**
 * Builds the docs source excluding docs in the defined routes
 * @param {string[]} list of docs routes to exclude, eg., `/docs/secrets`
 * @returns Fumadocs `Source`
 */
export const buildCustomSource = (excludedRoutes: string[] = []) => {
  return update(docs.toFumadocsSource())
    .files((files) =>
      files.filter((file) => {
        const isFilePath = file?.data?.info?.fullPath

        if (!isFilePath) return true

        const fileFullPath = file.data.info.fullPath.replaceAll('\\', '/')

        return excludedRoutes.every((route) => !fileFullPath.includes(route))
      }),
    )
    .build()
}
