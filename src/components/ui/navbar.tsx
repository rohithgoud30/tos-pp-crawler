// import Link from 'next/link'
// import { FileText } from 'lucide-react'
// import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Button } from '@/components/ui/button'
import { FileText, Menu } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  NavigationMenu,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'

import * as React from 'react'

interface MenuItem {
  title: string
  url: string
  description?: string
  icon?: React.ReactElement
  items?: MenuItem[]
}

interface Navbar1Props {
  logo?: {
    url: string
    src: string
    alt: string
    title: string
  }
  menu?: MenuItem[]
  mobileExtraLinks?: {
    name: string
    url: string
  }[]
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

const Navbar1 = ({
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
    { title: 'Contact', url: '/contact' },
  ],
  mobileExtraLinks = [
    { name: 'Terms', url: '/terms' },
    { name: 'Privacy', url: '/privacy' },
  ],
  auth = {
    login: { text: 'Login', url: '/login' },
    signup: { text: 'Sign up', url: '/signup' },
  },
}: Navbar1Props) => {
  return (
    <section className='py-4 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-black'>
      <div className='container'>
        <nav className='hidden justify-between lg:flex'>
          <div className='flex items-center gap-6'>
            <a href={logo.url} className='flex items-center gap-2'>
              <FileText className='h-6 w-6 text-black dark:text-white' />
              <span className='text-4xl font-bold text-black dark:text-white'>
                {logo.title}
              </span>
            </a>
            <div className='flex items-center'>
              <NavigationMenu>
                <NavigationMenuList>
                  {menu.map((item) => (
                    <a
                      key={item.title}
                      className='group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-accent-foreground'
                      href={item.url}
                    >
                      {item.title}
                    </a>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          <div className='flex gap-2 items-center'>
            <ThemeToggle />
            <Button
              asChild
              variant='outline'
              size='sm'
              className='bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-200'
            >
              <a href={auth.login.url}>{auth.login.text}</a>
            </Button>
            <Button asChild size='sm'>
              <a href={auth.signup.url}>{auth.signup.text}</a>
            </Button>
          </div>
        </nav>
        <div className='block lg:hidden'>
          <div className='flex items-center justify-between'>
            <a href={logo.url} className='flex items-center gap-2'>
              <FileText className='h-6 w-6 text-black dark:text-white' />
              <span className='text-2xl font-bold text-black dark:text-white'>
                {logo.title}
              </span>
            </a>
            <div className='flex items-center gap-2'>
              <ThemeToggle />
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant='outline' size='icon'>
                    <Menu className='size-4' />
                  </Button>
                </SheetTrigger>
                <SheetContent className='overflow-y-auto'>
                  <SheetHeader>
                    <SheetTitle>
                      <a href={logo.url} className='flex items-center gap-2'>
                        <FileText className='h-6 w-6 text-black dark:text-white' />
                        <span className='text-xl font-bold text-black dark:text-white'>
                          {logo.title}
                        </span>
                      </a>
                    </SheetTitle>
                  </SheetHeader>
                  <div className='my-6 flex flex-col gap-6'>
                    <div className='flex flex-col gap-4'>
                      {menu.map((item) => (
                        <a
                          key={item.title}
                          href={item.url}
                          className='font-semibold'
                        >
                          {item.title}
                        </a>
                      ))}
                    </div>
                    <div className='border-t py-4'>
                      <div className='grid grid-cols-2 justify-start'>
                        {mobileExtraLinks.map((link, idx) => (
                          <a
                            key={idx}
                            className='inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-accent-foreground'
                            href={link.url}
                          >
                            {link.name}
                          </a>
                        ))}
                      </div>
                    </div>
                    <div className='flex flex-col gap-3'>
                      <Button
                        asChild
                        variant='outline'
                        className='bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-200'
                      >
                        <a href={auth.login.url}>{auth.login.text}</a>
                      </Button>
                      <Button asChild>
                        <a href={auth.signup.url}>{auth.signup.text}</a>
                      </Button>
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

export { Navbar1 }
