import { SECTIONS } from '@/lib/routes/routes'

export const CATEGORY = {
  [SECTIONS.CHARACTERS]: 'MU Online Characters',
  [SECTIONS.WEAPONS]: 'MU Online Weapons',
  [SECTIONS.SECRETS]: 'MU Online Secrets / Tips',
  [SECTIONS.STATS_CALCULATOR]: 'Character Stats Calculator',
}

export function getSection(path: string | undefined) {
  if (!path) return SECTIONS.CHARACTERS
  const [dir] = path.split('/', 1)
  if (!dir) return SECTIONS.CHARACTERS

  return (
    {
      [SECTIONS.WEAPONS]: SECTIONS.WEAPONS,
      [SECTIONS.SECRETS]: SECTIONS.SECRETS,
      [SECTIONS.STATS_CALCULATOR]: SECTIONS.STATS_CALCULATOR,
    }[dir] ?? SECTIONS.CHARACTERS
  )
}
