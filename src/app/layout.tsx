import type React from 'react'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Navbar } from '@/components/ui/navbar'
import ThemeProvider from '@/components/theme-provider'
import { ClerkProvider } from '@clerk/nextjs'
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CRWLR - Terms of Service & Privacy Policy Analyzer',
  description:
    "Analyze Terms of Service and Privacy Policies to understand what you're agreeing to",
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
    apple: '/icon.png',
  },
}

// Only wrap with ClerkProvider if we have a valid key
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
const hasValidKey =
  publishableKey &&
  publishableKey.startsWith('pk_') &&
  !publishableKey.includes('dummy')

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const content = (
    <html lang='en' suppressHydrationWarning>
      <head>
        <link rel='icon' href='/favicon.ico' sizes='any' />
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (function() {
              try {
                const savedTheme = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                
                if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {
                console.error('Error checking theme:', e);
              }
            })();
          `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-white dark:bg-black`}>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <div className='min-h-screen flex flex-col'>
            <Navbar />
            <main className='flex-1 bg-white dark:bg-black text-black dark:text-white mx-auto'>
              {children}
            </main>
            <footer className='w-full border-t border-gray-100 dark:border-white/10 py-6 bg-white dark:bg-black'>
              <div className='w-full max-w-screen-xl mx-auto px-4 md:px-6'>
                <div className='flex flex-col items-center justify-center text-center'>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                    © {new Date().getFullYear()} CRWLR. All rights reserved.
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )

  if (!hasValidKey) return content

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      afterSignOutUrl='/'
      appearance={{
        elements: {
          rootBox: {
            borderRadius: '50%',
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
          },
          card: {
            backgroundColor: '#ffffff !important',
          },
          formButtonPrimary: {
            color: '#ffffff !important',
          },
        },
      }}
    >
      {content}
    </ClerkProvider>
  )
}
