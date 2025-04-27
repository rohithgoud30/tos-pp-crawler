'use client'

import type React from 'react'
import { useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { searchDocuments } from '@/lib/api'
import type { DocumentItem, PaginatedResponse } from '@/lib/api'

interface SearchBarProps {
  onSearch: (
    results: PaginatedResponse<DocumentItem>,
    searchQuery: string
  ) => void
  onSearchStart: () => void
  onSearchError: (error: Error) => void
  documentType?: 'tos' | 'pp'
}

export function SearchBar({
  onSearch,
  onSearchStart,
  onSearchError,
  documentType,
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) return

    setIsLoading(true)
    onSearchStart()

    try {
      const results = await searchDocuments({
        search_text: searchQuery,
        document_type: documentType,
        page: 1,
        per_page: 6,
      })
      onSearch(results, searchQuery)
    } catch (error) {
      console.error('Search error:', error)
      onSearchError(
        error instanceof Error ? error : new Error('An unknown error occurred')
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='w-full'>
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
        <Input
          type='text'
          placeholder='Search by company name or URL...'
          className='pl-10 h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <Button
        type='submit'
        className='mt-2 w-full bg-black text-white hover:bg-gray-800 font-medium'
        disabled={isLoading}
      >
        {isLoading ? 'Searching...' : 'Search'}
      </Button>
    </form>
  )
}
