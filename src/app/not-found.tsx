'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'
import { Home } from 'lucide-react'

export default function NotFound() {
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
  }, [])

  return (
    <div className='flex flex-col items-center justify-center min-h-[70vh] text-center px-4'>
      <h1 className='text-6xl font-bold text-black dark:text-white'>404</h1>
      <h2 className='text-2xl font-medium mt-4 text-black dark:text-white'>
        Page Not Found
      </h2>
      <p className='text-lg mt-4 max-w-md text-gray-600 dark:text-gray-300'>
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href='/'>
        <Button className='mt-8 bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 flex items-center gap-2'>
          <Home className='h-4 w-4' />
          <span>Back to Home</span>
        </Button>
      </Link>
    </div>
  )
}
