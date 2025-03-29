'use client'

import { useState } from 'react'
import { Search, Filter, ArrowUpDown, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
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
    tosScore: 45,
    privacyScore: 60,
    redFlags: 3,
    category: 'Social Media',
  },
  {
    id: 2,
    name: 'Facebook',
    url: 'facebook.com',
    lastAnalyzed: '2023-11-10',
    tosScore: 35,
    privacyScore: 40,
    redFlags: 5,
    category: 'Social Media',
  },
  {
    id: 3,
    name: 'Instagram',
    url: 'instagram.com',
    lastAnalyzed: '2023-11-05',
    tosScore: 40,
    privacyScore: 45,
    redFlags: 4,
    category: 'Social Media',
  },
  {
    id: 4,
    name: 'Spotify',
    url: 'spotify.com',
    lastAnalyzed: '2023-10-28',
    tosScore: 65,
    privacyScore: 70,
    redFlags: 1,
    category: 'Entertainment',
  },
  {
    id: 5,
    name: 'Netflix',
    url: 'netflix.com',
    lastAnalyzed: '2023-10-22',
    tosScore: 55,
    privacyScore: 60,
    redFlags: 2,
    category: 'Entertainment',
  },
  {
    id: 6,
    name: 'Amazon',
    url: 'amazon.com',
    lastAnalyzed: '2023-10-18',
    tosScore: 40,
    privacyScore: 45,
    redFlags: 4,
    category: 'E-commerce',
  },
  {
    id: 7,
    name: 'Google',
    url: 'google.com',
    lastAnalyzed: '2023-10-15',
    tosScore: 50,
    privacyScore: 55,
    redFlags: 3,
    category: 'Technology',
  },
  {
    id: 8,
    name: 'Microsoft',
    url: 'microsoft.com',
    lastAnalyzed: '2023-10-10',
    tosScore: 60,
    privacyScore: 65,
    redFlags: 2,
    category: 'Technology',
  },
  {
    id: 9,
    name: 'Apple',
    url: 'apple.com',
    lastAnalyzed: '2023-10-05',
    tosScore: 65,
    privacyScore: 70,
    redFlags: 1,
    category: 'Technology',
  },
  {
    id: 10,
    name: 'Reddit',
    url: 'reddit.com',
    lastAnalyzed: '2023-10-01',
    tosScore: 55,
    privacyScore: 50,
    redFlags: 3,
    category: 'Social Media',
  },
  {
    id: 11,
    name: 'YouTube',
    url: 'youtube.com',
    lastAnalyzed: '2023-09-28',
    tosScore: 50,
    privacyScore: 45,
    redFlags: 4,
    category: 'Entertainment',
  },
  {
    id: 12,
    name: 'LinkedIn',
    url: 'linkedin.com',
    lastAnalyzed: '2023-09-25',
    tosScore: 60,
    privacyScore: 55,
    redFlags: 2,
    category: 'Social Media',
  },
  {
    id: 13,
    name: 'TikTok',
    url: 'tiktok.com',
    lastAnalyzed: '2023-09-20',
    tosScore: 35,
    privacyScore: 30,
    redFlags: 6,
    category: 'Social Media',
  },
  {
    id: 14,
    name: 'Uber',
    url: 'uber.com',
    lastAnalyzed: '2023-09-15',
    tosScore: 45,
    privacyScore: 40,
    redFlags: 4,
    category: 'Transportation',
  },
  {
    id: 15,
    name: 'Airbnb',
    url: 'airbnb.com',
    lastAnalyzed: '2023-09-10',
    tosScore: 55,
    privacyScore: 50,
    redFlags: 3,
    category: 'Travel',
  },
  {
    id: 16,
    name: 'Dropbox',
    url: 'dropbox.com',
    lastAnalyzed: '2023-09-05',
    tosScore: 65,
    privacyScore: 70,
    redFlags: 1,
    category: 'Technology',
  },
]

