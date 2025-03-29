'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import {
  Search,
  X,
  ExternalLink,
  AlertTriangle,
  Shield,
  Clock,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Mock data for search results
const mockResults = [
  {
    id: 1,
    name: 'Twitter',
    url: 'twitter.com',
    tosScore: 45,
    privacyScore: 60,
    redFlags: 3,
    lastUpdated: '2 months ago',
  },
  {
    id: 2,
    name: 'Facebook',
    url: 'facebook.com',
    tosScore: 35,
    privacyScore: 40,
    redFlags: 5,
    lastUpdated: '1 month ago',
  },
  {
    id: 3,
    name: 'Instagram',
    url: 'instagram.com',
    tosScore: 40,
    privacyScore: 45,
    redFlags: 4,
    lastUpdated: '3 weeks ago',
  },
  {
    id: 4,
    name: 'Spotify',
    url: 'spotify.com',
    tosScore: 65,
    privacyScore: 70,
    redFlags: 1,
    lastUpdated: '2 weeks ago',
  },
  {
    id: 5,
    name: 'Netflix',
    url: 'netflix.com',
    tosScore: 55,
    privacyScore: 60,
    redFlags: 2,
    lastUpdated: '1 week ago',
  },
]

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const [documentType, setDocumentType] = useState('both')
  const [searchResults, setSearchResults] = useState<typeof mockResults>([])
  const [isSearching, setIsSearching] = useState(false)

  // Simulate search as user types (partial matching)
  useEffect(() => {
    if (searchQuery.length > 1) {
      setIsSearching(true)
      const lowerQuery = searchQuery.toLowerCase()

      // Simulate network delay
      const timer = setTimeout(() => {
        const filteredResults = mockResults.filter(
          (result) =>
            result.name.toLowerCase().includes(lowerQuery) ||
            result.url.toLowerCase().includes(lowerQuery)
        )
        setSearchResults(filteredResults)
        setIsSearching(false)
      }, 300)

      return () => clearTimeout(timer)
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Full search would be handled here
    console.log('Searching for:', searchQuery, 'Document type:', documentType)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
  }

  return (
    <section className='w-full py-20 md:py-28 lg:py-36 flex items-center justify-center'>
      <div className='container px-4 md:px-6 max-w-2xl'>
        <div className='flex flex-col items-center space-y-12 text-center'>
          <div className='space-y-4'>
            <h1 className='text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl'>
              {`🧠 Understand What You're Agreeing To`}
            </h1>
            <p className='mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed'>
              {`CRWLR analyzes Terms of Service and Privacy Policies so you don't
              have to read the fine print.`}
            </p>
          </div>

          <form onSubmit={handleSubmit} className='w-full space-y-6 relative'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400' />
              <Input
                type='text'
                placeholder='Search by Product/Service Name or URL'
                className='pl-10 pr-10 h-14 text-base border-gray-200 dark:border-gray-700 focus:border-gray-400 dark:focus:border-gray-500 focus:ring-gray-400 dark:focus:ring-gray-500'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type='button'
                  onClick={clearSearch}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
                >
                  <X className='h-5 w-5' />
                  <span className='sr-only'>Clear search</span>
                </button>
              )}
            </div>

            <div className='flex justify-center pt-2'>
              <div className='inline-flex h-10 items-center rounded-md border border-gray-200 dark:border-white/10 p-1 text-sm font-medium'>
                <button
                  type='button'
                  className={`inline-flex items-center justify-center rounded-sm px-3 py-1.5 ${
                    documentType === 'tos'
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'bg-transparent hover:bg-gray-100 dark:hover:bg-white/10'
                  }`}
                  onClick={() => setDocumentType('tos')}
                >
                  Terms of Service
                </button>
                <button
                  type='button'
                  className={`inline-flex items-center justify-center rounded-sm px-3 py-1.5 ${
                    documentType === 'privacy'
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'bg-transparent hover:bg-gray-100 dark:hover:bg-white/10'
                  }`}
                  onClick={() => setDocumentType('privacy')}
                >
                  Privacy Policy
                </button>
                <button
                  type='button'
                  className={`inline-flex items-center justify-center rounded-sm px-3 py-1.5 ${
                    documentType === 'both'
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'bg-transparent hover:bg-gray-100 dark:hover:bg-white/10'
                  }`}
                  onClick={() => setDocumentType('both')}
                >
                  Both
                </button>
              </div>
            </div>

            <Button
              type='submit'
              className='w-full h-14 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-200 font-medium text-base'
            >
              Search
            </Button>

            {/* Real-time search results */}
            {searchQuery.length > 1 && (
              <div className='absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg'>
                {isSearching ? (
                  <div className='p-4 text-center text-gray-500'>
                    <div className='animate-pulse'>Searching...</div>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className='max-h-80 overflow-y-auto'>
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className='border-b border-gray-100 last:border-0'
                      >
                        <a
                          href={`/analysis/${result.id}`}
                          className='block p-4 hover:bg-gray-50 transition-colors'
                        >
                          <div className='flex justify-between items-start'>
                            <div>
                              <h3 className='font-medium text-black'>
                                {result.name}
                              </h3>
                              <p className='text-sm text-gray-500'>
                                {result.url}
                              </p>
                            </div>
                            <Badge
                              variant='outline'
                              className='flex items-center gap-1 text-xs'
                            >
                              <Clock className='h-3 w-3' />
                              {result.lastUpdated}
                            </Badge>
                          </div>

                          <div className='mt-2 flex flex-wrap gap-2'>
                            <Badge className='bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center gap-1'>
                              <Shield className='h-3 w-3' />
                              TOS: {result.tosScore}/100
                            </Badge>
                            <Badge className='bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center gap-1'>
                              <Shield className='h-3 w-3' />
                              Privacy: {result.privacyScore}/100
                            </Badge>
                            <Badge className='bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center gap-1'>
                              <AlertTriangle className='h-3 w-3' />
                              {result.redFlags} red flags
                            </Badge>
                          </div>
                        </a>
                      </div>
                    ))}
                    <div className='p-2 border-t border-gray-100'>
                      <Button
                        variant='ghost'
                        className='w-full text-sm text-gray-500 hover:text-black flex items-center justify-center gap-1'
                        onClick={handleSubmit}
                      >
                        View all results
                        <ExternalLink className='h-3 w-3' />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className='p-4 text-center text-gray-500'>
                    {`No results found for &quot;${searchQuery}&quot;`}
                  </div>
                )}
              </div>
            )}

            <p className='text-xs text-gray-500 text-center mt-2'>
              {`No login required — instantly analyze any service's legal
              documents`}
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}
