'use client'

import type React from 'react'

import { useState, useEffect, useRef } from 'react'
import {
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  Globe,
  Clock,
  Eye,
  Tag,
  FileText,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
// import Image from 'next/image' // REMOVED next/image import
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useNavigation } from '@/context/navigation-context'
import { Skeleton } from '@/components/ui/skeleton'

export default function ResultsPage() {
  const searchParams = useSearchParams()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [documentTypeFilter, setDocumentTypeFilter] = useState<
    'tos' | 'pp' | undefined
  >(undefined)
  const [sortOption, setSortOption] = useState('company_name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [resultsPerPage, setResultsPerPage] = useState(6)
  const [displayedResults, setDisplayedResults] = useState<DocumentItem[]>([])
  const [resultsPagination, setResultsPagination] =
    useState<PaginatedResponse<DocumentItem> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const { setLastSearchState } = useNavigation()
  const [showColdStartNotice, setShowColdStartNotice] = useState(false)
  const noticeTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Load initial URL parameters
  useEffect(() => {
    // Set loading immediately when URL params change
    setIsLoading(true)

    const queryParam = searchParams.get('q')
    const typeParam = searchParams.get('type') as 'tos' | 'pp' | undefined
    const perPageParam = searchParams.get('perPage')
    const sortParam = searchParams.get('sort')
    const orderParam = searchParams.get('order') as 'asc' | 'desc' | undefined
    const pageParam = searchParams.get('page')

    console.log('Initial URL parameters:', {
      queryParam,
      typeParam,
      perPageParam,
      sortParam,
      orderParam,
      pageParam,
    })

    // Track if we should perform a search after setting state
    let shouldSearch = false
    let shouldUpdateUrl = false
    let actualTypeFilter: 'tos' | 'pp' | undefined = undefined
    let actualSortOption = 'company_name'
    let actualSortOrder: 'asc' | 'desc' = 'asc'
    let actualPerPage = 6
    let actualPage = 1

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

    // Handle page parameter
    if (pageParam) {
      const pageValue = Number.parseInt(pageParam, 10)
      if (pageValue > 0) {
        setCurrentPage(pageValue)
        actualPage = pageValue
        shouldUpdateUrl = true
      }
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

      // Include page parameter if not page 1
      if (actualPage > 1) {
        url.searchParams.set('page', actualPage.toString())
      } else {
        url.searchParams.delete('page')
      }

      // Replace current state to prevent multiple history entries
      window.history.replaceState({}, '', url.toString())
    }

    // If we have a search query in the URL, automatically perform search
    if (shouldSearch) {
      setHasSearched(true)

      // Perform search immediately with priority to search results
      console.log('Performing search with document type:', actualTypeFilter)
      performSearchWithParams(
        queryParam,
        actualTypeFilter,
        actualSortOption,
        actualSortOrder,
        actualPage,
        actualPerPage
      )
    } else {
      // Load all documents if no search
      loadInitialDocuments(
        actualTypeFilter,
        actualSortOption,
        actualSortOrder,
        actualPerPage,
        actualPage
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Add cold start notification handling with delay
  useEffect(() => {
    if (isLoading) {
      // Start a timer to show the notification after 5 seconds
      noticeTimerRef.current = setTimeout(() => {
        setShowColdStartNotice(true)
      }, 5000)
    } else {
      // If loading finishes before timeout, clear the timer and hide notice
      if (noticeTimerRef.current) {
        clearTimeout(noticeTimerRef.current)
        noticeTimerRef.current = null
      }
      setShowColdStartNotice(false)
    }

    // Cleanup function to clear timer on unmount or if isLoading changes
    return () => {
      if (noticeTimerRef.current) {
        clearTimeout(noticeTimerRef.current)
      }
    }
  }, [isLoading])

  // Function to dismiss cold start notification
  const handleDismissNotification = () => {
    setShowColdStartNotice(false)
  }

  // Integrated cold start notification
  const ColdStartAlert = () => {
    if (!showColdStartNotice) return null

    return (
      <div className='fixed bottom-4 right-4 z-50 max-w-md p-4 bg-amber-100 border border-amber-200 rounded-lg shadow-lg dark:bg-amber-900 dark:border-amber-800'>
        <div className='flex items-start'>
          <div className='flex-shrink-0'>
            <AlertCircle className='h-5 w-5 text-amber-500' />
          </div>
          <div className='ml-3'>
            <h3 className='text-sm font-medium text-amber-800 dark:text-amber-200'>
              Search in Progress
            </h3>
            <div className='mt-2 text-xs text-amber-700 dark:text-amber-300'>
              <p>
                Your search is processing our large document database. This
                might take 15-45 seconds to complete.
              </p>
              <p className='mt-2'>
                For faster results, try more specific search terms.
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

  // Load initial documents without search query
  const loadInitialDocuments = async (
    docType: 'tos' | 'pp' | undefined,
    sort: string,
    order: 'asc' | 'desc',
    perPage: number,
    page: number = 1 // Default to page 1 if not provided
  ) => {
    setFetchError(null)
    setSearchError(null)
    setIsLoading(true) // This will trigger showing the cold start notification

    try {
      const results = await getDocuments({
        document_type: docType,
        sort_by: sort,
        sort_order: order,
        page: page,
        per_page: perPage,
      })

      setResultsPagination(results)
      setDisplayedResults(results.items)
      setHasSearched(true)
    } catch (err) {
      console.error('Error loading documents:', err)
      setFetchError('Failed to load documents. Please try again.')
      setDisplayedResults([])
      setResultsPagination(null)
    } finally {
      // Add a small delay before removing loading state to prevent UI flickering
      // and allow state updates to complete
      setTimeout(() => {
        setIsLoading(false)
      }, 300)
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
    if (!query) {
      setIsLoading(false)
      return
    }

    // Ensure loading state is set
    setIsLoading(true)

    console.log('Search with direct params:', {
      query,
      docType,
      sort,
      order,
      page,
      perPage,
    })
    setFetchError(null)
    setSearchError(null)

    // Create an AbortController to handle cancellation
    const abortController = new AbortController()
    const signal = abortController.signal

    try {
      const results = await searchDocuments({
        search_text: query,
        document_type: docType,
        sort_by: sort,
        sort_order: order,
        page: page,
        per_page: perPage,
      })

      // Only update state if the request wasn't aborted
      if (!signal.aborted) {
        setResultsPagination(results)
        setDisplayedResults(results.items)
      }
    } catch (err) {
      // Only show error if the request wasn't aborted
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        console.error('Search error:', err)
        setFetchError('Search failed. Please try again.')
        setDisplayedResults([])
        setResultsPagination(null)
      }
    } finally {
      // Add a small delay before removing loading state to prevent UI flickering
      // and allow state updates to complete
      if (!signal.aborted) {
        setTimeout(() => {
          setIsLoading(false)
        }, 300)
      }
    }

    // Return the AbortController so it can be used to cancel the request if needed
    return abortController
  }

  // Handle explicit search action
  const handleSearch = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }

    // Set loading state immediately
    setIsLoading(true)

    if (!searchQuery.trim()) {
      setSearchError('Please enter a search term')
      setFetchError(null)
      setIsLoading(false) // Make sure to clear loading state if validation fails
      return
    }

    setSearchError(null)
    setFetchError(null)
    setCurrentPage(1)
    setHasSearched(true)

    // Update URL parameters
    updateUrlParameters()

    // Save search state to context
    updateSearchState()

    // Execute search
    performSearch()
  }

  // New function to update search state in context
  const updateSearchState = () => {
    setLastSearchState({
      query: searchQuery,
      documentType: documentTypeFilter,
      sortOption,
      sortOrder,
      page: currentPage,
      perPage: resultsPerPage,
    })
  }

  // Effect to update search state when any search param changes
  useEffect(() => {
    // Only save state if we have shown some results
    if (hasSearched) {
      updateSearchState()
    }
  }, [
    searchQuery,
    documentTypeFilter,
    sortOption,
    sortOrder,
    currentPage,
    resultsPerPage,
    hasSearched,
  ])

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
    setIsLoading(true)
    setCurrentPage(page)

    // Update URL parameter for the page
    const url = new URL(window.location.href)
    if (page > 1) {
      url.searchParams.set('page', page.toString())
    } else {
      url.searchParams.delete('page') // Remove page param if it's page 1
    }
    window.history.replaceState({}, '', url.toString())

    // Save the updated search state with new page
    updateSearchState()

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
        resultsPerPage,
        page
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

    // Update search state
    updateSearchState()

    // Reapply search with the new filter
    if (searchQuery) {
      performSearchWithParams(
        searchQuery,
        docType,
        sortOption,
        sortOrder,
        1, // Reset to page 1 when filter changes
        resultsPerPage
      )
    } else {
      loadInitialDocuments(docType, sortOption, sortOrder, resultsPerPage, 1) // Reset to page 1
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

    // Update search state
    updateSearchState()

    // Reapply search with the new sorting
    if (searchQuery) {
      performSearchWithParams(
        searchQuery,
        documentTypeFilter,
        newSortOption,
        newSortOrder as 'asc' | 'desc',
        1, // Reset to page 1 when sorting changes
        resultsPerPage
      )
    } else {
      loadInitialDocuments(
        documentTypeFilter,
        newSortOption,
        newSortOrder as 'asc' | 'desc',
        resultsPerPage,
        1 // Reset to page 1
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

    // Update search state
    updateSearchState()

    // Reapply search with the new size
    if (searchQuery) {
      performSearchWithParams(
        searchQuery,
        documentTypeFilter,
        sortOption,
        sortOrder,
        1, // Reset to page 1 when per page changes
        perPage
      )
    } else {
      loadInitialDocuments(
        documentTypeFilter,
        sortOption,
        sortOrder,
        perPage,
        1
      ) // Reset to page 1
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

  // Update URL parameters
  const updateUrlParameters = () => {
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
  }

  return (
    <div className='min-h-screen bg-white dark:bg-black'>
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold mb-8 text-black dark:text-white'>
            Search Results
          </h1>

          {/* Combined Search and Filter Section */}
          <div className='space-y-4 mb-8'>
            {/* Search form */}
            <form onSubmit={handleSearch} className=''>
              {' '}
              {/* Removed mb-6 */}
              <div className='space-y-2'>
                <div className='relative flex items-center'>
                  <Input
                    type='text'
                    placeholder='Search by company name or website URL'
                    className={`pr-12 h-12 text-base ${
                      searchError
                        ? 'border-red-500 focus-visible:ring-red-500'
                        : 'border-input focus-visible:ring-ring'
                    }`}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      if (e.target.value.trim()) {
                        setSearchError(null)
                      }
                    }}
                    aria-invalid={searchError ? 'true' : 'false'}
                    aria-describedby={searchError ? 'search-error' : undefined}
                  />
                  <Button
                    type='submit'
                    size='icon'
                    className='absolute right-1 h-10 w-10 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-200'
                    disabled={isLoading}
                  >
                    <Search className='h-4 w-4' />
                    <span className='sr-only'>Search</span>
                  </Button>
                </div>

                {searchError && (
                  <p
                    id='search-error'
                    className='text-sm font-medium text-red-500 text-left'
                  >
                    {searchError}
                  </p>
                )}
              </div>
            </form>

            {/* Filters and sorting */}
            {/* Apply justify-between to distribute space */}
            <div className='flex flex-col md:flex-row gap-4 items-center justify-between'>
              {/* Filter by Doc Type (Stays on the left) */}
              <div className='flex items-center gap-2 w-full md:w-auto md:min-w-[200px]'>
                <Filter className='h-4 w-4 text-gray-500 flex-shrink-0' />
                <Select
                  value={documentTypeFilter || 'all'}
                  onValueChange={handleDocumentTypeChange}
                >
                  <SelectTrigger className='h-10 text-xs sm:text-sm'>
                    <SelectValue placeholder='Doc Type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Documents</SelectItem>
                    <SelectItem value='tos'>Terms of Service</SelectItem>
                    <SelectItem value='pp'>Privacy Policy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sorting and Paging Options - Grouped together (Moves to the right due to justify-between) */}
              <div className='flex flex-col sm:flex-row gap-4 w-full md:w-auto'>
                {/* Sort By */}
                <div className='flex items-center gap-2 w-full sm:w-auto md:min-w-[180px]'>
                  <ArrowUpDown className='h-4 w-4 text-gray-500 flex-shrink-0' />
                  <Select
                    value={`${sortOption}-${sortOrder}`}
                    onValueChange={handleSortOptionChange}
                    defaultValue='company_name-asc'
                  >
                    <SelectTrigger className='h-10 text-xs sm:text-sm'>
                      <SelectValue placeholder='Name (A-Z)' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='company_name-asc'>
                        Name (A-Z)
                      </SelectItem>
                      <SelectItem value='company_name-desc'>
                        Name (Z-A)
                      </SelectItem>
                      <SelectItem value='updated_at-desc'>
                        Most Recent
                      </SelectItem>
                      <SelectItem value='updated_at-asc'>
                        Oldest First
                      </SelectItem>
                      <SelectItem value='views-desc'>Most Viewed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Results Per Page */}
                <div className='flex items-center gap-2 w-full sm:w-auto md:min-w-[150px]'>
                  <Select
                    value={resultsPerPage.toString()}
                    onValueChange={handleResultsPerPageChange}
                  >
                    <SelectTrigger className='h-10 text-xs sm:text-sm'>
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
          </div>
        </div>

        {/* Results count and current filter - Show if pagination exists, regardless of loading */}
        {resultsPagination && (
          <div className='flex flex-col md:flex-row justify-between mb-6 text-gray-500 dark:text-gray-400'>
            <p>
              {/* Show current item count if loading, otherwise use total */}
              Showing{' '}
              {isLoading
                ? displayedResults.length
                : resultsPagination.items.length}{' '}
              of {resultsPagination.total} results
            </p>
            <p>
              Filtered by:{' '}
              <span className='font-medium'>{getDocumentTypeLabel()}</span>
            </p>
          </div>
        )}

        {/* Loading state - Skeleton Grid */}
        {isLoading && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
            {Array.from({ length: resultsPerPage }).map((_, index) => (
              <Card
                key={`skeleton-${index}`}
                className='flex flex-col justify-between'
              >
                <div>
                  <CardHeader className='p-4 pb-2'>
                    <div className='flex items-center gap-3 mb-2'>
                      <Skeleton className='h-10 w-10 rounded-md' />
                      <div className='flex-grow space-y-2'>
                        <Skeleton className='h-4 w-3/4' />
                        <Skeleton className='h-3 w-1/2' />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className='p-4 pt-2 text-xs'>
                    <div className='grid grid-cols-2 gap-3'>
                      <div className='space-y-1'>
                        <Skeleton className='h-3 w-1/3' />
                        <Skeleton className='h-5 w-1/2' />
                      </div>
                      <div className='space-y-1 text-right'>
                        <Skeleton className='h-3 w-1/3 ml-auto' />
                        <Skeleton className='h-4 w-1/2 ml-auto' />
                      </div>
                    </div>
                    <div className='mt-3 text-right space-y-1'>
                      <Skeleton className='h-3 w-1/4 ml-auto' />
                      <Skeleton className='h-4 w-1/3 ml-auto' />
                    </div>
                  </CardContent>
                </div>
                <CardFooter className='p-4 pt-0 mt-auto'>
                  <Skeleton className='h-9 w-full' />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* General Fetch Error state - only show this block for fetch errors */}
        {fetchError && !isLoading && (
          <div className='bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-md mb-8'>
            <p className='font-medium'>Error</p>
            <p>{fetchError}</p>
          </div>
        )}

        {/* Render results grid OR empty state only when NOT loading */}
        {!isLoading && (
          <>
            {/* Empty results */}
            {hasSearched &&
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
                {displayedResults.map((doc) => {
                  // Just create a simple analysis URL without backTo parameter
                  const analysisUrl = `/analysis/${doc.id}`

                  return (
                    <Card
                      key={doc.id}
                      className='group flex flex-col justify-between w-full min-w-0 overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/30 dark:hover:border-primary/40'
                    >
                      <div>
                        {/* Wrapper for content except footer */}
                        <CardHeader className='p-4 pb-2'>
                          <div className='flex items-center gap-3 mb-2'>
                            {/* Logo display - Reverted to img tag like analysis page */}
                            {doc.logo_url && (
                              <div className='flex-shrink-0 h-10 w-10 p-1 mr-1 bg-white dark:bg-white rounded-md flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700'>
                                <img
                                  src={doc.logo_url}
                                  alt={`${doc.company_name} logo`}
                                  className='max-h-full max-w-full object-contain'
                                  onError={(e) => {
                                    // Hide img on error
                                    e.currentTarget.style.display = 'none'
                                    // Optionally hide parent if needed, but start with just img
                                    // e.currentTarget.parentElement?.classList.add('hidden');
                                  }}
                                />
                              </div>
                            )}
                            {/* Fallback placeholder if no logo URL */}
                            {!doc.logo_url && (
                              <div className='w-10 h-10 rounded-md flex-shrink-0 bg-gray-100 dark:bg-gray-800 border dark:border-gray-700 flex items-center justify-center mr-1'>
                                <FileText className='h-5 w-5 text-gray-400 dark:text-gray-500' />
                              </div>
                            )}
                            <div className='flex-grow min-w-0 max-w-full overflow-hidden'>
                              {' '}
                              {/* Allow text to wrap */}
                              {/* Use TooltipProvider for all company names, truncate if > 13 chars */}
                              <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <CardTitle className='text-lg font-semibold text-black dark:text-white group-hover:text-primary transition-colors cursor-default'>
                                      {doc.company_name.length > 13
                                        ? `${doc.company_name.substring(
                                            0,
                                            11
                                          )}...`
                                        : doc.company_name}
                                    </CardTitle>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{doc.company_name}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <p className='text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1'>
                                <Globe className='h-3 w-3 flex-shrink-0' />
                                <TooltipProvider delayDuration={200}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className='truncate cursor-default'>
                                        {doc.url.length > 18
                                          ? `${doc.url.substring(0, 16)}...`
                                          : doc.url}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent side='bottom' align='start'>
                                      <p>{doc.url}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className='p-4 pt-2 text-xs'>
                          <div className='grid grid-cols-2 gap-3'>
                            <div>
                              <p className='text-gray-500 dark:text-gray-400 mb-0.5 flex items-center gap-1'>
                                <FileText className='h-3.5 w-3.5' />
                                Doc Type
                              </p>
                              {getDocumentTypeBadges(doc)}{' '}
                              {/* Re-use existing badge logic */}
                            </div>
                            <div className='text-right'>
                              <p className='text-gray-500 dark:text-gray-400 mb-0.5 flex items-center justify-end gap-1'>
                                <Clock className='h-3.5 w-3.5' />
                                Last Updated
                              </p>
                              <p className='text-gray-700 dark:text-gray-300 font-medium'>
                                {formatDate(doc.updated_at)}
                              </p>
                            </div>
                          </div>
                          <div className='mt-3 text-right'>
                            <p className='text-gray-500 dark:text-gray-400 mb-0.5 flex items-center justify-end gap-1'>
                              <Eye className='h-3.5 w-3.5' />
                              Views
                            </p>
                            <p className='text-gray-700 dark:text-gray-300 font-medium'>
                              {doc.views.toLocaleString()}
                            </p>
                          </div>
                        </CardContent>
                      </div>
                      <CardFooter className='p-4 pt-0 mt-auto'>
                        {' '}
                        {/* Ensure footer is at the bottom */}
                        <Button
                          className='w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground dark:group-hover:bg-primary/90 dark:group-hover:text-primary-foreground transition-colors'
                          variant='outline'
                          size='sm'
                          asChild
                        >
                          <Link href={analysisUrl}>
                            {' '}
                            {/* Use the constructed URL */}
                            View Analysis
                            <ExternalLink className='h-4 w-4' />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {resultsPagination && resultsPagination.total_pages > 1 && (
          <div className='flex justify-center mt-8'>
            <div className='flex space-x-2 items-center'>
              <Button
                variant='outline'
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!resultsPagination.has_prev}
              >
                Previous
              </Button>

              {/* Page numbers - Google Style */}
              {(() => {
                const totalPages = resultsPagination.total_pages
                const MAX_VISIBLE_PAGES = 10
                const pagesToShow = Math.min(MAX_VISIBLE_PAGES, totalPages)

                let startPage = Math.max(
                  1,
                  currentPage - Math.floor(pagesToShow / 2)
                )
                const endPage = Math.min(
                  totalPages,
                  startPage + pagesToShow - 1
                )

                // Adjust startPage if endPage hits the limit
                if (endPage === totalPages) {
                  startPage = Math.max(1, totalPages - pagesToShow + 1)
                }

                const pageNumbers = []
                for (let i = startPage; i <= endPage; i++) {
                  pageNumbers.push(i)
                }

                return pageNumbers.map((pageNumber) => (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? 'default' : 'outline'}
                    onClick={() => handlePageChange(pageNumber)}
                    className={
                      currentPage === pageNumber
                        ? 'bg-black text-white dark:bg-white dark:text-black'
                        : ''
                    }
                    size='icon' // Make buttons square
                    style={{ minWidth: '2.5rem' }} // Ensure consistent width
                  >
                    {pageNumber}
                  </Button>
                ))
              })()}

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
      <ColdStartAlert />
    </div>
  )
}
