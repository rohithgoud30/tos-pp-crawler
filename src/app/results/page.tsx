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
  type DocumentItem,
  type DocumentSearchParams,
  type DocumentListParams,
} from '@/lib/api'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useNavigation } from '@/context/navigation-context'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useDocumentSearch,
  useDocumentList,
  prefetchFromDocumentList,
} from '@/hooks/use-cached-data'

export default function ResultsPage() {
  const urlParams = useSearchParams()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSearchQuery, setActiveSearchQuery] = useState('')
  const [documentTypeFilter, setDocumentTypeFilter] = useState<
    'tos' | 'pp' | undefined
  >(undefined)
  const [sortOption, setSortOption] = useState('relevance')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [resultsPerPage, setResultsPerPage] = useState(6)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const { setLastSearchState } = useNavigation()
  const [showColdStartNotice, setShowColdStartNotice] = useState(false)
  const noticeTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Build search parameters for the hooks
  const searchRequestParams: DocumentSearchParams | null = activeSearchQuery
    ? {
        search_text: activeSearchQuery,
        document_type: documentTypeFilter,
        sort_by: sortOption,
        sort_order: sortOrder,
        page: currentPage,
        per_page: resultsPerPage,
      }
    : null

  // Build document list parameters for the hook
  const listParams: DocumentListParams = {
    document_type: documentTypeFilter,
    sort_by: sortOption,
    sort_order: sortOrder,
    page: currentPage,
    per_page: resultsPerPage,
  }

  // Use our custom hooks for data fetching
  const {
    results: searchResults,
    isLoading: isSearchLoading,
    error: searchFetchError,
  } = useDocumentSearch(searchRequestParams, {
    revalidateOnMount: true,
  })

  const {
    documents: listResults,
    isLoading: isListLoading,
    error: listFetchError,
  } = useDocumentList(!activeSearchQuery ? listParams : undefined, {
    revalidateOnMount: !activeSearchQuery,
  })

  // Determine which results to display
  const resultsPagination = activeSearchQuery ? searchResults : listResults
  const displayedResults = resultsPagination?.items || []
  const isLoading = activeSearchQuery ? isSearchLoading : isListLoading

  // Pre-populate cache with list results for faster detail page access
  useEffect(() => {
    if (displayedResults?.length > 0) {
      prefetchFromDocumentList(displayedResults)
    }
  }, [displayedResults])

  // Handle errors from hooks
  useEffect(() => {
    if (searchFetchError) {
      if (searchFetchError.message?.includes('404')) {
        // 404 means no results found, not an error to display
        setFetchError(null)
      } else {
        setFetchError('Search failed. Please try again.')
      }
    } else if (listFetchError) {
      if (listFetchError.message?.includes('404')) {
        // 404 means no results found, not an error to display
        setFetchError(null)
      } else {
        setFetchError('Failed to load documents. Please try again.')
      }
    } else {
      setFetchError(null)
    }
  }, [searchFetchError, listFetchError])

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
                Your search is processing our large document database using our
                free service. This will take 15-30 seconds in worst case.
              </p>
              <p className='mt-2'>
                Please wait while we retrieve your results.
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

  // Load initial URL parameters
  useEffect(() => {
    const queryParam = urlParams.get('q')
    const typeParam = urlParams.get('type') as 'tos' | 'pp' | undefined
    const perPageParam = urlParams.get('perPage')
    const sortParam = urlParams.get('sort')
    const orderParam = urlParams.get('order') as 'asc' | 'desc' | undefined
    const pageParam = urlParams.get('page')

    // console.log('Initial URL parameters:', {
    //   queryParam,
    //   typeParam,
    //   perPageParam,
    //   sortParam,
    //   orderParam,
    //   pageParam,
    // })

    if (queryParam) {
      setSearchQuery(queryParam)
      setActiveSearchQuery(queryParam)
    } else {
      setSearchQuery('')
      setActiveSearchQuery('')
    }

    if (typeParam && ['tos', 'pp'].includes(typeParam)) {
      // console.log('Setting document type filter to:', typeParam)
      setDocumentTypeFilter(typeParam)
    }

    if (perPageParam) {
      const perPageValue = Number.parseInt(perPageParam, 10)
      if ([6, 9, 12, 15].includes(perPageValue)) {
        setResultsPerPage(perPageValue)
      }
    }

    // Set sort options from URL params if they exist, otherwise use defaults
    if (
      sortParam &&
      ['updated_at', 'company_name', 'url', 'views', 'relevance'].includes(
        sortParam
      )
    ) {
      setSortOption(sortParam)
      if (orderParam && ['asc', 'desc'].includes(orderParam)) {
        setSortOrder(orderParam)
      } else if (sortParam === 'relevance') {
        setSortOrder('desc') // Default to desc for relevance if order is missing
      } else {
        setSortOrder('asc') // Default to asc for other sorts if order is missing
      }
    } else {
      // Explicitly set to relevance-desc if no sort params in URL
      setSortOption('relevance')
      setSortOrder('desc')
    }

    if (pageParam) {
      const pageValue = Number.parseInt(pageParam, 10)
      if (pageValue > 0) {
        setCurrentPage(pageValue)
      }
    }

    // Set hasSearched to true if any search parameters exist, not just queryParam
    // This ensures the page will update URL and maintain state on refresh
    if (
      queryParam ||
      typeParam ||
      perPageParam !== null ||
      sortParam ||
      orderParam ||
      pageParam
    ) {
      setHasSearched(true)
    }
  }, [urlParams])

  // Update URL parameters and search state when filters change
  useEffect(() => {
    if (hasSearched) {
      updateUrlAndSearchState()
    }
  }, [
    activeSearchQuery,
    documentTypeFilter,
    sortOption,
    sortOrder,
    currentPage,
    resultsPerPage,
    hasSearched,
  ])

  // New function to update URL parameters and search state
  const updateUrlAndSearchState = () => {
    // Update URL parameters
    const url = new URL(window.location.href)

    if (activeSearchQuery) {
      url.searchParams.set('q', activeSearchQuery)
    } else {
      url.searchParams.delete('q')
    }

    if (documentTypeFilter) {
      url.searchParams.set('type', documentTypeFilter)
    } else {
      url.searchParams.delete('type')
    }

    // Always include these parameters to maintain state on refresh
    url.searchParams.set('perPage', resultsPerPage.toString())
    url.searchParams.set('sort', sortOption)
    url.searchParams.set('order', sortOrder)

    if (currentPage > 1) {
      url.searchParams.set('page', currentPage.toString())
    } else {
      url.searchParams.delete('page')
    }

    // Use replaceState instead of pushState to avoid breaking the back button
    window.history.replaceState(
      {
        searchQuery: activeSearchQuery,
        documentTypeFilter,
        sortOption,
        sortOrder,
        currentPage,
        resultsPerPage,
      },
      '',
      url.toString()
    )

    // Save search state to context
    setLastSearchState({
      query: activeSearchQuery,
      documentType: documentTypeFilter,
      sortOption,
      sortOrder,
      page: currentPage,
      perPage: resultsPerPage,
    })
  }

  // Handle search submit
  const handleSearch = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }

    const currentSearchText = searchQuery.trim()
    setSearchError(null)
    setFetchError(null)

    if (!currentSearchText) {
      // If input is empty, clear the active search to show all results
      setActiveSearchQuery('')
    } else {
      // Otherwise, set the active search query
      setActiveSearchQuery(currentSearchText)
    }

    setCurrentPage(1)
    setHasSearched(true)
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // The hooks will automatically refetch with the new page
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
    setCurrentPage(1) // Reset to page 1 when filter changes
  }

  // Handle sort option change
  const handleSortOptionChange = (value: string) => {
    const [newSortOption, newSortOrder] = value.split('-')

    setSortOption(newSortOption)
    setSortOrder(newSortOrder as 'asc' | 'desc')
    setCurrentPage(1) // Reset to page 1 when sorting changes
  }

  // Handle results per page change
  const handleResultsPerPageChange = (value: string) => {
    const perPage = parseInt(value, 10)
    setResultsPerPage(perPage)
    setCurrentPage(1) // Always reset to page 1 when changing results per page
  }

  // Format updated date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
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

  // Handle browser history navigation (back/forward)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state

      if (state) {
        // If we have state in history, restore it
        if (state.searchQuery !== undefined) {
          setSearchQuery(state.searchQuery)
          setActiveSearchQuery(state.searchQuery)
        }
        if (state.documentTypeFilter !== undefined)
          setDocumentTypeFilter(state.documentTypeFilter)
        if (state.sortOption !== undefined) setSortOption(state.sortOption)
        if (state.sortOrder !== undefined) setSortOrder(state.sortOrder)
        if (state.currentPage !== undefined) setCurrentPage(state.currentPage)
        if (state.resultsPerPage !== undefined)
          setResultsPerPage(state.resultsPerPage)

        // Ensure we show results after history navigation
        setHasSearched(true)
      } else {
        // If no state (e.g. user clicked back to initial page load), get from URL params
        const url = new URL(window.location.href)
        const queryParam = url.searchParams.get('q')
        const typeParam = url.searchParams.get('type') as
          | 'tos'
          | 'pp'
          | undefined

        if (queryParam) {
          setSearchQuery(queryParam)
          setActiveSearchQuery(queryParam)
        } else {
          setSearchQuery('')
          setActiveSearchQuery('')
        }
        if (typeParam && ['tos', 'pp'].includes(typeParam))
          setDocumentTypeFilter(typeParam)
      }
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

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
                    defaultValue='relevance-desc'
                  >
                    <SelectTrigger className='h-10 text-xs sm:text-sm'>
                      <SelectValue placeholder='Most Relevant' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='relevance-desc'>
                        Most Relevant
                      </SelectItem>
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
        {fetchError && !isLoading && displayedResults.length === 0 && (
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
