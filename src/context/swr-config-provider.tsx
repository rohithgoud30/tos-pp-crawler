import { ReactNode } from 'react'
import { SWRConfig } from 'swr'

interface SWRConfigProviderProps {
  children: ReactNode
}

/**
 * Global SWR configuration provider for application-wide caching settings
 */
export function SWRConfigProvider({ children }: SWRConfigProviderProps) {
  return (
    <SWRConfig
      value={{
        // Global configuration options
        revalidateOnFocus: false, // Don't revalidate on window focus
        revalidateIfStale: false, // Don't automatically revalidate stale data
        dedupingInterval: 5 * 60 * 1000, // 5 minutes - deduplicate requests within this time
        errorRetryCount: 2, // Retry failed requests twice
        focusThrottleInterval: 10000, // Throttle revalidation on focus
        // Custom fetcher to handle errors and logging
        fetcher: (resource: string) =>
          fetch(resource).then((res) => res.json()),
        suspense: false, // Disable React Suspense
        // Avoid LocalStorage persistence that was causing type errors
      }}
    >
      {children}
    </SWRConfig>
  )
}
