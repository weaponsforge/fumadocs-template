import { execSync } from 'node:child_process'

import { env, PORT } from './lib/constants'
import { isServerUp, startServer, teardown, waitForServer } from './lib/server'

export async function setup() {
  if (await isServerUp()) {
    const errMsg = `Port ${PORT} is already in use. Stop that server or set e2e_PORT.`
    throw new Error(errMsg)
  }

  // Set e2e_SKIP_BUILD=1 to reuse the last build while iterating on tests.
  // `npm run build` also regenerates .source/docs-routes.json.
  if (process.env.e2e_SKIP_BUILD !== '1') {
    execSync('npm run build', { env, stdio: 'inherit' })
  }

  const { server, getServerLog } = startServer(env)

  try {
    await waitForServer(server, getServerLog)
  } catch (error) {
    // Vitest only runs the returned teardown once setup() resolves
    await teardown(server)
    throw error
  }

  // Vitest runs this after every test file has finished
  return () => teardown(server)
}
