'use client'

import { useState } from 'react'
import { SearchBar } from '@/components/search-bar'
import { SearchResults } from '@/components/search-results'
import type { DocumentItem, PaginatedResponse } from '@/lib/api'
import { searchDocuments } from '@/lib/api'

export default function SearchPage() {
  const [searchState, setSearchState] = useState<
    'empty' | 'loading' | 'results'
  >('empty')
  const [searchResults, setSearchResults] = useState<
    PaginatedResponse<DocumentItem> | undefined
  >()
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [documentType, setDocumentType] = useState<'tos' | 'pp' | undefined>()
  const [currentPage, setCurrentPage] = useState(1)

  const handleSearch = (
    results: PaginatedResponse<DocumentItem>,
    query: string
  ) => {
    setSearchResults(results)
    setSearchState(results.items.length > 0 ? 'results' : 'empty')
    setCurrentPage(1)
    setSearchQuery(query)
  }

  const handleSearchStart = () => {
    setSearchState('loading')
    setError(null)
  }

  const handleSearchError = (error: Error) => {
    setError(error.message)
    setSearchState('empty')
  }

  const handleLoadMore = async () => {
    if (!searchResults || !searchQuery) return

    try {
      const nextPage = currentPage + 1
      const moreResults = await searchDocuments({
        search_text: searchQuery,
        document_type: documentType,
        page: nextPage,
        per_page: 6,
      })

      setSearchResults({
        ...moreResults,
        items: [...searchResults.items, ...moreResults.items],
      })
      setCurrentPage(nextPage)
    } catch (error) {
      console.error('Error loading more results:', error)
      setError(
        error instanceof Error ? error.message : 'Failed to load more results'
      )
    }
  }

  return (
    <div className='container max-w-7xl mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-6'>Search Documents</h1>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
        <div className='md:col-span-1'>
          <div className='bg-white dark:bg-black p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm'>
            <h2 className='text-xl font-semibold mb-4'>Search Filters</h2>

            <div className='mb-6'>
              <label className='block text-sm font-medium mb-2'>
                Document Type
              </label>
              <div className='space-y-2'>
                <label className='flex items-center space-x-2'>
                  <input
                    type='radio'
                    name='document_type'
                    checked={documentType === undefined}
                    onChange={() => setDocumentType(undefined)}
                    className='h-4 w-4'
                  />
                  <span>All Documents</span>
                </label>
                <label className='flex items-center space-x-2'>
                  <input
                    type='radio'
                    name='document_type'
                    checked={documentType === 'tos'}
                    onChange={() => setDocumentType('tos')}
                    className='h-4 w-4'
                  />
                  <span>Terms of Service</span>
                </label>
                <label className='flex items-center space-x-2'>
                  <input
                    type='radio'
                    name='document_type'
                    checked={documentType === 'pp'}
                    onChange={() => setDocumentType('pp')}
                    className='h-4 w-4'
                  />
                  <span>Privacy Policy</span>
                </label>
              </div>
            </div>

            <SearchBar
              onSearch={handleSearch}
              onSearchStart={handleSearchStart}
              onSearchError={handleSearchError}
              documentType={documentType}
            />
          </div>
        </div>

        <div className='md:col-span-3'>
          {error && (
            <div className='bg-red-50 text-red-800 p-4 rounded-lg mb-6'>
              <p className='font-medium'>Error</p>
              <p>{error}</p>
            </div>
          )}

          <SearchResults
            state={searchState}
            results={searchResults}
            onLoadMore={handleLoadMore}
          />
        </div>
      </div>
    </div>
  )
}
