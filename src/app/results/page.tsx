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
import { allResults, type SearchResult } from '@/lib/data'
import Image from 'next/image'

export default function ResultsPage() {
  const searchParams = useSearchParams()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [documentTypeFilter, setDocumentTypeFilter] = useState('all')
  const [sortOption, setSortOption] = useState('recent')
  const [resultsPerPage, setResultsPerPage] = useState(6)
  const [displayedResults, setDisplayedResults] = useState<SearchResult[]>([])
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  // Load initial URL parameters
  useEffect(() => {
    const queryParam = searchParams.get('q')
    const typeParam = searchParams.get('type') as string
    const perPageParam = searchParams.get('perPage')
    const sortParam = searchParams.get('sort')

    console.log('Initial URL parameters:', {
      queryParam,
      typeParam,
      perPageParam,
      sortParam,
    })

    // Track if we should perform a search after setting state
    let shouldSearch = false
    let shouldUpdateUrl = false
    let actualTypeFilter = 'all'
    let actualSortOption = 'recent'
    let actualPerPage = 6

    if (queryParam) {
      setSearchQuery(queryParam)
      shouldSearch = true
      shouldUpdateUrl = true
    }

    if (typeParam && ['tos', 'privacy', 'all'].includes(typeParam)) {
      console.log('Setting document type filter to:', typeParam)
      setDocumentTypeFilter(typeParam)
      actualTypeFilter = typeParam
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
      ['recent', 'oldest', 'name', 'z-a', 'most-viewed'].includes(sortParam)
    ) {
      setSortOption(sortParam)
      actualSortOption = sortParam
      shouldUpdateUrl = true
    }

    // Update URL to ensure a consistent state
    if (shouldUpdateUrl) {
      const url = new URL(window.location.href)

      // Only include parameters with actual values
      if (queryParam) {
        url.searchParams.set('q', queryParam)
      }

      url.searchParams.set('type', actualTypeFilter)
      url.searchParams.set('perPage', actualPerPage.toString())
      url.searchParams.set('sort', actualSortOption)

      // Replace current state to prevent multiple history entries
      window.history.replaceState({}, '', url.toString())
    }

    // If we have a search query in the URL, automatically perform search
    if (shouldSearch) {
      setHasSearched(true)

      // Use timeout to ensure state updates have been applied
      setTimeout(() => {
        console.log('Performing search with document type:', actualTypeFilter)
        performSearchWithParams(queryParam, actualTypeFilter, actualSortOption)
      }, 100) // Increased timeout for state updates
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Function that uses direct parameters instead of relying on state
  const performSearchWithParams = (
    query: string | null,
    docType: string,
    sort: string
  ) => {
    console.log('Search with direct params:', { query, docType, sort })

    // Filter results
    const results = allResults
      .filter((result) => {
        if (!query || query.trim() === '') {
          return true
        }

        const queryLower = query.toLowerCase().trim()
        const name = result.name.toLowerCase()
        const url = result.url.toLowerCase()

        // Simple matching for demo
        return name.includes(queryLower) || url.includes(queryLower)
      })
      .filter((result) => {
        // Filter by document type
        if (docType === 'all') {
          return true
        } else if (docType === 'tos') {
          return result.docType.includes('tos')
        } else if (docType === 'privacy') {
          return result.docType.includes('pp')
        }
        return true
      })

    // Sort results
    const sorted = [...results].sort((a, b) => {
      switch (sort) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'z-a':
          return b.name.localeCompare(a.name)
        case 'oldest':
          return (
            new Date(b.lastAnalyzed).getTime() -
            new Date(a.lastAnalyzed).getTime()
          )
        case 'most-viewed':
          return b.views - a.views
        case 'recent':
        default:
          return (
            new Date(a.lastAnalyzed).getTime() -
            new Date(b.lastAnalyzed).getTime()
          )
      }
    })

    setFilteredResults(sorted)
  }

  // Handle explicit search action
  const handleSearch = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }

    setCurrentPage(1)
    setHasSearched(true)

    // Update URL
    const url = new URL(window.location.href)
    url.searchParams.set('q', searchQuery)
    url.searchParams.set('type', documentTypeFilter)
    url.searchParams.set('perPage', resultsPerPage.toString())
    url.searchParams.set('sort', sortOption)
    window.history.replaceState({}, '', url.toString())

    // Perform search
    performSearch()
  }

  // Actual search logic separated from event handler
  const performSearch = () => {
    console.log('Performing search with filter:', documentTypeFilter)
    // Filter results
    const results = allResults
      .filter((result) => {
        if (!searchQuery || searchQuery.trim() === '') {
          return true
        }

        const query = searchQuery.toLowerCase().trim()
        const name = result.name.toLowerCase()
        const url = result.url.toLowerCase()

        // Simple matching for demo
        return name.includes(query) || url.includes(query)
      })
      .filter((result) => {
        // Filter by document type
        if (documentTypeFilter === 'all') {
          return true
        } else if (documentTypeFilter === 'tos') {
          return result.docType.includes('tos')
        } else if (documentTypeFilter === 'privacy') {
          return result.docType.includes('pp')
        }
        return true
      })

    // Sort results
    const sorted = [...results].sort((a, b) => {
      switch (sortOption) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'z-a':
          return b.name.localeCompare(a.name)
        case 'oldest':
          return (
            new Date(b.lastAnalyzed).getTime() -
            new Date(a.lastAnalyzed).getTime()
          )
        case 'most-viewed':
          return b.views - a.views
        case 'recent':
        default:
          return (
            new Date(a.lastAnalyzed).getTime() -
            new Date(b.lastAnalyzed).getTime()
          )
      }
    })

    setFilteredResults(sorted)
  }

  // Update pagination when page changes or results are filtered
  useEffect(() => {
    if (filteredResults.length === 0) {
      setDisplayedResults([])
      return
    }

    const startIndex = (currentPage - 1) * resultsPerPage
    const endIndex = startIndex + resultsPerPage
    const paginatedResults = filteredResults.slice(startIndex, endIndex)
    setDisplayedResults(paginatedResults)
  }, [currentPage, resultsPerPage, filteredResults])

  // Generate page numbers for pagination
  const totalPages = Math.ceil(filteredResults.length / resultsPerPage)
  const pageNumbers: Array<number | 'ellipsis'> = []
  const maxPageButtons = 5

  if (totalPages <= maxPageButtons) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i)
    }
  } else {
    if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) {
        pageNumbers.push(i)
      }
      pageNumbers.push('ellipsis')
      pageNumbers.push(totalPages)
    } else if (currentPage >= totalPages - 2) {
      pageNumbers.push(1)
      pageNumbers.push('ellipsis')
      for (let i = totalPages - 3; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      pageNumbers.push(1)
      pageNumbers.push('ellipsis')
      pageNumbers.push(currentPage - 1)
      pageNumbers.push(currentPage)
      pageNumbers.push(currentPage + 1)
      pageNumbers.push('ellipsis')
      pageNumbers.push(totalPages)
    }
  }

  const handlePageChange = (page: number) => {
    const maxPage = Math.max(1, totalPages)
    const newPage = Math.min(Math.max(1, page), maxPage)
    setCurrentPage(newPage)
    window.scrollTo(0, 0)
  }

  // Get document type label
  const getDocumentTypeLabel = () => {
    switch (documentTypeFilter) {
      case 'tos':
        return 'Terms of Service'
      case 'privacy':
        return 'Privacy Policy'
      case 'all':
      default:
        return 'All Documents'
    }
  }

  // Get document type badges
  const getDocumentTypeBadges = (result: SearchResult) => {
    const hasTos = result.docType.includes('tos')
    const hasPp = result.docType.includes('pp')

    return (
      <div className='flex gap-2'>
        {hasTos && (
          <Badge
            className='cursor-pointer bg-blue-600 hover:bg-blue-700'
            onClick={() => {
              const url = `/analysis/${result.id}?docType=tos`
              window.location.href = url
            }}
          >
            <Tag className='h-3 w-3 mr-1' />
            ToS
          </Badge>
        )}
        {hasPp && (
          <Badge
            className='cursor-pointer bg-green-600 hover:bg-green-700'
            onClick={() => {
              const url = `/analysis/${result.id}?docType=privacy`
              window.location.href = url
            }}
          >
            <Tag className='h-3 w-3 mr-1' />
            PP
          </Badge>
        )}
      </div>
    )
  }

  // Fix issue with document type not being recognized when coming from hero section
  const handleDocumentTypeChange = (value: string) => {
    setDocumentTypeFilter(value)
    setCurrentPage(1)

    // Update URL with all current parameters
    const url = new URL(window.location.href)
    url.searchParams.set('type', value)
    // Preserve other parameters
    if (searchQuery) url.searchParams.set('q', searchQuery)
    url.searchParams.set('perPage', resultsPerPage.toString())
    window.history.replaceState({}, '', url.toString())

    // Perform search with the updated filter
    setTimeout(() => performSearch(), 0)
  }

  // Fix issue with sort option changes
  const handleSortOptionChange = (value: string) => {
    setSortOption(value)
    setCurrentPage(1)

    // Update URL with all current parameters
    const url = new URL(window.location.href)
    url.searchParams.set('sort', value)
    // Preserve other parameters
    if (searchQuery) url.searchParams.set('q', searchQuery)
    url.searchParams.set('type', documentTypeFilter)
    url.searchParams.set('perPage', resultsPerPage.toString())
    window.history.replaceState({}, '', url.toString())

    // Perform search with the updated sort option
    setTimeout(() => performSearch(), 0)
  }

  return (
    <div className='min-h-screen flex flex-col bg-white dark:bg-black'>
      <main className='flex-1'>
        <section className='w-full py-12 md:py-24'>
          <div className='container px-4 md:px-6'>
            <div className='space-y-4 mb-8'>
              <h1 className='text-3xl font-bold tracking-tighter sm:text-4xl text-black dark:text-white'>
                {hasSearched && searchQuery
                  ? `Search Results for "${searchQuery}"`
                  : 'Search'}
              </h1>
              <p className='text-gray-500 dark:text-gray-400 md:text-lg'>
                {hasSearched
                  ? `Showing analysis results for ${getDocumentTypeLabel()}`
                  : 'Search for Terms of Service and Privacy Policy analyses'}
              </p>
            </div>

            {/* Consistent width wrapper that doesn't depend on results state */}
            <div className='flex flex-col gap-6 max-w-5xl mx-auto'>
              {/* Search and filter bar */}
              <div className='mb-4 space-y-4 w-full'>
                <div className='w-full'>
                  <div className='flex flex-col gap-4'>
                    {/* Search input */}
                    <form
                      onSubmit={handleSearch}
                      className='flex flex-row gap-2 w-full'
                    >
                      <div className='relative flex-1'>
                        <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                        <Input
                          type='text'
                          placeholder='Search for a service...'
                          className='pl-10 border-gray-200 focus:border-gray-400 focus:ring-gray-400'
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <Button
                        type='submit'
                        className='bg-black text-white dark:bg-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-200'
                      >
                        Search
                      </Button>
                    </form>

                    {/* Filter controls */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                      {/* Document Type Filter */}
                      <div className='flex items-center gap-2 w-full'>
                        <Filter className='h-4 w-4 text-gray-500' />
                        <Select
                          value={documentTypeFilter}
                          onValueChange={handleDocumentTypeChange}
                        >
                          <SelectTrigger className='w-full border-gray-200'>
                            <SelectValue placeholder='Document Type' />
                          </SelectTrigger>
                          <SelectContent className='bg-white dark:bg-black border border-gray-200 shadow-md'>
                            <SelectItem value='all'>All Documents</SelectItem>
                            <SelectItem value='tos'>
                              Terms of Service
                            </SelectItem>
                            <SelectItem value='privacy'>
                              Privacy Policy
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Sort Options */}
                      <div className='flex items-center gap-2 w-full'>
                        <ArrowUpDown className='h-4 w-4 text-gray-500' />
                        <Select
                          value={sortOption}
                          onValueChange={handleSortOptionChange}
                        >
                          <SelectTrigger className='w-full border-gray-200'>
                            <SelectValue placeholder='Sort by' />
                          </SelectTrigger>
                          <SelectContent className='bg-white dark:bg-black border border-gray-200 shadow-md'>
                            <SelectItem value='recent'>Most Recent</SelectItem>
                            <SelectItem value='oldest'>Oldest First</SelectItem>
                            <SelectItem value='name'>A to Z</SelectItem>
                            <SelectItem value='z-a'>Z to A</SelectItem>
                            <SelectItem value='most-viewed'>
                              Most Viewed
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results count - only shown after search */}
              {hasSearched && (
                <div className='text-sm text-gray-500 mb-4 mt-2'>
                  Showing {displayedResults.length} of {filteredResults.length}{' '}
                  results
                </div>
              )}

              {/* Results area within same container */}
              <div className='w-full'>
                {/* Results grid - only shown after search */}
                {hasSearched ? (
                  displayedResults.length > 0 ? (
                    <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                      {displayedResults.map((result) => (
                        <Card
                          key={result.id}
                          className='border border-gray-200 hover:border-gray-300 transition-colors'
                        >
                          <CardHeader className='pb-3 overflow-hidden'>
                            <div className='flex items-start gap-4'>
                              {/* Logo/Image */}
                              <div className='w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0'>
                                {result.logo ? (
                                  <Image
                                    src={result.logo || '/placeholder.svg'}
                                    alt={`${result.name} logo`}
                                    className='h-8 w-8'
                                    width={32}
                                    height={32}
                                  />
                                ) : (
                                  <Globe className='h-6 w-6 text-gray-500' />
                                )}
                              </div>
                              <div className='min-w-0 flex-1'>
                                <CardTitle className='text-xl truncate'>
                                  {result.name}
                                </CardTitle>
                                <div className='flex items-center text-sm text-gray-500 mt-1 truncate'>
                                  <Globe className='h-3.5 w-3.5 mr-1 flex-shrink-0' />
                                  <span className='truncate'>{result.url}</span>
                                </div>
                              </div>
                            </div>
                            {/* Add ToS/PP tags */}
                            <div className='flex gap-2 mt-3'>
                              {getDocumentTypeBadges(result)}
                            </div>
                          </CardHeader>
                          <CardContent className='pb-3'>
                            <div className='space-y-3'>
                              <div className='flex items-center text-sm text-gray-500'>
                                <Clock className='h-4 w-4 mr-2' />
                                <span>
                                  Last analyzed: {result.lastAnalyzed}
                                </span>
                              </div>
                              <div className='flex items-center text-sm text-gray-500'>
                                <Eye className='h-4 w-4 mr-2' />
                                <span>
                                  {result.views.toLocaleString()} views
                                </span>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className='pt-2'>
                            <Button
                              variant='outline'
                              size='sm'
                              className='w-full gap-1 border-gray-200 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-200'
                              asChild
                            >
                              <Link href={`/analysis/${result.id}`}>
                                View Analysis
                                <ExternalLink className='h-3 w-3' />
                              </Link>
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className='text-center py-12'>
                      <p className='text-lg font-medium'>{`No results found for "${searchQuery}"`}</p>
                      <p className='text-gray-500 mt-2'>
                        Try adjusting your search or filters
                      </p>
                    </div>
                  )
                ) : (
                  <div className='text-center py-12'>
                    <p className='text-lg font-medium'>
                      Enter a search term and click Search
                    </p>
                    <p className='text-gray-500 mt-2'>
                      Search for privacy policies and terms of service
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination - only shown when we have results */}
              {hasSearched && filteredResults.length > 0 && (
                <div className='flex justify-between items-center mt-8'>
                  <div className='text-sm text-gray-500'>
                    Page {currentPage} of {Math.max(1, totalPages)}
                  </div>

                  <div className='flex items-center gap-1'>
                    <Button
                      variant='outline'
                      size='icon'
                      className='h-10 w-10 border-gray-200 rounded-md'
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <span className='sr-only'>Previous page</span>
                      <svg
                        width='15'
                        height='15'
                        viewBox='0 0 15 15'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-4 w-4'
                      >
                        <path
                          d='M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z'
                          fill='currentColor'
                          fillRule='evenodd'
                          clipRule='evenodd'
                        ></path>
                      </svg>
                    </Button>

                    {totalPages > 0 ? (
                      pageNumbers.map((page, index) =>
                        page === 'ellipsis' ? (
                          <span
                            key={`ellipsis-${index}`}
                            className='px-2 text-gray-500'
                          >
                            ...
                          </span>
                        ) : (
                          <Button
                            key={`page-${page}`}
                            variant={
                              currentPage === page ? 'default' : 'outline'
                            }
                            size='icon'
                            className={`h-10 w-10 border-gray-200 rounded-md ${
                              currentPage === page
                                ? 'bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200'
                                : ''
                            }`}
                            onClick={() => handlePageChange(page as number)}
                          >
                            {page}
                          </Button>
                        )
                      )
                    ) : (
                      <Button
                        variant='default'
                        size='icon'
                        className='h-10 w-10 border-gray-200 rounded-md bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200'
                      >
                        1
                      </Button>
                    )}

                    <Button
                      variant='outline'
                      size='icon'
                      className='h-10 w-10 border-gray-200 rounded-md'
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= Math.max(1, totalPages)}
                    >
                      <span className='sr-only'>Next page</span>
                      <svg
                        width='15'
                        height='15'
                        viewBox='0 0 15 15'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-4 w-4'
                      >
                        <path
                          d='M6.1584 3.13514C5.95694 3.32401 5.94673 3.64042 6.13559 3.84188L9.565 7.49991L6.13559 11.1579C5.94673 11.3594 5.95694 11.6758 6.13559 11.8647C6.35986 12.0535 6.67627 12.0433 6.86514 11.8419L10.6151 7.84188C10.7954 7.64955 10.7954 7.35027 10.6151 7.15794L6.86514 3.15794C6.67627 2.95648 6.35986 2.94628 6.1584 3.13514Z'
                          fill='currentColor'
                          fillRule='evenodd'
                          clipRule='evenodd'
                        ></path>
                      </svg>
                    </Button>

                    <div className='ml-4'>
                      <Select
                        value={resultsPerPage.toString()}
                        onValueChange={(value) => {
                          const newResultsPerPage = Number.parseInt(value)
                          setCurrentPage(1)
                          setResultsPerPage(newResultsPerPage)

                          // Update URL to preserve params
                          const url = new URL(window.location.href)
                          url.searchParams.set('perPage', value)
                          // Preserve existing search and type params
                          if (searchQuery)
                            url.searchParams.set('q', searchQuery)
                          // Always set the document type filter to maintain current selection
                          url.searchParams.set('type', documentTypeFilter)
                          window.history.pushState({}, '', url.toString())

                          // Use immediate function to ensure we're using the latest state
                          setTimeout(() => {
                            // Re-trigger search to preserve filters with current values
                            performSearch()
                          }, 0)
                        }}
                      >
                        <SelectTrigger className='w-[130px] border-gray-200'>
                          <SelectValue placeholder='Items per page' />
                        </SelectTrigger>
                        <SelectContent className='bg-white dark:bg-black border border-gray-200 shadow-md'>
                          <SelectItem value='6'>6 / page</SelectItem>
                          <SelectItem value='9'>9 / page</SelectItem>
                          <SelectItem value='12'>12 / page</SelectItem>
                          <SelectItem value='15'>15 / page</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
