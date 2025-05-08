'use client'

import { ReactNode } from 'react'
import { SWRConfig } from 'swr'

interface SWRConfigProviderProps {
  children: ReactNode
}

/**
 * Global SWR configuration provider for application-wide caching settings
 */
export function SWRConfigProvider({ children }: SWRConfigProviderProps) {
  // Define config as a variable to avoid passing functions directly during prerendering
  const swrConfig = {
    // Global configuration options
    revalidateOnFocus: false, // Don't revalidate on window focus
    revalidateIfStale: true, // Set to true to revalidate stale data
    dedupingInterval: 5 * 60 * 1000, // 5 minutes - deduplicate requests within this time
    errorRetryCount: 2, // Retry failed requests twice
    focusThrottleInterval: 10000, // Throttle revalidation on focus
    // Custom fetcher to handle errors and logging
    fetcher: (resource: string) => fetch(resource).then((res) => res.json()),
    suspense: false, // Disable React Suspense
    // Configure the provider to handle browser refresh better
    provider: () => new Map(), // Create a new cache instance on each page load
  }

  return <SWRConfig value={swrConfig}>{children}</SWRConfig>
}
