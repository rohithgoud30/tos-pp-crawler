'use client'

import { Button } from '@/components/ui/button'
import { FileText, Menu, User, LogOut } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import Link from 'next/link'
import { useUser, SignOutButton, useClerk } from '@clerk/nextjs'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

import * as React from 'react'
import { useState } from 'react'

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
    { title: 'Submissions', url: '/submissions' },
  ],
  auth = {
    login: { text: 'Login', url: '/auth/login' },
    signup: { text: 'Sign up', url: '/auth/signup' },
  },
}: NavbarProps) => {
  const { user, isSignedIn } = useUser()
  const isAdmin = isSignedIn && user?.publicMetadata?.role === 'admin'
  const { openUserProfile } = useClerk()
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  // Filter menu items based on user role
  const filteredMenu = isAdmin
    ? [{ title: 'Home', url: '/' }] // Admin only sees Home
    : menu // Regular users see all menu items

  // Add admin text to logo title if admin
  const logoTitle = isAdmin ? `${logo.title} Admin` : logo.title

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
                {logoTitle}
              </span>
            </Link>
          </div>

          {/* Center: Menu */}
          <div className='flex-1 flex items-center justify-center'>
            <div className='flex space-x-6'>
              {filteredMenu.map((item) => (
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
                <Button
                  variant='outline'
                  size='sm'
                  className='bg-black text-white hover:bg-gray-900 hover:text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:hover:text-black border border-gray-200 flex items-center gap-2'
                  onClick={() => openUserProfile()}
                >
                  <User className='h-4 w-4' />
                  Profile
                </Button>
                <SignOutButton>
                  <Button
                    size='sm'
                    className='bg-white text-black border border-black hover:bg-gray-100 hover:text-black dark:bg-black dark:text-white dark:border-white dark:hover:bg-gray-800 dark:hover:text-white shadow-sm flex items-center gap-2'
                  >
                    <LogOut className='h-4 w-4' style={{ color: 'inherit' }} />
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
                    className='bg-black text-white hover:bg-gray-800 hover:text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:hover:text-black border border-gray-200'
                  >
                    {auth.login.text}
                  </Button>
                </Link>

                <Link href={auth.signup.url}>
                  <Button
                    size='sm'
                    className='bg-white text-black border border-black hover:bg-gray-100 hover:text-black dark:bg-black dark:text-white dark:border-white dark:hover:bg-gray-800 dark:hover:text-white shadow-sm'
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
                {logoTitle}
              </span>
            </Link>
            <div className='flex items-center gap-2'>
              <ThemeToggle />

              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
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
                      <Link
                        href={logo.url}
                        className='flex items-center gap-2'
                        onClick={() => setIsSheetOpen(false)}
                      >
                        <FileText className='h-6 w-6 text-black dark:text-white' />
                        <span className='text-xl font-bold text-black dark:text-white'>
                          {logoTitle}
                        </span>
                      </Link>
                    </SheetTitle>
                  </SheetHeader>
                  <div className='my-6 flex flex-col gap-6'>
                    <div className='flex flex-col gap-4'>
                      {filteredMenu.map((item) => (
                        <Link
                          key={item.title}
                          href={item.url}
                          className='font-semibold text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md px-4 py-2'
                          onClick={() => setIsSheetOpen(false)}
                        >
                          {item.title}
                        </Link>
                      ))}
                    </div>

                    {/* Auth buttons or Profile options in mobile menu */}
                    <div className='flex flex-col gap-3'>
                      {isSignedIn ? (
                        <>
                          <Button
                            variant='outline'
                            className='bg-black text-white border border-black hover:bg-gray-900 hover:text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:hover:text-black shadow-sm flex items-center gap-2 w-full'
                            onClick={() => {
                              setIsSheetOpen(false)
                              openUserProfile()
                            }}
                          >
                            <User className='h-4 w-4' />
                            Profile
                          </Button>

                          <SignOutButton>
                            <Button
                              className='bg-white text-black border border-black hover:bg-gray-100 hover:text-black dark:bg-black dark:text-white dark:border-white dark:hover:bg-gray-800 dark:hover:text-white shadow-sm flex items-center gap-2 w-full'
                              onClick={() => setIsSheetOpen(false)}
                            >
                              <LogOut
                                className='h-4 w-4'
                                style={{ color: 'inherit' }}
                              />
                              Logout
                            </Button>
                          </SignOutButton>
                        </>
                      ) : (
                        <>
                          <Link
                            href={auth.login.url}
                            onClick={() => setIsSheetOpen(false)}
                          >
                            <Button
                              variant='outline'
                              className='bg-black text-white border border-black hover:bg-gray-800 hover:text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:hover:text-black shadow-sm w-full'
                            >
                              {auth.login.text}
                            </Button>
                          </Link>

                          <Link
                            href={auth.signup.url}
                            onClick={() => setIsSheetOpen(false)}
                          >
                            <Button className='bg-white text-black border border-black hover:bg-gray-100 hover:text-black dark:bg-black dark:text-white dark:border-white dark:hover:bg-gray-800 dark:hover:text-white shadow-sm w-full'>
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
