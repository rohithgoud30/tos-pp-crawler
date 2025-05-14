'use client'

import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  // Load theme on client-side
  useEffect(() => {
    setMounted(true)
    // Check for dark mode preference
    const isDark = document.documentElement.classList.contains('dark')
    setTheme(isDark ? 'dark' : 'light')
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)

    // Update the DOM
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  // Avoid hydration mismatch
  if (!mounted) {
    return (
      <Button variant='ghost' size='sm' className='w-9 px-0'>
        <span className='sr-only'>Toggle theme</span>
      </Button>
    )
  }

  return (
    <Button
      variant='ghost'
      size='sm'
      className='w-9 px-0 bg-white border border-black hover:bg-gray-100 dark:bg-black dark:border-white dark:hover:bg-gray-900 shadow-sm'
      onClick={toggleTheme}
      aria-label='Toggle theme'
    >
      {theme === 'dark' ? (
        <Sun
          className='h-5 w-5 text-white !text-white'
          style={{ color: 'white' }}
        />
      ) : (
        <Moon className='h-5 w-5 text-black' />
      )}
    </Button>
  )
}