export default function ResultsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortOption, setSortOption] = useState('recent')

  const resultsPerPage = 6

  // Filter and sort results
  const filteredResults = allResults.filter((result) => {
    const matchesSearch =
      searchQuery === '' ||
      result.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.url.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      categoryFilter === 'all' ||
      result.category.toLowerCase() === categoryFilter.toLowerCase()

    return matchesSearch && matchesCategory
  })

  // Sort results
  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortOption) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'tos-high':
        return b.tosScore - a.tosScore
      case 'tos-low':
        return a.tosScore - b.tosScore
      case 'privacy-high':
        return b.privacyScore - a.privacyScore
      case 'privacy-low':
        return a.privacyScore - b.privacyScore
      case 'flags':
        return b.redFlags - a.redFlags
      case 'recent':
      default:
        // Assuming the most recent is at the top of our array
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

  return (
    <div className='min-h-screen flex flex-col bg-white dark:bg-black'>
      <main className='flex-1'>
        <section className='w-full py-12 md:py-24'>
          <div className='container px-4 md:px-6'>
            <div className='space-y-4 mb-8'>
              <h1 className='text-3xl font-bold tracking-tighter sm:text-4xl text-black dark:text-white'>
                Search Results
              </h1>
              <p className='text-gray-500 dark:text-gray-400 md:text-lg'>
                Showing analysis results for Terms of Service and Privacy
                Policies
              </p>
            </div>

            <div className='flex flex-col gap-6'>
              {/* Search and filter bar */}
              <div className='flex flex-col md:flex-row gap-4'>
                <div className='relative flex-1'>
                  <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                  <Input
                    type='text'
                    placeholder='Refine your search...'
                    className='pl-10 border-gray-200 focus:border-gray-400 focus:ring-gray-400'
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                  />
                </div>

                <div className='flex flex-col sm:flex-row gap-4'>
                  <div className='flex items-center gap-2'>
                    <Filter className='h-4 w-4 text-gray-500' />
                    <Select
                      value={categoryFilter}
                      onValueChange={(value) => {
                        setCategoryFilter(value)
                        setCurrentPage(1)
                      }}
                    >
                      <SelectTrigger className='w-[180px] border-gray-200'>
                        <SelectValue placeholder='Category' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='all'>All Categories</SelectItem>
                        <SelectItem value='social media'>
                          Social Media
                        </SelectItem>
                        <SelectItem value='entertainment'>
                          Entertainment
                        </SelectItem>
                        <SelectItem value='e-commerce'>E-commerce</SelectItem>
                        <SelectItem value='technology'>Technology</SelectItem>
                        <SelectItem value='transportation'>
                          Transportation
                        </SelectItem>
                        <SelectItem value='travel'>Travel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='flex items-center gap-2'>
                    <ArrowUpDown className='h-4 w-4 text-gray-500' />
                    <Select
                      value={sortOption}
                      onValueChange={(value) => {
                        setSortOption(value)
                        setCurrentPage(1)
                      }}
                    >
                      <SelectTrigger className='w-[180px] border-gray-200'>
                        <SelectValue placeholder='Sort by' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='recent'>Most Recent</SelectItem>
                        <SelectItem value='name'>Name (A-Z)</SelectItem>
                        <SelectItem value='tos-high'>
                          TOS Score (High-Low)
                        </SelectItem>
                        <SelectItem value='tos-low'>
                          TOS Score (Low-High)
                        </SelectItem>
                        <SelectItem value='privacy-high'>
                          Privacy Score (High-Low)
                        </SelectItem>
                        <SelectItem value='privacy-low'>
                          Privacy Score (Low-High)
                        </SelectItem>
                        <SelectItem value='flags'>
                          Red Flags (Most-Least)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Results count */}
              <div className='text-sm text-gray-500'>
                Showing {paginatedResults.length} of {filteredResults.length}{' '}
                results
              </div>

              {/* Results grid */}
              {paginatedResults.length > 0 ? (
                <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                  {paginatedResults.map((result) => (
                    <Card key={result.id} className='border border-gray-200'>
                      <CardHeader className='pb-3'>
                        <div className='flex justify-between items-start'>
                          <div>
                            <CardTitle className='text-xl'>
                              {result.name}
                            </CardTitle>
                            <p className='text-sm text-gray-500'>
                              {result.url}
                            </p>
                          </div>
                          <Badge className='bg-gray-100 text-gray-800 hover:bg-gray-200'>
                            {result.category}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className='pb-3'>
                        <div className='space-y-3'>
                          <div className='flex justify-between items-center'>
                            <span className='text-sm text-gray-500'>
                              Terms of Service
                            </span>
                            <div className='flex items-center gap-2'>
                              <div className='w-24 h-2 bg-gray-100 rounded-full overflow-hidden'>
                                <div
                                  className={`h-full rounded-full ${
                                    result.tosScore >= 70
                                      ? 'bg-green-500'
                                      : result.tosScore >= 50
                                      ? 'bg-yellow-500'
                                      : 'bg-red-500'
                                  }`}
                                  style={{ width: `${result.tosScore}%` }}
                                ></div>
                              </div>
                              <span className='text-sm font-medium'>
                                {result.tosScore}/100
                              </span>
                            </div>
                          </div>

                          <div className='flex justify-between items-center'>
                            <span className='text-sm text-gray-500'>
                              Privacy Policy
                            </span>
                            <div className='flex items-center gap-2'>
                              <div className='w-24 h-2 bg-gray-100 rounded-full overflow-hidden'>
                                <div
                                  className={`h-full rounded-full ${
                                    result.privacyScore >= 70
                                      ? 'bg-green-500'
                                      : result.privacyScore >= 50
                                      ? 'bg-yellow-500'
                                      : 'bg-red-500'
                                  }`}
                                  style={{ width: `${result.privacyScore}%` }}
                                ></div>
                              </div>
                              <span className='text-sm font-medium'>
                                {result.privacyScore}/100
                              </span>
                            </div>
                          </div>

                          <div className='flex justify-between items-center'>
                            <span className='text-sm text-gray-500'>
                              Red Flags
                            </span>
                            <Badge
                              className={`${
                                result.redFlags <= 1
                                  ? 'bg-green-100 text-green-800'
                                  : result.redFlags <= 3
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {result.redFlags}{' '}
                              {result.redFlags === 1 ? 'issue' : 'issues'}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className='pt-2'>
                        <div className='w-full flex justify-between items-center'>
                          <span className='text-xs text-gray-500'>
                            Analyzed: {result.lastAnalyzed}
                          </span>
                          <Button
                            variant='outline'
                            size='sm'
                            className='gap-1 border-gray-200'
                            asChild
                          >
                            <Link href={`/analysis/${result.id}`}>
                              View Analysis
                              <ExternalLink className='h-3 w-3' />
                            </Link>
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className='text-center py-12'>
                  <p className='text-lg font-medium'>No results found</p>
                  <p className='text-gray-500 mt-2'>
                    Try adjusting your search or filters
                  </p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className='flex justify-center mt-8'>
                  <nav className='flex items-center gap-1'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='border-gray-200'
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
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
                          variant='outline'
                          size='sm'
                          className={`border-gray-200 ${
                            currentPage === page ? 'bg-gray-100' : ''
                          }`}
                          onClick={() => handlePageChange(page as number)}
                        >
                          {page}
                        </Button>
                      )
                    )}

                    <Button
                      variant='outline'
                      size='sm'
                      className='border-gray-200'
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
