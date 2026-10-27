import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { setTimeout as sleep } from 'node:timers/promises'

import { BASE_URL, IS_WINDOWS, PORT, READY_TIMEOUT_MS } from './constants'
import { ChildProcess } from '../types'

export const isServerUp = async () => {
  try {
    await fetch(BASE_URL, { redirect: 'manual' })

    return true
  } catch {
    return false
  }
}

export const waitForServer = async (
  server: ChildProcess | undefined,
  getServerLog: () => string,
) => {
  const deadline = Date.now() + READY_TIMEOUT_MS

  while (Date.now() < deadline) {
    if (server?.exitCode !== null) {
      const errMsg = `next start exited with code ${server?.exitCode}:\n${getServerLog()}`
      throw new Error(errMsg)
    }

    if (await isServerUp()) return

    await sleep(500)
  }

  const errMsg = `next start was not ready after ${READY_TIMEOUT_MS}ms:\n${getServerLog()}`
  throw new Error(errMsg)
}

export async function teardown(server: ChildProcess | undefined) {
  if (!server?.pid || server.exitCode !== null) return

  if (IS_WINDOWS) {
    server.kill()
  } else {
    process.kill(-server.pid, 'SIGTERM')
  }
}

export const startServer = (env: NodeJS.ProcessEnv) => {
  let output = ''
  const nextBin = createRequire(import.meta.url).resolve('next/dist/bin/next')

  // Start the Next.js server
  const server = spawn(process.execPath, [nextBin, 'start', '--port', String(PORT)], {
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
    // Own process group, so teardown also stops any workers next spawns
    detached: !IS_WINDOWS,
  })

  server.stdout?.on('data', (chunk) => { output += chunk })
  server.stderr?.on('data', (chunk) => { output += chunk })

  // A getter, so callers read the output collected so far rather than a copy
  return {
    server,
    getServerLog: () => output,
  }
}
