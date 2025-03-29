'use client'

import { ChevronRight, BarChart3, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Card } from '@/components/ui/card'
import { WordFrequencyChart } from '@/components/word-frequency-chart'
import { TextMetricsGrid } from '@/components/text-metrics-grid'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface AnalysisClientProps {
  id: string
}

export function AnalysisClient({ id }: AnalysisClientProps) {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('tos')

  // Get document type from URL parameters
  useEffect(() => {
    const docType = searchParams.get('docType')
    if (docType === 'privacy') {
      setActiveTab('privacy')
    } else {
      // Default to 'tos' for any other value including 'both' and null
      setActiveTab('tos')
    }
  }, [searchParams])

  return (
    <div className='min-h-screen flex flex-col bg-white dark:bg-black'>
      <main className='flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Breadcrumb */}
        <nav className='flex items-center text-sm text-gray-500 mb-6'>
          <Link
            href='/'
            className='hover:text-gray-700 dark:hover:text-gray-300'
          >
            Home
          </Link>
          <ChevronRight className='h-4 w-4 mx-2' />
          <Link
            href='/results'
            className='hover:text-gray-700 dark:hover:text-gray-300'
          >
            Search Results
          </Link>
          <ChevronRight className='h-4 w-4 mx-2' />
          <span className='text-gray-900 dark:text-white font-medium'>
            Facebook
          </span>
        </nav>
        <div className='flex flex-col gap-4'>Document ID: {id}</div>

        {/* Document Info */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-black dark:text-white mb-1'>
            Facebook
          </h1>
          <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6'>
            <p className='text-gray-500'>facebook.com</p>
            <p className='text-sm text-gray-400'>
              Last analyzed: March 25, 2025
            </p>
          </div>
        </div>

        {/* Document Type Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className='mb-8'>
          <TabsList className='w-full max-w-md grid grid-cols-2'>
            <TabsTrigger value='tos'>Terms of Service</TabsTrigger>
            <TabsTrigger value='privacy'>Privacy Policy</TabsTrigger>
          </TabsList>

          <TabsContent value='tos' className='pt-6'>
            {/* One-Sentence Summary */}
            <div className='mb-8'>
              <h2 className='text-xl font-semibold mb-3 text-black dark:text-white'>
                One-Sentence Summary
              </h2>
              <div className='bg-gray-100 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700'>
                <p className='text-gray-900 dark:text-gray-100 font-medium'>
                  {`Facebook's Terms of Service grant them broad rights to use
                  your content, collect your data, and modify the service
                  without notice while limiting their liability and your legal
                  options.`}
                </p>
              </div>
            </div>

            {/* 100-Word Summary */}
            <div className='mb-8'>
              <h2 className='text-xl font-semibold mb-3 text-black dark:text-white'>
                100-Word Summary
              </h2>
              <Card className='p-4'>
                <p className='text-gray-700 dark:text-gray-300'>
                  {`Facebook's Terms of Service establish a comprehensive legal
                  framework that heavily favors the platform. Users grant
                  Facebook an extensive license to their content, allowing the
                  company to use, modify, and distribute it across their
                  services. The terms permit Facebook to collect vast amounts of
                  user data for advertising and product improvement. Facebook
                  reserves the right to modify the service or terms at any time
                  with minimal notice. The agreement includes mandatory
                  arbitration clauses that limit users' ability to pursue legal
                  action. Additionally, Facebook caps its liability regardless
                  of potential damages users might experience while using the
                  platform.`}
                </p>
              </Card>
            </div>

            <Separator className='my-8' />

            {/* Word Frequency Analysis */}
            <div className='mb-8'>
              <h2 className='text-xl font-semibold mb-6 text-black dark:text-white'>
                Word Frequency Analysis
              </h2>
              <WordFrequencyChart />
            </div>

            <Separator className='my-8' />

            {/* Text Mining Measurements */}
            <div className='mb-8'>
              <div className='flex items-center gap-2 mb-4'>
                <BarChart3 className='h-5 w-5 text-gray-700 dark:text-gray-300' />
                <h2 className='text-xl font-semibold text-black dark:text-white'>
                  Text Mining Measurements
                </h2>
              </div>
              <TextMetricsGrid />
            </div>

            {/* Navigation Buttons */}
            <div className='flex flex-col sm:flex-row gap-4 mt-12'>
              <Button className='bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200'>
                View Full Document
              </Button>
              <Button
                variant='outline'
                className='border-gray-300 dark:border-gray-700 ml-auto'
              >
                Load More Analysis
              </Button>
            </div>
          </TabsContent>

          <TabsContent value='privacy'>
            <div className='pt-6'>
              {/* One-Sentence Summary */}
              <div className='mb-8'>
                <h2 className='text-xl font-semibold mb-3 text-black dark:text-white'>
                  One-Sentence Summary
                </h2>
                <div className='bg-gray-100 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700'>
                  <p className='text-gray-900 dark:text-gray-100 font-medium'>
                    {`Facebook's Privacy Policy allows extensive data collection
                    across platforms, sharing with third parties, and targeted
                    advertising while providing limited user control over
                    personal information.`}
                  </p>
                </div>
              </div>

              {/* 100-Word Summary */}
              <div className='mb-8'>
                <h2 className='text-xl font-semibold mb-3 text-black dark:text-white'>
                  100-Word Summary
                </h2>
                <Card className='p-4'>
                  <p className='text-gray-700 dark:text-gray-300'>
                    {`Facebook's Privacy Policy outlines extensive data collection
                    practices that extend beyond the platform itself. The
                    company collects information about your activities on
                    third-party websites, apps, and devices. This data is used
                    for targeted advertising, content personalization, and
                    product development. Facebook shares user information with a
                    wide network of partners, advertisers, and affiliated
                    companies. While the policy mentions tools for managing
                    privacy settings, the default settings favor data sharing.
                    The policy includes provisions for facial recognition,
                    location tracking, and cross-device tracking. Data retention
                    periods are vaguely defined, and the policy reserves broad
                    rights to use your information.`}
                  </p>
                </Card>
              </div>

              <Separator className='my-8' />

              {/* Word Frequency Analysis */}
              <div className='mb-8'>
                <h2 className='text-xl font-semibold mb-6 text-black dark:text-white'>
                  Word Frequency Analysis
                </h2>
                <WordFrequencyChart />
              </div>

              <Separator className='my-8' />

              {/* Text Mining Measurements */}
              <div className='mb-8'>
                <div className='flex items-center gap-2 mb-4'>
                  <BarChart3 className='h-5 w-5 text-gray-700 dark:text-gray-300' />
                  <h2 className='text-xl font-semibold text-black dark:text-white'>
                    Text Mining Measurements
                  </h2>
                </div>
                <TextMetricsGrid />
              </div>

              {/* Navigation Buttons */}
              <div className='flex flex-col sm:flex-row gap-4 mt-12'>
                <Button className='bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200'>
                  View Full Document
                </Button>
                <Button
                  variant='outline'
                  className='border-gray-300 dark:border-gray-700 ml-auto'
                >
                  Load More Analysis
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
