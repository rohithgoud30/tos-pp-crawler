'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

// eslint-disable-next-line no-unused-vars
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // Ensure theme is properly applied when this page loads
  useEffect(() => {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Log the error for debugging
    console.error('Application error:', error)
  }, [error])

  return (
    <div className='flex flex-col items-center justify-center min-h-[70vh] text-center px-4'>
      <h1 className='text-5xl font-bold text-black dark:text-white'>
        Something went wrong
      </h1>
      <p className='text-lg mt-4 max-w-md text-gray-600 dark:text-gray-300'>
        An unexpected error occurred. Please try again later.
      </p>
      <Button onClick={() => reset()} className='mt-8'>
        Try again
      </Button>
    </div>
  )
}
