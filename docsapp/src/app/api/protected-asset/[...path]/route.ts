import { readFile } from 'node:fs/promises'
import { join, resolve, sep } from 'node:path'

import { NextResponse } from 'next/server'

import { GOOGLE_AUTH_CONFIGURED } from '@/lib/constants'
import { getAuthSession, isActiveUserAllowed } from '@/lib/session'

/**
 * Serves auth-protected media assets in protected (private) page routes
 * @param req - Next request
 * @param context - Route path or parameters
 * @returns NextResponse
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
// --> Needed for dynamic route params typing
export async function GET(_: Request, context?: any) {
  const session = await getAuthSession()
  const PROTECTED_FILE_PATH = 'protected'
  let filePathArray = ['images', 'default.png']

  if (GOOGLE_AUTH_CONFIGURED && !isActiveUserAllowed(session)) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const ctxParams = await context.params

  if (Array.isArray(ctxParams?.path)) {
    filePathArray = ctxParams?.path
  }

  // Resolve against the protected root and confirm the result stays inside it.
  // Path segments are URL-decoded by Next, so `..` traversal must be rejected
  // before touching the filesystem.
  const baseDir = join(process.cwd(), PROTECTED_FILE_PATH)
  const filePath = resolve(baseDir, ...filePathArray)

  if (filePath !== baseDir && !filePath.startsWith(baseDir + sep)) {
    return new NextResponse('Not found', { status: 404 })
  }

  try {
    const file = (await readFile(filePath)) as unknown

    return new NextResponse(file as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'private, no-store',
      },
    })
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
}
