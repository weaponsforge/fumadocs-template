import {
  BASE_URL,
  SIGN_IN_ROUTE,
} from './constants'

export const request = (path: string, headers: Record<string, string> = {}) => {
  return fetch(new URL(path, BASE_URL), { headers, redirect: 'manual' })
}

/**
 * Returns the sign-in `callbackURL` if the response redirects to sign-in, else `null`
 */
export const getSignInCallback = (res: Response) => {
  const location = res.headers.get('location')

  if (res.status !== 307 || !location) return null

  const url = new URL(location, BASE_URL)

  return url.pathname === SIGN_IN_ROUTE
    ? url.searchParams.get('callbackURL')
    : null
}

/**
 * Follows redirects that don't go to sign-in, eg. trailing slash removal or
 * the `?_rsc` cache-busting param Next.js adds to RSC requests
 */
export const requestFollowingRedirects = async (
  path: string,
  headers: Record<string, string> = {},
) => {
  let res = await request(path, headers)

  for (let hop = 0; hop < 5; hop++) {
    const location = res.headers.get('location')
    const isRedirect = res.status >= 300 && res.status < 400

    if (!isRedirect || !location || getSignInCallback(res) !== null) break
    res = await request(location, headers)
  }

  return res
}
