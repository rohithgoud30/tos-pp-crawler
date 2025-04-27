'use client'

import { Button } from '@/components/ui/button'
import { FileText, Menu, User, LogOut } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import Link from 'next/link'
import { useUser, SignOutButton } from '@clerk/nextjs'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

import * as React from 'react'

interface MenuItem {
  title: string
  url: string
  description?: string
  icon?: React.ReactElement
  items?: MenuItem[]
}

interface NavbarProps {
  logo?: {
    url: string
    src: string
    alt: string
    title: string
  }
  menu?: MenuItem[]
  auth?: {
    login: {
      text: string
      url: string
    }
    signup: {
      text: string
      url: string
    }
  }
}

const Navbar = ({
  logo = {
    url: '/',
    src: '/favicon.ico',
    alt: 'CRWLR',
    title: 'CRWLR',
  },
  menu = [
    { title: 'Home', url: '/' },
    { title: 'About', url: '/about' },
    { title: 'FAQ', url: '/faq' },
  ],
  auth = {
    login: { text: 'Login', url: '/auth/login' },
    signup: { text: 'Sign up', url: '/auth/signup' },
  },
}: NavbarProps) => {
  const { isSignedIn, user } = useUser()

  return (
    <section className='py-4 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-black'>
      <div className='container mx-auto px-4'>
        {/* Desktop Navbar */}
        <nav className='hidden lg:flex items-center w-full'>
          {/* Left: Logo */}
          <div className='flex-1 flex items-center justify-start'>
            <Link href={logo.url} className='flex items-center gap-2'>
              <FileText className='h-6 w-6 text-black dark:text-white' />
              <span className='text-2xl font-bold text-black dark:text-white'>
                {logo.title}
              </span>
            </Link>
          </div>

          {/* Center: Menu */}
          <div className='flex-1 flex items-center justify-center'>
            <div className='flex space-x-6'>
              {menu.map((item) => (
                <Link
                  key={item.title}
                  className='inline-flex h-10 items-center justify-center px-4 py-2 text-sm font-medium text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md'
                  href={item.url}
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: Auth buttons or Profile options */}
          <div className='flex-1 flex items-center justify-end gap-2'>
            <ThemeToggle />

            {isSignedIn ? (
              <>
                <Link href='/profile'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-200 border border-gray-200 flex items-center gap-2'
                  >
                    <User className='h-4 w-4' />
                    {user?.firstName || 'Profile'}
                  </Button>
                </Link>
                <SignOutButton>
                  <Button
                    size='sm'
                    className='bg-white text-black border border-black hover:bg-gray-100 dark:bg-black dark:text-white dark:border-white dark:hover:bg-gray-900 shadow-sm flex items-center gap-2'
                  >
                    <LogOut className='h-4 w-4' />
                    Logout
                  </Button>
                </SignOutButton>
              </>
            ) : (
              <>
                <Link href={auth.login.url}>
                  <Button
                    variant='outline'
                    size='sm'
                    className='bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-200 border border-gray-200'
                  >
                    {auth.login.text}
                  </Button>
                </Link>

                <Link href={auth.signup.url}>
                  <Button
                    size='sm'
                    className='bg-white text-black border border-black hover:bg-gray-100 dark:bg-black dark:text-white dark:border-white dark:hover:bg-gray-900 shadow-sm'
                  >
                    {auth.signup.text}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Mobile Navbar */}
        <div className='block lg:hidden'>
          <div className='flex items-center justify-between'>
            <Link href={logo.url} className='flex items-center gap-2'>
              <FileText className='h-6 w-6 text-black dark:text-white' />
              <span className='text-2xl font-bold text-black dark:text-white'>
                {logo.title}
              </span>
            </Link>
            <div className='flex items-center gap-2'>
              <ThemeToggle />

              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant='outline'
                    size='icon'
                    className='border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                  >
                    <Menu className='h-5 w-5 text-black dark:text-white' />
                  </Button>
                </SheetTrigger>
                <SheetContent className='overflow-y-auto bg-white dark:bg-black text-black dark:text-white'>
                  <SheetHeader>
                    <SheetTitle className='text-black dark:text-white'>
                      <Link href={logo.url} className='flex items-center gap-2'>
                        <FileText className='h-6 w-6 text-black dark:text-white' />
                        <span className='text-xl font-bold text-black dark:text-white'>
                          {logo.title}
                        </span>
                      </Link>
                    </SheetTitle>
                  </SheetHeader>
                  <div className='my-6 flex flex-col gap-6'>
                    <div className='flex flex-col gap-4'>
                      {menu.map((item) => (
                        <Link
                          key={item.title}
                          href={item.url}
                          className='font-semibold text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md px-4 py-2'
                        >
                          {item.title}
                        </Link>
                      ))}
                    </div>

                    {/* Auth buttons or Profile options in mobile menu */}
                    <div className='flex flex-col gap-3'>
                      {isSignedIn ? (
                        <>
                          <Link href='/profile'>
                            <Button
                              variant='outline'
                              className='bg-black text-white border border-black hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-200 shadow-sm flex items-center gap-2 w-full'
                            >
                              <User className='h-4 w-4' />
                              {user?.firstName || 'Profile'}
                            </Button>
                          </Link>

                          <SignOutButton>
                            <Button className='bg-white text-black border border-black hover:bg-gray-100 dark:bg-black dark:text-white dark:border-white dark:hover:bg-gray-900 shadow-sm flex items-center gap-2 w-full'>
                              <LogOut className='h-4 w-4' />
                              Logout
                            </Button>
                          </SignOutButton>
                        </>
                      ) : (
                        <>
                          <Link href={auth.login.url}>
                            <Button
                              variant='outline'
                              className='bg-black text-white border border-black hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-200 shadow-sm'
                            >
                              {auth.login.text}
                            </Button>
                          </Link>

                          <Link href={auth.signup.url}>
                            <Button className='bg-white text-black border border-black hover:bg-gray-100 dark:bg-black dark:text-white dark:border-white dark:hover:bg-gray-900 shadow-sm'>
                              {auth.signup.text}
                            </Button>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export { Navbar }
