'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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
  const [documentType, setDocumentType] = useState('both')
  const [placeholder, setPlaceholder] = useState(
    'Try searching for a service name'
  )

  // Set random example placeholder after initial render to avoid hydration mismatch
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * searchExamples.length)
    setPlaceholder(
      `Try searching for "${searchExamples[randomIndex]}" or any service name`
    )
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to results page with the search query and document type
      // Also include perPage parameter for consistency
      window.location.href = `/results?q=${encodeURIComponent(
        searchQuery
      )}&type=${documentType}&perPage=6&sort=recent`
    }
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

          <div className='flex justify-center pt-2'>
            <div className='inline-flex h-10 items-center rounded-md border border-gray-200 dark:border-gray-700 p-1 text-sm font-medium'>
              <button
                type='button'
                className={`inline-flex items-center justify-center rounded-sm px-3 py-1.5 ${
                  documentType === 'tos'
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
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
                    : 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
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
                    : 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={() => setDocumentType('both')}
              >
                Both
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className='w-full space-y-6 relative'>
            <div className='relative flex items-center'>
              <Input
                type='text'
                placeholder={placeholder}
                className='pr-12 h-14 text-base border-gray-200 dark:border-gray-700 focus:border-gray-400 dark:focus:border-gray-500 focus:ring-gray-400 dark:focus:ring-gray-500'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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

            <div className='text-sm text-gray-500'>
              <p>
                Search for any website or service to analyze their legal
                documents.
              </p>
              <p className='mt-1'>
                Examples: Facebook, Twitter, Netflix, Spotify, or any URL
              </p>
            </div>

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
