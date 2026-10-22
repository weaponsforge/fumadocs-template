import { afterEach, describe, expect, it, vi } from 'vitest'

import { isEmailAllowed } from '@/lib/utils'

const setAllowlist = ({ domains = '', emails = '' }: { domains?: string, emails?: string }) => {
  vi.stubEnv('ALLOWED_EMAIL_DOMAINS', domains)
  vi.stubEnv('ALLOWED_EMAILS', emails)
}

describe('isEmailAllowed', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it.each(['', '   ', 'not-an-email', undefined as unknown as string])(
    'rejects %j',
    (email) => {
      setAllowlist({})
      expect(isEmailAllowed(email)).toBe(false)
    },
  )

  it('allows any email when no allowlist is set', () => {
    setAllowlist({})

    expect(isEmailAllowed('anyone@example.com')).toBe(true)
  })

  describe('ALLOWED_EMAIL_DOMAINS', () => {
    it('allows only emails from a listed domain', () => {
      setAllowlist({ domains: 'gmail.com' })

      expect(isEmailAllowed('user@gmail.com')).toBe(true)
      expect(isEmailAllowed('user@example.com')).toBe(false)
    })

    it('does not treat subdomains as the listed domain', () => {
      setAllowlist({ domains: 'gmail.com' })

      expect(isEmailAllowed('user@mail.gmail.com')).toBe(false)
    })

    it('accepts a comma-separated list with spaces and mixed case', () => {
      setAllowlist({ domains: ' Example.com , gmail.com ,' })

      expect(isEmailAllowed('user@example.com')).toBe(true)
      expect(isEmailAllowed('user@gmail.com')).toBe(true)
      expect(isEmailAllowed('user@other.com')).toBe(false)
    })

    it('ignores case and surrounding whitespace in the email', () => {
      setAllowlist({ domains: 'gmail.com' })

      expect(isEmailAllowed('  User@GMAIL.com ')).toBe(true)
    })
  })

  describe('ALLOWED_EMAILS', () => {
    it('allows only listed emails, ignoring case', () => {
      setAllowlist({ emails: 'User@gmail.com, tester@gmail.com' })

      expect(isEmailAllowed('user@gmail.com')).toBe(true)
      expect(isEmailAllowed('TESTER@gmail.com')).toBe(true)
      expect(isEmailAllowed('someone@gmail.com')).toBe(false)
    })
  })

  describe('both allowlists set', () => {
    it('requires the email to pass both lists', () => {
      setAllowlist({ domains: 'example.com', emails: 'user@gmail.com,admin@example.com' })

      expect(isEmailAllowed('admin@example.com')).toBe(true)
      // listed email, but its domain isn't allowed
      expect(isEmailAllowed('user@gmail.com')).toBe(false)
      // allowed domain, but the email isn't listed
      expect(isEmailAllowed('other@example.com')).toBe(false)
    })
  })
})
