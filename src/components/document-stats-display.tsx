'use client'

import { useState, useEffect } from 'react'
import { Database } from 'lucide-react'

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

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      setError(null)

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
  }, []) // Empty dependency array ensures this runs only once on mount

  return (
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
  )
}
