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

// Mock data for search results
const allResults = [
  {
    id: 1,
    name: 'Twitter',
    url: 'twitter.com',
    lastAnalyzed: '2023-11-15',
    views: 1250,
    category: 'Social Media',
  },
  {
    id: 2,
    name: 'Facebook',
    url: 'facebook.com',
    lastAnalyzed: '2023-11-10',
    views: 2340,
    category: 'Social Media',
  },
  {
    id: 3,
    name: 'Instagram',
    url: 'instagram.com',
    lastAnalyzed: '2023-11-05',
    views: 1890,
    category: 'Social Media',
  },
  {
    id: 4,
    name: 'Spotify',
    url: 'spotify.com',
    lastAnalyzed: '2023-10-28',
    views: 980,
    category: 'Entertainment',
  },
  {
    id: 5,
    name: 'Netflix',
    url: 'netflix.com',
    lastAnalyzed: '2023-10-22',
    views: 1560,
    category: 'Entertainment',
  },
  {
    id: 6,
    name: 'Amazon',
    url: 'amazon.com',
    lastAnalyzed: '2023-10-18',
    views: 2100,
    category: 'E-commerce',
  },
  {
    id: 7,
    name: 'Google',
    url: 'google.com',
    lastAnalyzed: '2023-10-15',
    views: 3200,
    category: 'Technology',
  },
  {
    id: 8,
    name: 'Microsoft',
    url: 'microsoft.com',
    lastAnalyzed: '2023-10-10',
    views: 1450,
    category: 'Technology',
  },
  {
    id: 9,
    name: 'Apple',
    url: 'apple.com',
    lastAnalyzed: '2023-10-05',
    views: 1870,
    category: 'Technology',
  },
  {
    id: 10,
    name: 'Reddit',
    url: 'reddit.com',
    lastAnalyzed: '2023-10-01',
    views: 1320,
    category: 'Social Media',
  },
  {
    id: 11,
    name: 'YouTube',
    url: 'youtube.com',
    lastAnalyzed: '2023-09-28',
    views: 2450,
    category: 'Entertainment',
  },
  {
    id: 12,
    name: 'LinkedIn',
    url: 'linkedin.com',
    lastAnalyzed: '2023-09-25',
    views: 980,
    category: 'Social Media',
  },
]

