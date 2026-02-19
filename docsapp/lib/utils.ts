/**
 * Helper to get single domain for hosted domain parameter
 * (Google's hosted domain restriction)
 * @returns {string|undefined} email domain
 */
export const getHostedDomain = (): string | undefined => {
  const allowedDomains = (process.env.ALLOWED_EMAIL_DOMAINS || "")
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);

  return allowedDomains.length === 1 ? allowedDomains[0] : undefined;
};

/**
 * Returns a list of allowed Google email domains `ALLOWED_EMAIL_DOMAINS`
 * @returns {string[]} allowed email domains
 */
export const getMultipleHostedDomains = (): string[] => {
  const allowedDomains = (process.env.ALLOWED_EMAIL_DOMAINS || "")
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);

  return allowedDomains;
};

/**
 * Returns a list of allowed emails `ALLOWED_EMAILS`
 * @returns {string[]} allowed emails
 */
export const getAllowedEmails = (): string[] => {
  const allowedEmails = (process.env.ALLOWED_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return allowedEmails;
};
