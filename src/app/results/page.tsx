'use client'

import type React from 'react'

import { useState, useEffect, useRef } from 'react'
import {
  Search,
  ArrowUpDown,
  ExternalLink,
  Globe,
  Clock,
  Eye,
  FileText,
  AlertCircle,
  Tag,
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
import { useNavigation } from '@/context/navigation-context'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useDocumentSearch,
  useDocumentList,
  prefetchFromDocumentList,
} from '@/hooks/use-cached-data'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

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
  const [hasSearched, setHasSearched] = useState(false)
  const { setLastSearchState } = useNavigation()
  const [showColdStartNotice, setShowColdStartNotice] = useState(false)
  const noticeTimerRef = useRef<NodeJS.Timeout | null>(null)

  // For debugging - add console log to show current sort state
  useEffect(() => {
    // Removed debug logs
  }, [sortOption, sortOrder])

  // Force relevance-desc as default on initial render
  useEffect(() => {
    // Only run once on component mount - force default sort to be Most Relevant
    if (sortOption !== 'relevance' && !urlParams.get('sort')) {
      setSortOption('relevance')
      setSortOrder('desc')
    }
  }, [sortOption, urlParams])

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
  const renderColdStartAlert = () => {
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

    if (queryParam) {
      setSearchQuery(queryParam)
      setActiveSearchQuery(queryParam)
    } else {
      setSearchQuery('')
      setActiveSearchQuery('')
    }

    if (typeParam && ['tos', 'pp'].includes(typeParam)) {
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

  // Ensure default sort is 'relevance-desc' on initial load
  useEffect(() => {
    // If we haven't searched yet and no sort param is in the URL, set to relevance-desc
    if (!hasSearched && !urlParams.get('sort')) {
      setSortOption('relevance')
      setSortOrder('desc')
    }
  }, [hasSearched, urlParams])

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
    <div className='container mx-auto px-2 sm:px-4 py-8 max-w-7xl'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-6 text-gray-900 dark:text-gray-50 text-center md:text-left'>
          Search Results
        </h1>

        <div className='bg-card rounded-lg border shadow-sm p-5'>
          <form onSubmit={handleSearch} className='space-y-4'>
            {/* Search input on full width top row */}
            <div className='relative w-full'>
              <Input
                type='text'
                placeholder='Search for a company or service...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pr-12 h-12 w-full'
              />
              <Button
                type='submit'
                size='icon'
                className='absolute right-1 top-1 h-10 w-10 bg-primary text-primary-foreground hover:bg-primary/90'
              >
                <Search className='h-4 w-4' />
                <span className='sr-only'>Search</span>
              </Button>
            </div>

            {/* Filter controls on bottom row */}
            <div className='flex flex-col sm:flex-row sm:flex-wrap justify-center gap-4 items-stretch'>
              <div className='col-span-1'>
                <Select
                  value={documentTypeFilter || 'all'}
                  onValueChange={handleDocumentTypeChange}
                >
                  <SelectTrigger className='w-full sm:w-[200px] h-12 text-left'>
                    <SelectValue placeholder='Document Type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Documents</SelectItem>
                    <SelectItem value='tos'>Terms of Service</SelectItem>
                    <SelectItem value='pp'>Privacy Policy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='col-span-1'>
                <Select
                  value={sortOption}
                  onValueChange={handleSortOptionChange}
                >
                  <SelectTrigger className='w-full sm:w-[200px] h-12 text-left'>
                    <SelectValue placeholder='Sort By' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='relevance'>Relevance</SelectItem>
                    <SelectItem value='company_name'>Company Name</SelectItem>
                    <SelectItem value='updated_at'>Last Updated</SelectItem>
                    <SelectItem value='view_count'>Most Viewed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='col-span-1'>
                <Button
                  variant='outline'
                  onClick={() =>
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                  }
                  className='w-full sm:w-[200px] h-12 flex items-center justify-between px-3 border border-input bg-background hover:bg-accent hover:text-accent-foreground'
                >
                  <span className='whitespace-nowrap'>
                    {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                  </span>
                  <ArrowUpDown className='h-4 w-4 ml-2 opacity-50' />
                </Button>
              </div>

              <div className='col-span-1'>
                <Select
                  value={resultsPerPage.toString()}
                  onValueChange={handleResultsPerPageChange}
                >
                  <SelectTrigger className='w-full sm:w-[200px] h-12 text-left'>
                    <SelectValue placeholder='Per Page' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='6'>6 / page</SelectItem>
                    <SelectItem value='9'>9 / page</SelectItem>
                    <SelectItem value='12'>12 / page</SelectItem>
                    <SelectItem value='15'>15 / page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Results count and current filter - Show if pagination exists, regardless of loading */}
      {resultsPagination && (
        <div className='flex flex-col md:flex-row justify-between mb-6 text-gray-500 dark:text-gray-400 text-center md:text-left'>
          <p className='mb-2 md:mb-0'>
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
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 place-items-center md:place-items-stretch'>
          {Array.from({ length: resultsPerPage }).map((_, index) => (
            <Card
              key={`skeleton-${index}`}
              className='flex flex-col justify-between w-full max-w-[400px] md:max-w-none'
            >
              <div>
                <CardHeader className='p-4 pb-2'>
                  <div className='flex items-center justify-center mb-3'>
                    <Skeleton className='h-16 w-16 rounded-md' />
                  </div>
                  <div className='flex flex-col items-center gap-2'>
                    <Skeleton className='h-6 w-36 rounded-md' />
                    <Skeleton className='h-4 w-48 rounded-md' />
                  </div>
                </CardHeader>
                <CardContent className='p-4 pt-2 text-xs'>
                  <div className='grid grid-cols-2 gap-3'>
                    <div className='space-y-2'>
                      <Skeleton className='h-3 w-16' />
                      <Skeleton className='h-5 w-32' />
                    </div>
                    <div className='space-y-2 text-right'>
                      <Skeleton className='h-3 w-16 ml-auto' />
                      <Skeleton className='h-5 w-24 ml-auto' />
                    </div>
                  </div>
                  <div className='mt-3 text-right space-y-2'>
                    <Skeleton className='h-3 w-16 ml-auto' />
                    <Skeleton className='h-5 w-24 ml-auto' />
                  </div>
                </CardContent>
              </div>
              <CardFooter className='p-4 pt-3 mt-auto'>
                <Skeleton className='h-10 w-full rounded-md' />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* General Fetch Error state - only show this block for fetch errors */}
      {fetchError && !isLoading && displayedResults.length === 0 && (
        <div className='bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-md mb-8 text-center mx-auto max-w-lg'>
          <p className='font-medium mb-2'>Error</p>
          <p>{fetchError}</p>
        </div>
      )}

      {/* Render results grid OR empty state only when NOT loading */}
      {!isLoading && (
        <>
          {/* Empty results */}
          {hasSearched &&
            (!displayedResults || displayedResults.length === 0) && (
              <div className='text-center py-12 mx-auto max-w-lg'>
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
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 place-items-center md:place-items-stretch'>
              {displayedResults.map((doc) => {
                // Just create a simple analysis URL without backTo parameter
                const analysisUrl = `/analysis/${doc.id}`

                return (
                  <Card
                    key={doc.id}
                    className='group flex flex-col justify-between w-full max-w-[400px] md:max-w-none overflow-hidden transition-all duration-200 hover:border-primary/30 dark:hover:border-primary/20'
                  >
                    <div>
                      {/* Wrapper for content except footer */}
                      <CardHeader className='p-4 pb-2'>
                        <div className='flex flex-col items-center text-center mb-2'>
                          {/* Logo display - Reverted to img tag like analysis page */}
                          {doc.logo_url && (
                            <div className='flex-shrink-0 h-16 w-16 p-1.5 mb-3 bg-white dark:bg-white rounded-md flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm'>
                              <img
                                src={doc.logo_url}
                                alt={`${doc.company_name} logo`}
                                className='max-h-full max-w-full object-contain'
                                onError={(e) => {
                                  // Hide img on error
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            </div>
                          )}
                          {/* Fallback placeholder if no logo URL */}
                          {!doc.logo_url && (
                            <div className='w-16 h-16 rounded-md flex-shrink-0 bg-gray-100 dark:bg-gray-800 border dark:border-gray-700 flex items-center justify-center mb-3 shadow-sm'>
                              <FileText className='h-8 w-8 text-gray-400 dark:text-gray-500' />
                            </div>
                          )}
                          <TooltipProvider delayDuration={200}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <CardTitle className='text-xl mb-1 group-hover:text-primary transition-colors truncate max-w-[180px] sm:max-w-[250px] md:max-w-[200px] lg:max-w-[220px] cursor-default'>
                                  {doc.company_name.length > 20
                                    ? `${doc.company_name.substring(0, 18)}...`
                                    : doc.company_name}
                                </CardTitle>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{doc.company_name}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider delayDuration={200}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className='text-sm text-muted-foreground text-center truncate max-w-[220px] sm:max-w-[280px] cursor-default'>
                                  <Globe className='h-3.5 w-3.5 inline-flex mr-1 text-muted-foreground' />
                                  {doc.url.length > 25
                                    ? `${doc.url.substring(0, 23)}...`
                                    : doc.url}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent side='bottom'>
                                <p>{doc.url}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </CardHeader>
                      <CardContent className='p-4 pt-4 text-xs'>
                        <div className='grid grid-cols-2 gap-3'>
                          <div>
                            <p className='text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1 flex items-center'>
                              <FileText className='h-3.5 w-3.5 mr-1' />
                              Doc Type
                            </p>
                            {getDocumentTypeBadges(doc)}
                          </div>
                          <div className='text-right'>
                            <p className='text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1 flex items-center justify-end'>
                              <Clock className='h-3.5 w-3.5 mr-1' />
                              Updated
                            </p>
                            <p className='text-gray-700 dark:text-gray-300 font-medium'>
                              {formatDate(doc.updated_at)}
                            </p>
                          </div>
                        </div>
                        <div className='mt-3 text-right'>
                          <p className='text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1 flex items-center justify-end'>
                            <Eye className='h-3.5 w-3.5 mr-1' />
                            Views
                          </p>
                          <p className='text-gray-700 dark:text-gray-300 font-medium'>
                            {doc.views.toLocaleString()}
                          </p>
                        </div>
                      </CardContent>
                    </div>
                    <CardFooter className='p-4 pt-3 mt-auto'>
                      <Button
                        className='w-full gap-2 hover:bg-primary hover:text-primary-foreground dark:hover:bg-white dark:hover:text-black transition-colors'
                        variant='outline'
                        size='sm'
                        asChild
                      >
                        <Link href={analysisUrl}>
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
        <div className='flex justify-center mt-10 mb-4'>
          <div className='flex flex-wrap justify-center gap-3 items-center'>
            <Button
              variant='outline'
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!resultsPagination.has_prev}
              className='mb-2 sm:mb-0 h-12 w-auto px-4 border-input flex items-center justify-center'
            >
              Previous
            </Button>

            <div className='flex flex-wrap justify-center gap-3'>
              {(() => {
                const totalPages = resultsPagination.total_pages
                const MAX_VISIBLE_PAGES = Math.min(5, totalPages) // Show fewer pages on mobile
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
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-12'
                        : 'border-input hover:bg-accent hover:text-accent-foreground h-12 w-12'
                    }
                  >
                    {pageNumber}
                  </Button>
                ))
              })()}
            </div>

            <Button
              variant='outline'
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!resultsPagination.has_next}
              className='mb-2 sm:mb-0 h-12 w-auto px-4 border-input flex items-center justify-center'
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Add cold start alert at the bottom */}
      {renderColdStartAlert()}
    </div>
  )
}
