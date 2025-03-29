import type React from 'react'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Navbar } from '@/components/ui/navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CRWLR - Terms of Service & Privacy Policy Analyzer',
  description:
    "Analyze Terms of Service and Privacy Policies to understand what you're agreeing to",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${inter.className} bg-white dark:bg-black`}>
        <ThemeProvider attribute='class' defaultTheme='light' enableSystem>
          <div className='min-h-screen flex flex-col'>
            <Navbar />
            <main className='flex-1 bg-white dark:bg-black text-black dark:text-white'>
              {children}
            </main>
            <footer className='w-full border-t border-gray-100 dark:border-white/10 py-6 bg-white dark:bg-black'>
              <div className='container px-4 md:px-6'>
                <div className='flex flex-col items-center justify-center gap-4 md:flex-row md:gap-6'>
                  <p className='text-center text-sm text-gray-500 dark:text-gray-400'>
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
}
