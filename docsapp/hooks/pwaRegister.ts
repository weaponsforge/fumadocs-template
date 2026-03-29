'use client'

import { useEffect } from 'react'

/**
 * Registers the service worker that handles PWA installation
 */
export const usePwaRegister = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => console.error('SW registration failed:', err))
    }
  }, [])

  return null
}
