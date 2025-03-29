import Link from 'next/link'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export function Navbar() {
  return (
    <header className='w-full border-b border-gray-200 dark:border-white/10 bg-white dark:bg-black py-4'>
      <div className='container mx-auto flex items-center justify-between px-4'>
        <Link href='/' className='flex items-center gap-2'>
          <FileText className='h-6 w-6 text-black dark:text-white' />
          <span className='font-bold text-2xl text-black dark:text-white'>
            CRWLR
          </span>
        </Link>

        <nav className='flex items-center gap-4'>
          <Link
            href='/'
            className='text-sm font-medium text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white'
          >
            Home
          </Link>
          <Link
            href='/about'
            className='text-sm font-medium text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white'
          >
            About
          </Link>
          <Link
            href='/faq'
            className='text-sm font-medium text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white'
          >
            FAQ
          </Link>
          <Link
            href='/contact'
            className='text-sm font-medium text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white'
          >
            Contact
          </Link>
          <ThemeToggle />
          <Button
            variant='outline'
            size='sm'
            className='border-gray-200 bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-200'
            asChild
          >
            <Link href='/login'>Login</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
