'use client'

import { useState, useEffect } from 'react'
import { Database, AlertCircle } from 'lucide-react'

interface DocumentStats {
  tos_count: number
  pp_count: number
  total_count: number
}

// Renamed component to reflect its function (one-time fetch)
export function DocumentStatsDisplay() {
  const [stats, setStats] = useState<DocumentStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showColdStartNotice, setShowColdStartNotice] = useState(false)

  useEffect(() => {
    let noticeTimer: NodeJS.Timeout | null = null

    const fetchStats = async () => {
      setIsLoading(true)
      setError(null)
      // Don't show notice immediately, start a timer
      setShowColdStartNotice(false)
      noticeTimer = setTimeout(() => {
        // Only show if still loading after 3 seconds
        if (isLoading) {
          setShowColdStartNotice(true)
        }
      }, 3000) // 3 second delay

      const apiKey = process.env.NEXT_PUBLIC_API_KEY
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL

      if (!apiKey || !baseUrl) {
        console.error(
          'Error: NEXT_PUBLIC_API_KEY or NEXT_PUBLIC_BACKEND_URL is missing.'
        )
        setError('Configuration error.')
        setStats({ tos_count: 0, pp_count: 0, total_count: 0 }) // Show zeros on error
        setIsLoading(false)
        return
      }

      const statsUrl = `${baseUrl}/api/v1/documents/stats`

      try {
        console.log('Fetching stats from:', statsUrl)
        const response = await fetch(statsUrl, {
          headers: {
            Accept: 'application/json',
            'X-API-Key': apiKey,
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data: DocumentStats = await response.json()

        // Basic validation of fetched data
        if (
          typeof data?.tos_count === 'number' &&
          typeof data?.pp_count === 'number' &&
          typeof data?.total_count === 'number'
        ) {
          setStats(data)
        } else {
          console.warn('Received invalid stats format from API:', data)
          throw new Error('Invalid data format received')
        }
      } catch (err) {
        console.error('Failed to fetch document stats:', err)
        setError('Could not load stats.')
        setStats({ tos_count: 0, pp_count: 0, total_count: 0 }) // Show zeros on fetch error
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()

    return () => {
      // Clear the timer if the component unmounts
      if (noticeTimer) {
        clearTimeout(noticeTimer)
      }
    }
  }, []) // Empty dependency array ensures this runs only once on mount

  // Clear timer if loading finishes before 3 seconds
  useEffect(() => {
    if (!isLoading && showColdStartNotice === false) {
      // If loading finished AND the notice hasn't been shown yet (because timer didn't fire)
      // then ensure it doesn't show.
      // No need to explicitly clear timer here as the check in the timer callback handles it.
    }
  }, [isLoading, showColdStartNotice])

  // Function to hide notification when dismissed
  const handleDismissNotification = () => {
    setShowColdStartNotice(false)
  }

  // Integrated cold start notification
  const ColdStartAlert = () => {
    if (!showColdStartNotice || (!isLoading && !error)) return null

    return (
      <div className='fixed bottom-4 right-4 z-50 max-w-md p-4 bg-amber-100 border border-amber-200 rounded-lg shadow-lg dark:bg-amber-900 dark:border-amber-800'>
        <div className='flex items-start'>
          <div className='flex-shrink-0'>
            <AlertCircle className='h-5 w-5 text-amber-500' />
          </div>
          <div className='ml-3'>
            <h3 className='text-sm font-medium text-amber-800 dark:text-amber-200'>
              Loading Data
            </h3>
            <div className='mt-2 text-xs text-amber-700 dark:text-amber-300'>
              <p>
                Our service is starting up. Stats and document data may take a
                moment to appear. Please wait a few seconds.
              </p>
            </div>
            <div className='mt-3'>
              <button
                type='button'
                className='text-xs font-medium text-amber-800 dark:text-amber-200 hover:text-amber-600 dark:hover:text-amber-300'
                onClick={handleDismissNotification}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className='flex items-center gap-4 text-gray-600 dark:text-gray-400 text-sm sm:text-base'>
        {isLoading ? (
          <div className='flex items-center gap-2'>
            <Database className='h-4 w-4' />
            <span className='animate-pulse'>Loading stats...</span>
          </div>
        ) : error ? (
          <div className='flex items-center gap-2 text-red-600' title={error}>
            <Database className='h-4 w-4' />
            <span>Stats unavailable</span>
          </div>
        ) : stats ? (
          <>
            <div
              className='flex items-center gap-2'
              title='Total Documents Analyzed'
            >
              <Database className='h-4 w-4 text-gray-500' />
              <span className='font-semibold text-lg text-black dark:text-white'>
                {stats.total_count.toLocaleString()}
              </span>
              <span className='text-xs text-gray-500 dark:text-gray-400 hidden sm:inline'>
                Total
              </span>
            </div>
            <span className='text-gray-300 dark:text-gray-600'>|</span>
            <div
              className='flex items-center gap-1.5'
              title='Terms of Service Documents'
            >
              <span className='text-blue-500 font-semibold'>ToS:</span>
              <span className='font-medium text-base text-black dark:text-white'>
                {stats.tos_count.toLocaleString()}
              </span>
            </div>
            <span className='text-gray-300 dark:text-gray-600'>|</span>
            <div
              className='flex items-center gap-1.5'
              title='Privacy Policy Documents'
            >
              <span className='text-green-500 font-semibold'>PP:</span>
              <span className='font-medium text-base text-black dark:text-white'>
                {stats.pp_count.toLocaleString()}
              </span>
            </div>
          </>
        ) : null}
      </div>
      <ColdStartAlert />
    </>
  )
}
