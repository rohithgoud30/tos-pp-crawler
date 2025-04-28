'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SearchResults } from '@/components/search-results'
import {
  searchDocuments,
  type DocumentItem,
  type PaginatedResponse,
} from '@/lib/api'

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<DocumentItem[]>([])
  const [resultsPagination, setResultsPagination] =
    useState<PaginatedResponse<DocumentItem> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize search query from URL on page load
  useEffect(() => {
    const initialQuery = searchParams.get('q')
    if (initialQuery) {
      setQuery(initialQuery)
      performSearch(initialQuery)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await searchDocuments({
        search_text: searchQuery,
        page: 1,
        per_page: 10,
      })

      setResults(response.items)
      setResultsPagination(response)
    } catch (err) {
      console.error('Search error:', err)
      setError('Failed to perform search. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    if (!query.trim()) {
      setError('Please enter a search term')
      return
    }

    // Clear previous error
    setError(null)

    // Update URL with search query
    const url = new URL(window.location.href)
    url.searchParams.set('q', query)
    window.history.pushState({}, '', url.toString())

    performSearch(query)
  }

  return (
    <div className='min-h-screen bg-white dark:bg-black'>
      <main className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='flex flex-col items-center gap-6 mb-8'>
          <h1 className='text-4xl font-bold text-center text-black dark:text-white'>
            Find Website Legal Documents
          </h1>
          <p className='text-center text-gray-500 dark:text-gray-400 max-w-3xl'>
            Search for Terms of Service and Privacy Policy documents from
            companies across the web
          </p>
        </div>

        {/* Main search bar */}
        <div className='max-w-2xl mx-auto mb-12'>
          <form
            onSubmit={handleSearch}
            className='flex flex-col sm:flex-row gap-2'
          >
            <div className='relative w-full'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
              <Input
                type='text'
                placeholder='Search by company name or website...'
                className='pl-10 py-6 h-12 w-full border-gray-300 dark:border-gray-700'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button
              type='submit'
              className='bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-12 min-w-[120px] flex-shrink-0'
            >
              Search
            </Button>
          </form>
        </div>

        {/* Error message */}
        {error && (
          <div className='bg-red-50 dark:bg-red-900/20 p-4 rounded-md mb-8 max-w-3xl mx-auto'>
            <p className='text-red-800 dark:text-red-300'>{error}</p>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className='text-center py-10'>
            <p className='text-gray-500 dark:text-gray-400'>Searching...</p>
          </div>
        )}

        {/* Results */}
        {!isLoading && query && results.length > 0 && (
          <div className='mt-8'>
            <h2 className='text-2xl font-semibold mb-6 text-black dark:text-white'>
              Search Results
            </h2>
            <SearchResults
              state='results'
              results={{
                items: results,
                total: resultsPagination?.total || results.length,
                page: resultsPagination?.page || 1,
                per_page: resultsPagination?.per_page || 10,
                total_pages: resultsPagination?.total_pages || 1,
                has_next: resultsPagination?.has_next || false,
                has_prev: resultsPagination?.has_prev || false,
              }}
              onLoadMore={() =>
                router.push(`/results?q=${encodeURIComponent(query)}`)
              }
            />

            {/* Display total results count */}
            {resultsPagination && (
              <p className='text-sm text-gray-500 dark:text-gray-400 mt-4'>
                Showing {results.length} of {resultsPagination.total} results
              </p>
            )}

            {/* View all results button */}
            {resultsPagination && resultsPagination.total > results.length && (
              <div className='mt-8 text-center'>
                <Button
                  onClick={() =>
                    router.push(`/results?q=${encodeURIComponent(query)}`)
                  }
                  variant='outline'
                >
                  View All Results
                </Button>
              </div>
            )}
          </div>
        )}

        {/* No results */}
        {!isLoading && query && results.length === 0 && (
          <div className='text-center py-12'>
            <p className='text-xl font-medium mb-2 text-black dark:text-white'>
              No results found
            </p>
            <p className='text-gray-500 dark:text-gray-400'>
              Try a different search term or check your spelling
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
