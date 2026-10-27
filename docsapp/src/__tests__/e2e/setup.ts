import { execSync } from 'node:child_process'
import { relative } from 'node:path'

import { findStaleBuildInput } from './lib/build'
import { env, PORT } from './lib/constants'
import { isServerUp, startServer, teardown, waitForServer } from './lib/server'

export async function setup() {
  if (await isServerUp()) {
    const errMsg = `Port ${PORT} is already in use. Stop that server or set e2e_PORT.`
    throw new Error(errMsg)
  }

  // Set e2e_SKIP_BUILD=1 to reuse the last build while iterating on tests.
  // A build older than the app or content is rebuilt anyway.
  const staleInput = process.env.e2e_SKIP_BUILD === '1'
    ? findStaleBuildInput()
    : null

  if (staleInput) {
    console.warn(`e2e_SKIP_BUILD=1 ignored: ${relative(process.cwd(), staleInput)} is newer than the last build. Rebuilding.`)
  }

  // No stdin, so the build never waits for Next.js' interactive upgrade prompt
  if (process.env.e2e_SKIP_BUILD !== '1' || staleInput) {
    execSync('npm run build', { env, stdio: ['ignore', 'inherit', 'inherit'] })
  }

  const { server, getServerLog } = startServer(env)

  try {
    await waitForServer(server, getServerLog)
  } catch (error) {
    await teardown(server)

    // Printed here because Vitest can crash while printing global setup errors
    console.error(error instanceof Error ? error.message : error)
    throw error
  }

  // Vitest runs this after every test file has finished
  return () => teardown(server)
}
