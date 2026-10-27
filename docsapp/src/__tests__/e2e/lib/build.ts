import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

import { BUILD_ID_FILE, BUILD_INPUTS, TESTS_DIR } from './constants'

const listFiles = (path: string): string[] => {
  if (!existsSync(path)) return []
  if (statSync(path).isFile()) return [path]

  return readdirSync(path, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name))
}

/**
 * Returns the first build input changed since the last `npm run build`, or the build
 * itself if there is none. Tests read the current content, so an older build would
 * 404 new private pages, which counts as blocked, and leave their gates untested.
 */
export const findStaleBuildInput = (): string | null => {
  if (!existsSync(BUILD_ID_FILE)) return BUILD_ID_FILE

  const builtAt = statSync(BUILD_ID_FILE).mtimeMs

  return BUILD_INPUTS
    .flatMap(listFiles)
    .find(
      (file) => !file.startsWith(TESTS_DIR) &&
      statSync(file).mtimeMs > builtAt,
    ) ?? null
}
