'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { DocumentStatsDisplay } from '@/components/document-stats-display'

// Example services that can be searched
const searchExamples = [
  'Facebook',
  'Twitter',
  'Instagram',
  'Google',
  'Amazon',
  'Apple',
  'Microsoft',
  'Netflix',
  'Spotify',
  'TikTok',
  'LinkedIn',
  'YouTube',
]

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const [tosSelected, setTosSelected] = useState(true)
  const [ppSelected, setPpSelected] = useState(true)
  const [placeholder, setPlaceholder] = useState(
    'Try searching for a service name'
  )
  const [error, setError] = useState('')

  // Set random example placeholder after initial render to avoid hydration mismatch
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * searchExamples.length)
    setPlaceholder(
      `Try searching for "${searchExamples[randomIndex]}" or any service name`
    )
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) {
      setError('Please enter a search term')
      return
    }

    setError('')

    // Build the URL with search parameters
    const url = new URL('/results', window.location.origin)

    // Add search query
    url.searchParams.set('q', searchQuery)

    // Add document type if specified
    if (tosSelected && !ppSelected) {
      url.searchParams.set('type', 'tos')
    } else if (ppSelected && !tosSelected) {
      url.searchParams.set('type', 'pp')
    } else if (tosSelected && ppSelected) {
      // If both are selected, we can either omit the parameter (for "All")
      // or use a custom parameter to indicate both
      url.searchParams.set('type', 'both')
    }

    // Add default parameters
    url.searchParams.set('perPage', '6')
    url.searchParams.set('sort', 'updated_at')
    url.searchParams.set('order', 'desc')

    // Navigate to the URL
    window.location.href = url.toString()
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
              {`CRWLR analyzes Terms of Service and Privacy Policies so you don't have to read the fine print.`}
            </p>
            <div className='flex justify-center pt-2'>
              <DocumentStatsDisplay />
            </div>
          </div>

          <div className='flex justify-center gap-6 pt-2'>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='tos'
                checked={tosSelected}
                onCheckedChange={(checked) => {
                  setTosSelected(checked === true)
                }}
                className='h-5 w-5'
              />
              <Label
                htmlFor='tos'
                className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
              >
                Terms of Service
              </Label>
            </div>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='pp'
                checked={ppSelected}
                onCheckedChange={(checked) => {
                  setPpSelected(checked === true)
                }}
                className='h-5 w-5'
              />
              <Label
                htmlFor='pp'
                className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
              >
                Privacy Policy
              </Label>
            </div>
          </div>

          <form onSubmit={handleSubmit} className='w-full space-y-4 relative'>
            <div className='space-y-2'>
              <div className='relative flex items-center'>
                <Input
                  type='text'
                  placeholder={placeholder}
                  className={`pr-12 h-14 text-base ${
                    error
                      ? 'border-red-500 focus-visible:ring-red-500'
                      : 'border-input focus-visible:ring-ring'
                  }`}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    if (e.target.value.trim()) {
                      setError('')
                    }
                  }}
                  aria-invalid={error ? 'true' : 'false'}
                  aria-describedby={error ? 'search-error' : undefined}
                />
                <Button
                  type='submit'
                  size='icon'
                  className='absolute right-1 h-12 w-12 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-200'
                >
                  <Search className='h-5 w-5' />
                  <span className='sr-only'>Search</span>
                </Button>
              </div>

              {error && (
                <p
                  id='search-error'
                  className='text-sm font-medium text-red-500 transition-all'
                >
                  {error}
                </p>
              )}
            </div>

            <div className='text-sm text-gray-500'>
              <p>
                Search for any website or service to analyze their legal
                documents.
              </p>
              <p className='mt-1'>
                Examples: Facebook, Twitter, Netflix, Spotify, or any URL
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
