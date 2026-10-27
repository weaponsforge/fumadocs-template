/**
 * Helper to get single domain for hosted domain parameter
 * (Google's hosted domain restriction)
 * @returns {string|undefined} email domain
 */
export const getHostedDomain = (): string | undefined => {
  const allowedDomains = getMultipleHostedDomains()

  return allowedDomains.length === 1 ? allowedDomains[0] : undefined
}

/**
 * Returns a list of allowed Google email domains `ALLOWED_EMAIL_DOMAINS`
 * @returns {string[]} allowed email domains
 */
export const getMultipleHostedDomains = (): string[] => {
  const allowedDomains = (process.env.ALLOWED_EMAIL_DOMAINS || '')
    .split(',')
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean)

  return allowedDomains
}

/**
 * Returns a list of allowed emails `ALLOWED_EMAILS`
 * @returns {string[]} allowed emails
 */
export const getAllowedEmails = (): string[] => {
  const allowedEmails = (process.env.ALLOWED_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  return allowedEmails
}

/**
 * Removes docs route segments enclosed in parenthesis eg., "(guides)"
 * @param {string} docsRoute Full file path to a docs source file
 * @returns Docs route string without segments enclosed in parenthesis
 */
export const cleanSourceRoute = (docsRoute: string) => {
  const segments = docsRoute.split('/')

  const build = segments.reduce((list, item) => {
    if (!item.startsWith('(')) {
      list = list + '/' + item
    }

    return list.replace('//', '/')
  }, '')

  return build
}

type UrlBuilderParams = {
  url: string;
  requestUrl: string;
  searchParams: Record<string, string>;
}

/** Builds a new URL with search query parameters */
export const urlBuilder = (params: UrlBuilderParams) => {
  const { url, requestUrl, searchParams } = params
  const newUrl = new URL(url, requestUrl)

  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined) continue
    newUrl.searchParams.set(key, value)
  }

  return newUrl
}

/**
 * Checks if an email is allowed: it exists in the whitelist
 * and it came from a supported email domain
 * @param rawEmail - email
 * @returns {boolean}
 */
export const isEmailAllowed = (rawEmail: string) => {
  const email = rawEmail?.toLowerCase().trim()

  if (!email || !email.includes('@')) {
    return false
  }

  const allowedDomains = getMultipleHostedDomains()
  const allowedEmails = getAllowedEmails()
  const domain = email.split('@')[1]

  const isAllowedDomain =
    allowedDomains.length === 0
      ? true // If no domains specified, allow all domains
      : allowedDomains.includes(domain)

  // Check email restriction (if ALLOWED_EMAILS is set)
  const isAllowedEmail =
      allowedEmails.length === 0
        ? true // If no emails specified, allow all emails
        : allowedEmails.includes(email)

  return isAllowedDomain && isAllowedEmail
}

/**
 * Checks if Google OAuth is configured with the existence of
 * environment variables
 */
export const isGoogleOauthSet = (): boolean => {
  return Boolean(process.env.GOOGLE_CLIENT_ID) &&
    Boolean(process.env.GOOGLE_CLIENT_SECRET)
}

/**
 * Converts a section slug to an upper snake case key,
 * eg. `stats-calculator` → `STATS_CALCULATOR`
 */
export const toConstKey = (slug: string) => {
  return slug.replace(/[^a-zA-Z0-9]+/g, '_').toUpperCase()
}

/**
 * Percent-decodes a path (including `%2F`) until it stops changing, so the gate never
 * decodes fewer layers than a route does. Docs pages decode once; `/og` and
 * `/llms.mdx` decode twice (Next.js param + Fumadocs `getPage()`), so
 * `/og/s%2565crets/image.webp` serves the `/docs/secrets` image.
 * @param {string} pathname - url route, possibly percent-encoded
 * @returns {string} Fully decoded path
 * @throws {URIError} On malformed encoding, or encoding nested too deep
 */
export const decodePathname = ({
  pathname, maxDecodePasses = 5,
}: { pathname: string, maxDecodePasses: number }): string => {
  let decoded = pathname

  for (let pass = 0; pass < maxDecodePasses; pass++) {
    const next = decodeURIComponent(decoded)

    if (next === decoded) return decoded
    decoded = next
  }

  const errMsg = `Path is still encoded after ${maxDecodePasses} decodes: ${pathname}`
  throw new URIError(errMsg)
}