export default function ResultsPage() {
  const searchParams = useSearchParams()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [documentTypeFilter, setDocumentTypeFilter] = useState('both') // Default to "both"
  const [sortOption, setSortOption] = useState('recent')
  const [resultsPerPage, setResultsPerPage] = useState(6)

  // Get search query and document type from URL parameters
  useEffect(() => {
    const queryParam = searchParams.get('q')
    const typeParam = searchParams.get('type')

    if (queryParam) {
      setSearchQuery(queryParam)
    }

    if (typeParam && ['tos', 'privacy', 'both'].includes(typeParam)) {
      setDocumentTypeFilter(typeParam)
    }
  }, [searchParams])

  // Filter results with improved matching
  const filteredResults = allResults.filter((result) => {
    if (!searchQuery || searchQuery.trim() === '') {
      // Show all results if no search query
      return true
    }

    const query = searchQuery.toLowerCase().trim()
    const name = result.name.toLowerCase()
    const url = result.url.toLowerCase()

    // Exact match
    if (name.includes(query) || url.includes(query)) {
      return true
    }

    // Check for typos - calculate similarity using Levenshtein-like approach
    // This helps match "Facbbook" to "Facebook"
    function isSimilar(a: string, b: string, threshold = 0.7): boolean {
      // Very simple similarity check - more than 70% of characters match
      const longer = a.length > b.length ? a : b
      const shorter = a.length > b.length ? b : a

      if (shorter.length === 0) return longer.length === 0

      // If either string contains the other, it's very similar
      if (longer.includes(shorter)) return true

      // Count matching characters
      let matches = 0
      for (let i = 0; i < shorter.length; i++) {
        if (longer.includes(shorter[i])) {
          matches++
        }
      }

      return matches / shorter.length >= threshold
    }

    return isSimilar(name, query) || isSimilar(url, query)
  })

  // Sort results
  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortOption) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'z-a':
        return b.name.localeCompare(a.name)
      case 'oldest':
        return b.id - a.id
      case 'most-viewed':
        return b.views - a.views
      case 'recent':
      default:
        return a.id - b.id
    }
  })

  // Paginate results
  const totalPages = Math.ceil(sortedResults.length / resultsPerPage)
  const paginatedResults = sortedResults.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  )

  // Generate page numbers for pagination
  const pageNumbers = []
  const maxPageButtons = 5

  if (totalPages <= maxPageButtons) {
    // Show all page numbers
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i)
    }
  } else {
    // Show limited page numbers with ellipsis
    if (currentPage <= 3) {
      // Near the start
      for (let i = 1; i <= 4; i++) {
        pageNumbers.push(i)
      }
      pageNumbers.push('ellipsis')
      pageNumbers.push(totalPages)
    } else if (currentPage >= totalPages - 2) {
      // Near the end
      pageNumbers.push(1)
      pageNumbers.push('ellipsis')
      for (let i = totalPages - 3; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Middle
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
    setCurrentPage(page)
    window.scrollTo(0, 0)
  }

  const handleSearch = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }
    setCurrentPage(1)
    // Update URL with search parameters without page reload
    const url = new URL(window.location.href)
    url.searchParams.set('q', searchQuery)
    url.searchParams.set('type', documentTypeFilter)
    window.history.pushState({}, '', url.toString())
  }

  // Get document type label
  const getDocumentTypeLabel = () => {
    switch (documentTypeFilter) {
      case 'tos':
        return 'Terms of Service'
      case 'privacy':
        return 'Privacy Policy'
      case 'both':
        return 'Terms of Service and Privacy Policy'
      default:
        return 'Terms of Service and Privacy Policy'
    }
  }

  return (
    <div className='min-h-screen flex flex-col bg-white dark:bg-black'>
      <main className='flex-1'>
        <section className='w-full py-12 md:py-24'>
          <div className='container px-4 md:px-6'>
            <div className='space-y-4 mb-8'>
              <h1 className='text-3xl font-bold tracking-tighter sm:text-4xl text-black dark:text-white'>
                Search Results {`for "${searchQuery}"`}
              </h1>
              <p className='text-gray-500 dark:text-gray-400 md:text-lg'>
                Showing analysis results for {getDocumentTypeLabel()}
              </p>
            </div>

            <div className='flex flex-col gap-6'>
              {/* Search and filter bar - New compact design */}
              <div className='mb-4 space-y-4'>
                {/* Search button that expands to show all controls */}
                <div className='relative w-full'>
                  <div className='flex flex-col gap-4'>
                    {/* Search input always visible */}
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
                        type='button'
                        className='bg-black text-white dark:bg-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-200'
                        onClick={handleSearch}
                      >
                        Search
                      </Button>
                    </form>

                    {/* Filter controls in a more compact layout */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                      {/* Document Type Filter */}
                      <div className='flex items-center gap-2 w-full'>
                        <Filter className='h-4 w-4 text-gray-500' />
                        <Select
                          value={documentTypeFilter}
                          onValueChange={(value) => {
                            setDocumentTypeFilter(value)
                            setCurrentPage(1)
                            // Trigger search with new filter
                            handleSearch()
                          }}
                        >
                          <SelectTrigger className='w-full border-gray-200'>
                            <SelectValue placeholder='Document Type' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='both'>Both Documents</SelectItem>
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
                          onValueChange={(value) => {
                            setSortOption(value)
                            setCurrentPage(1)
                          }}
                        >
                          <SelectTrigger className='w-full border-gray-200'>
                            <SelectValue placeholder='Sort by' />
                          </SelectTrigger>
                          <SelectContent>
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

              {/* Results count */}
              <div className='text-sm text-gray-500 mb-4 mt-2'>
                Showing {paginatedResults.length} of {filteredResults.length}{' '}
                results
              </div>

              {/* Results grid */}
              {paginatedResults.length > 0 ? (
                <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                  {paginatedResults.map((result) => (
                    <Card
                      key={result.id}
                      className='border border-gray-200 hover:border-gray-300 transition-colors'
                    >
                      <CardHeader className='pb-3'>
                        <div className='flex items-start gap-4'>
                          {/* Logo/Image */}
                          <div className='w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0'>
                            <Globe className='h-6 w-6 text-gray-500' />
                          </div>
                          <div>
                            <CardTitle className='text-xl'>
                              {result.name}
                            </CardTitle>
                            <div className='flex items-center text-sm text-gray-500 mt-1'>
                              <Globe className='h-3.5 w-3.5 mr-1' />
                              {result.url}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className='pb-3'>
                        <div className='space-y-3'>
                          <div className='flex items-center text-sm text-gray-500'>
                            <Clock className='h-4 w-4 mr-2' />
                            <span>Last analyzed: {result.lastAnalyzed}</span>
                          </div>
                          <div className='flex items-center text-sm text-gray-500'>
                            <Eye className='h-4 w-4 mr-2' />
                            <span>{result.views.toLocaleString()} views</span>
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
                          <Link href='/search'>
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
                  <p className='text-lg font-medium'>
                    {`No results found for "${searchQuery}"`}
                  </p>
                  <p className='text-gray-500 mt-2'>
                    Try adjusting your search or filters
                  </p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className='flex justify-between items-center mt-8'>
                  <div className='text-sm text-gray-500'>
                    Page {currentPage} of {totalPages}
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

                    {pageNumbers.map((page, index) =>
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
                          variant={currentPage === page ? 'default' : 'outline'}
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
                    )}

                    <Button
                      variant='outline'
                      size='icon'
                      className='h-10 w-10 border-gray-200 rounded-md'
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
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
                        }}
                      >
                        <SelectTrigger className='w-[130px] border-gray-200'>
                          <SelectValue placeholder='Items per page' />
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
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
