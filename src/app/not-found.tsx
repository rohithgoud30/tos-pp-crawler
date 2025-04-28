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
      <Button
        asChild
        variant='outline'
        className='mt-8 bg-black hover:bg-gray-800 text-white border-2 border-white 
          dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 dark:border-2 dark:border-slate-500 
          flex items-center gap-2 py-6 px-8 text-lg font-bold shadow-md'
      >
        <Link href='/'>
          <Home className='h-5 w-5 mr-2' />
          Back to Home
        </Link>
      </Button>
    </div>
  )
}
