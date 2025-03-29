import type React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

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
      <body className={inter.className}>
        <ThemeProvider attribute='class' defaultTheme='light' enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
