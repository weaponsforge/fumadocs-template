import Link from 'next/link'

import { appName } from '@/lib/constants'
import { getAppVersion } from '@/lib/utils'

export default function Footer () {
  const appVersion = getAppVersion()

  return (
    <div className="w-full max-w-[1400px] mx-auto p-10 text-center">
      <div className="border border-x-0 border-b-0 p-4 pt-8 pb-0">
        <div className="section-label text-xs font-light leading-4">
          {appName}&nbsp;&nbsp;| &nbsp;
          <Link href="#" className="hover:underline">Privacy</Link>&nbsp;&nbsp;| &nbsp;
          <Link href="#" className="hover:underline">Terms of Service</Link><br />
          Copyright © 2026&nbsp;
          <span className="text-brand">@</span>
          <a
            href="https://github.com/weaponsforge/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand hover:underline"
          >
            <span className="text-brand">weaponsforge</span>
          </a>. All rights reserved.

          <div>
            {appVersion}
          </div>
        </div>
      </div>
    </div>
  )
}
