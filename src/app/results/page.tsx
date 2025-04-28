'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import {
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  Globe,
  Clock,
  Eye,
  Tag,
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  searchDocuments,
  getDocuments,
  type DocumentItem,
  type PaginatedResponse,
} from '@/lib/api'

export default function ResultsPage() {
  const searchParams = useSearchParams()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [documentTypeFilter, setDocumentTypeFilter] = useState<
    'tos' | 'pp' | undefined
  >(undefined)
  const [sortOption, setSortOption] = useState('updated_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [resultsPerPage, setResultsPerPage] = useState(6)
  const [displayedResults, setDisplayedResults] = useState<DocumentItem[]>([])
  const [resultsPagination, setResultsPagination] =
    useState<PaginatedResponse<DocumentItem> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  // Load initial URL parameters
  useEffect(() => {
    const queryParam = searchParams.get('q')
    const typeParam = searchParams.get('type') as 'tos' | 'pp' | undefined
    const perPageParam = searchParams.get('perPage')
    const sortParam = searchParams.get('sort')
    const orderParam = searchParams.get('order') as 'asc' | 'desc' | undefined

    console.log('Initial URL parameters:', {
      queryParam,
      typeParam,
      perPageParam,
      sortParam,
      orderParam,
    })

    // Track if we should perform a search after setting state
    let shouldSearch = false
    let shouldUpdateUrl = false
    let actualTypeFilter: 'tos' | 'pp' | undefined = undefined
    let actualSortOption = 'updated_at'
    let actualSortOrder: 'asc' | 'desc' = 'desc'
    let actualPerPage = 6

    if (queryParam) {
      setSearchQuery(queryParam)
      shouldSearch = true
      shouldUpdateUrl = true
    }

    if (typeParam && ['tos', 'pp'].includes(typeParam)) {
      console.log('Setting document type filter to:', typeParam)
      setDocumentTypeFilter(typeParam)
      actualTypeFilter = typeParam as 'tos' | 'pp'
      shouldUpdateUrl = true
    }

    if (perPageParam) {
      const perPageValue = Number.parseInt(perPageParam, 10)
      if ([6, 9, 12, 15].includes(perPageValue)) {
        setResultsPerPage(perPageValue)
        actualPerPage = perPageValue
        shouldUpdateUrl = true
      }
    }

    if (
      sortParam &&
      ['updated_at', 'company_name', 'url', 'views'].includes(sortParam)
    ) {
      setSortOption(sortParam)
      actualSortOption = sortParam
      shouldUpdateUrl = true
    }

    if (orderParam && ['asc', 'desc'].includes(orderParam)) {
      setSortOrder(orderParam)
      actualSortOrder = orderParam
      shouldUpdateUrl = true
    }

    // Update URL to ensure a consistent state
    if (shouldUpdateUrl) {
      const url = new URL(window.location.href)

      // Only include parameters with actual values
      if (queryParam) {
        url.searchParams.set('q', queryParam)
      }

      if (actualTypeFilter) {
        url.searchParams.set('type', actualTypeFilter)
      } else {
        url.searchParams.delete('type')
      }

      url.searchParams.set('perPage', actualPerPage.toString())
      url.searchParams.set('sort', actualSortOption)
      url.searchParams.set('order', actualSortOrder)

      // Replace current state to prevent multiple history entries
      window.history.replaceState({}, '', url.toString())
    }

    // If we have a search query in the URL, automatically perform search
    if (shouldSearch) {
      setHasSearched(true)

      // Use timeout to ensure state updates have been applied
      setTimeout(() => {
        console.log('Performing search with document type:', actualTypeFilter)
        performSearchWithParams(
          queryParam,
          actualTypeFilter,
          actualSortOption,
          actualSortOrder,
          1,
          actualPerPage
        )
      }, 100) // Increased timeout for state updates
    } else {
      // Load all documents if no search
      loadInitialDocuments(
        actualTypeFilter,
        actualSortOption,
        actualSortOrder,
        actualPerPage
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Load initial documents without search query
  const loadInitialDocuments = async (
    docType: 'tos' | 'pp' | undefined,
    sort: string,
    order: 'asc' | 'desc',
    perPage: number
  ) => {
    setIsLoading(true)
    setError(null)

    try {
      const results = await getDocuments({
        document_type: docType,
        sort_by: sort,
        sort_order: order,
        page: 1,
        per_page: perPage,
      })

      setResultsPagination(results)
      setDisplayedResults(results.items)
      setHasSearched(true)
    } catch (err) {
      console.error('Error loading documents:', err)
      setError('Failed to load documents. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Function that uses direct parameters instead of relying on state
  const performSearchWithParams = async (
    query: string | null,
    docType: 'tos' | 'pp' | undefined,
    sort: string,
    order: 'asc' | 'desc',
    page: number,
    perPage: number
  ) => {
    if (!query) return

    console.log('Search with direct params:', {
      query,
      docType,
      sort,
      order,
      page,
      perPage,
    })
    setIsLoading(true)
    setError(null)

    try {
      const results = await searchDocuments({
        search_text: query,
        document_type: docType,
        sort_by: sort,
        sort_order: order,
        page: page,
        per_page: perPage,
      })

      setResultsPagination(results)
      setDisplayedResults(results.items)
    } catch (err) {
      console.error('Search error:', err)
      setError('Search failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle explicit search action
  const handleSearch = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }

    if (!searchQuery.trim()) {
      setError('Please enter a search term')
      return
    }

    // Clear any previous errors
    setError(null)

    setCurrentPage(1)
    setHasSearched(true)

    // Update URL
    const url = new URL(window.location.href)
    url.searchParams.set('q', searchQuery)
    if (documentTypeFilter) {
      url.searchParams.set('type', documentTypeFilter)
    } else {
      url.searchParams.delete('type')
    }
    url.searchParams.set('perPage', resultsPerPage.toString())
    url.searchParams.set('sort', sortOption)
    url.searchParams.set('order', sortOrder)
    window.history.replaceState({}, '', url.toString())

    // Perform search
    performSearch()
  }

  // Actual search logic separated from event handler
  const performSearch = () => {
    console.log('Performing search with filter:', documentTypeFilter)
    performSearchWithParams(
      searchQuery,
      documentTypeFilter,
      sortOption,
      sortOrder,
      currentPage,
      resultsPerPage
    )
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)

    // If we're searching, update search with new page
    if (searchQuery) {
      performSearchWithParams(
        searchQuery,
        documentTypeFilter,
        sortOption,
        sortOrder,
        page,
        resultsPerPage
      )
    } else {
      // Otherwise just load documents for the page
      loadInitialDocuments(
        documentTypeFilter,
        sortOption,
        sortOrder,
        resultsPerPage
      )
    }
  }

  // Document type display
  const getDocumentTypeLabel = () => {
    if (documentTypeFilter === 'tos') {
      return 'Terms of Service'
    } else if (documentTypeFilter === 'pp') {
      return 'Privacy Policy'
    } else {
      return 'All Documents'
    }
  }

  // Document type badges
  const getDocumentTypeBadges = (doc: DocumentItem) => {
    return (
      <div className='flex gap-2'>
        {doc.document_type === 'tos' ? (
          <Badge className='bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white'>
            <Tag className='h-3 w-3 mr-1' />
            ToS
          </Badge>
        ) : doc.document_type === 'pp' ? (
          <Badge className='bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white'>
            <Tag className='h-3 w-3 mr-1' />
            PP
          </Badge>
        ) : null}
      </div>
    )
  }

  // Handle document type filter change
  const handleDocumentTypeChange = (value: string) => {
    let docType: 'tos' | 'pp' | undefined

    if (value === 'tos' || value === 'pp') {
      docType = value
    } else {
      docType = undefined // "all" case
    }

    setDocumentTypeFilter(docType)

    // Update URL parameter
    const url = new URL(window.location.href)
    if (docType) {
      url.searchParams.set('type', docType)
    } else {
      url.searchParams.delete('type')
    }
    window.history.replaceState({}, '', url.toString())

    // Reapply search with the new filter
    if (searchQuery) {
      performSearchWithParams(
        searchQuery,
        docType,
        sortOption,
        sortOrder,
        1,
        resultsPerPage
      )
    } else {
      loadInitialDocuments(docType, sortOption, sortOrder, resultsPerPage)
    }
  }

  // Handle sort option change
  const handleSortOptionChange = (value: string) => {
    const [newSortOption, newSortOrder] = value.split('-')

    setSortOption(newSortOption)
    setSortOrder(newSortOrder as 'asc' | 'desc')

    // Update URL parameters
    const url = new URL(window.location.href)
    url.searchParams.set('sort', newSortOption)
    url.searchParams.set('order', newSortOrder)
    window.history.replaceState({}, '', url.toString())

    // Reapply search with the new sorting
    if (searchQuery) {
      performSearchWithParams(
        searchQuery,
        documentTypeFilter,
        newSortOption,
        newSortOrder as 'asc' | 'desc',
        1,
        resultsPerPage
      )
    } else {
      loadInitialDocuments(
        documentTypeFilter,
        newSortOption,
        newSortOrder as 'asc' | 'desc',
        resultsPerPage
      )
    }
  }

  // Handle results per page change
  const handleResultsPerPageChange = (value: string) => {
    const perPage = parseInt(value, 10)
    setResultsPerPage(perPage)

    // Update URL parameter
    const url = new URL(window.location.href)
    url.searchParams.set('perPage', perPage.toString())
    window.history.replaceState({}, '', url.toString())

    // Reapply search with the new size
    if (searchQuery) {
      performSearchWithParams(
        searchQuery,
        documentTypeFilter,
        sortOption,
        sortOrder,
        1,
        perPage
      )
    } else {
      loadInitialDocuments(documentTypeFilter, sortOption, sortOrder, perPage)
    }
  }

  // Format updated date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className='min-h-screen bg-white dark:bg-black'>
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header with search */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold mb-8 text-black dark:text-white'>
            Search Results
          </h1>

          {/* Search form */}
          <form
            onSubmit={handleSearch}
            className='flex flex-col md:flex-row gap-4 mb-6'
          >
            <div className='w-full relative'>
              <Search className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
              <Input
                type='text'
                placeholder='Search by company name or URL...'
                className='pl-10 h-12 border-gray-300 dark:border-gray-700 w-full'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              type='submit'
              className='h-12 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 md:w-[120px] flex-shrink-0'
            >
              Search
            </Button>
          </form>
        </div>

        {/* Filters and sorting */}
        <div className='flex flex-col md:flex-row justify-between mb-8 gap-6'>
          <div className='flex items-center gap-2 w-full max-w-[250px]'>
            <Filter className='h-5 w-5 text-gray-500 flex-shrink-0' />
            <Select
              value={documentTypeFilter || 'all'}
              onValueChange={handleDocumentTypeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder='Document Type' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Documents</SelectItem>
                <SelectItem value='tos'>Terms of Service</SelectItem>
                <SelectItem value='pp'>Privacy Policy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='flex flex-col md:flex-row gap-6'>
            <div className='flex items-center gap-2 w-full max-w-[250px]'>
              <ArrowUpDown className='h-5 w-5 text-gray-500 flex-shrink-0' />
              <Select
                value={`${sortOption}-${sortOrder}`}
                onValueChange={handleSortOptionChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Sort by' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='updated_at-desc'>Most Recent</SelectItem>
                  <SelectItem value='updated_at-asc'>Oldest First</SelectItem>
                  <SelectItem value='company_name-asc'>Name (A-Z)</SelectItem>
                  <SelectItem value='company_name-desc'>Name (Z-A)</SelectItem>
                  <SelectItem value='views-desc'>Most Viewed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='flex items-center gap-2 w-full max-w-[180px]'>
              <Select
                value={resultsPerPage.toString()}
                onValueChange={handleResultsPerPageChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Per page' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='6'>6 per page</SelectItem>
                  <SelectItem value='9'>9 per page</SelectItem>
                  <SelectItem value='12'>12 per page</SelectItem>
                  <SelectItem value='15'>15 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results count and current filter */}
        {hasSearched && !isLoading && resultsPagination && (
          <div className='flex flex-col md:flex-row justify-between mb-6 text-gray-500 dark:text-gray-400'>
            <p>
              Showing {resultsPagination.items.length} of{' '}
              {resultsPagination.total} results
            </p>
            <p>
              Filtered by:{' '}
              <span className='font-medium'>{getDocumentTypeLabel()}</span>
            </p>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className='text-center py-12'>
            <p className='text-gray-500 dark:text-gray-400'>
              Loading results...
            </p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className='bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-md mb-8'>
            <p className='font-medium'>Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Empty results */}
        {hasSearched &&
          !isLoading &&
          (!displayedResults || displayedResults.length === 0) && (
            <div className='text-center py-12'>
              <p className='text-xl font-medium mb-2 text-black dark:text-white'>
                No results found
              </p>
              <p className='text-gray-500 dark:text-gray-400 mb-6'>
                Try a different search term or filter
              </p>
            </div>
          )}

        {/* Results grid */}
        {displayedResults && displayedResults.length > 0 && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
            {displayedResults.map((doc) => (
              <Card key={doc.id} className='overflow-hidden'>
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between'>
                    <div>
                      <CardTitle className='text-xl text-black dark:text-white'>
                        {doc.company_name}
                      </CardTitle>
                      <p className='text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1'>
                        <Globe className='h-3.5 w-3.5' />
                        {doc.url}
                      </p>
                    </div>
                    {doc.logo_url && (
                      <div className='w-10 h-10 rounded-md overflow-hidden flex-shrink-0'>
                        <img
                          src={doc.logo_url}
                          alt={`${doc.company_name} logo`}
                          className='w-full h-full object-contain'
                          onError={(e) => {
                            // Hide broken images
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className='py-3'>
                  <div className='flex justify-between'>
                    <div>
                      <p className='text-xs text-gray-500 dark:text-gray-400 mb-1'>
                        Document Type
                      </p>
                      {getDocumentTypeBadges(doc)}
                    </div>
                    <div className='text-right'>
                      <p className='text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center justify-end gap-1'>
                        <Clock className='h-3.5 w-3.5' />
                        Last Updated
                      </p>
                      <p className='text-sm text-gray-700 dark:text-gray-300'>
                        {formatDate(doc.updated_at)}
                      </p>
                    </div>
                  </div>
                  <div className='mt-3 text-right'>
                    <p className='text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center justify-end gap-1'>
                      <Eye className='h-3.5 w-3.5' />
                      Views
                    </p>
                    <p className='text-sm text-gray-700 dark:text-gray-300'>
                      {doc.views}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className='pt-2'>
                  <Button className='w-full gap-2' variant='outline' asChild>
                    <Link href={`/analysis/${doc.id}`}>
                      View Analysis
                      <ExternalLink className='h-4 w-4' />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {resultsPagination && resultsPagination.total_pages > 1 && (
          <div className='flex justify-center mt-8'>
            <div className='flex space-x-2'>
              <Button
                variant='outline'
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!resultsPagination.has_prev}
              >
                Previous
              </Button>

              {/* Page numbers */}
              {[...Array(resultsPagination.total_pages)].map((_, index) => (
                <Button
                  key={index}
                  variant={currentPage === index + 1 ? 'default' : 'outline'}
                  onClick={() => handlePageChange(index + 1)}
                  className={
                    currentPage === index + 1
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : ''
                  }
                >
                  {index + 1}
                </Button>
              ))}

              <Button
                variant='outline'
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!resultsPagination.has_next}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
