'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { DocumentStatsDisplay } from '@/components/document-stats-display'
import { useUser } from '@clerk/nextjs'

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

// Hero message constants
const DEFAULT_HERO_MESSAGE = "🧠 Understand What You're Agreeing To"
const ADMIN_HERO_MESSAGE = '👋 Welcome Back, Admin!'

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const [tosSelected, setTosSelected] = useState(true)
  const [ppSelected, setPpSelected] = useState(true)
  const [placeholder, setPlaceholder] = useState(
    'Try searching for a service name'
  )
  const [error, setError] = useState('')
  const { user, isSignedIn } = useUser()
  const isAdmin = isSignedIn && user?.publicMetadata?.role === 'admin'

  // Determine which hero message to show based on admin status
  const heroMessage =
    isSignedIn && user?.publicMetadata?.role === 'admin'
      ? ADMIN_HERO_MESSAGE
      : DEFAULT_HERO_MESSAGE

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

    // Check if at least one document type is selected
    if (!tosSelected && !ppSelected) {
      setError('Please select at least one document type (ToS or PP)')
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
      // Both selected - remove type param for "All"
      url.searchParams.delete('type')
    }

    // Add default parameters - ensure "Most Relevant" sort order
    url.searchParams.set('perPage', '6')
    url.searchParams.set('sort', 'relevance')
    url.searchParams.set('order', 'desc')

    // Navigate to the URL
    window.location.href = url.toString()
  }

  return (
    <section
      className={`w-full ${
        isAdmin ? 'py-12 md:py-16 lg:py-20' : 'py-20 md:py-28 lg:py-36'
      } flex items-center justify-center`}
    >
      <div className='container px-4 md:px-6 max-w-2xl'>
        <div className='flex flex-col items-center space-y-4 text-center'>
          <div className='space-y-4'>
            <h1 className='text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl'>
              {heroMessage}
            </h1>

            {/* Only show explanatory text for non-admin users */}
            {!isAdmin && (
              <p className='mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed'>
                {`CRWLR analyze's Terms of Service and Privacy Policies so you don't have to read the fine print.`}
              </p>
            )}

            {/* Always show document statistics */}
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
                  placeholder={
                    isAdmin ? 'Search for any service to analyze' : placeholder
                  }
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

            {/* Only show examples for non-admin users */}
            {!isAdmin ? (
              <div className='text-sm text-gray-500'>
                <p>
                  Search for any website or service to view analyzed version of
                  their legal documents.
                </p>
                <p className='mt-1'>
                  Examples: Facebook, Twitter, Netflix, Spotify, or any URL
                </p>
              </div>
            ) : (
              <div className='text-sm text-gray-500'>
                <p>Search for services to review or analyze documents.</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}
