'use client'

import { ChevronRight, BarChart3, ExternalLink, Tag } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WordFrequencyChart } from '@/components/word-frequency-chart'
import { TextMetricsGrid } from '@/components/text-metrics-grid'
import { useSearchParams, useParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { getDocumentById, type DocumentDetail } from '@/lib/api'

export default function AnalysisPage() {
  const params = useParams()
  const id = params.id as string
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('tos')
  const [analysisItem, setAnalysisItem] = useState<DocumentDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const tosRef = useRef<HTMLDivElement>(null)
  const ppRef = useRef<HTMLDivElement>(null)

  // Get document type from URL parameters and load data
  useEffect(() => {
    const fetchDocument = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Get document details from API
        const documentData = await getDocumentById(id)
        setAnalysisItem(documentData)

        // Set active tab based on URL parameter or available data
        const docType = searchParams.get('docType')
        if (docType === 'privacy' && documentData.document_type === 'pp') {
          setActiveTab('privacy')
        } else if (documentData.document_type === 'tos') {
          setActiveTab('tos')
        } else if (documentData.document_type === 'pp') {
          setActiveTab('privacy')
        }
      } catch (err) {
        console.error('Error fetching document:', err)
        setError('Failed to load document analysis. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchDocument()
    }
  }, [id, searchParams])

  // Handle tag click to navigate to the appropriate section
  const handleTagClick = (docType: string) => {
    setActiveTab(docType)
    if (docType === 'tos') {
      tosRef.current?.scrollIntoView({ behavior: 'smooth' })
    } else if (docType === 'privacy') {
      ppRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Render analysis content based on document type
  const renderAnalysisContent = (docType: 'tos' | 'privacy') => {
    if (!analysisItem) return null

    const isTos = docType === 'tos' && analysisItem.document_type === 'tos'
    const isPp = docType === 'privacy' && analysisItem.document_type === 'pp'

    if (!isTos && !isPp) return null

    return (
      <>
        {/* One-Sentence Summary */}
        <div className='mb-8'>
          <h2 className='text-xl font-semibold mb-3 text-black dark:text-white'>
            One-Sentence Summary
          </h2>
          <div className='bg-gray-100 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700'>
            <p className='text-gray-900 dark:text-gray-100 font-medium'>
              {analysisItem.one_sentence_summary || 'No summary available'}
            </p>
          </div>
        </div>

        <Separator className='my-8' />

        {/* 100-Word Summary */}
        <div className='mb-8'>
          <h2 className='text-xl font-semibold mb-3 text-black dark:text-white'>
            100-Word Summary
          </h2>
          <Card className='p-4'>
            <p className='text-gray-700 dark:text-gray-300'>
              {analysisItem.hundred_word_summary ||
                'No detailed summary available'}
            </p>
          </Card>
        </div>

        <Separator className='my-8' />

        {/* Word Frequency Analysis - Now first */}
        <div className='mb-8'>
          <h2 className='text-xl font-semibold mb-6 text-black dark:text-white'>
            Word Frequency Analysis
          </h2>
          {analysisItem.sections && analysisItem.sections.length > 0 ? (
            <WordFrequencyChart
              wordFrequencies={
                analysisItem.sections.find((s) => s.type === 'word_frequency')
                  ?.data || []
              }
            />
          ) : (
            <p className='text-gray-500'>No word frequency data available</p>
          )}
        </div>

        <Separator className='my-8' />

        {/* Text Mining Measurements - Now second */}
        <div className='mb-8'>
          <div className='flex items-center gap-2 mb-4'>
            <BarChart3 className='h-5 w-5 text-gray-700 dark:text-gray-300' />
            <h2 className='text-xl font-semibold text-black dark:text-white'>
              Text Mining Measurements
            </h2>
          </div>
          {analysisItem.sections && analysisItem.sections.length > 0 ? (
            <TextMetricsGrid
              metrics={
                analysisItem.sections.find((s) => s.type === 'text_mining')
                  ?.data || {}
              }
            />
          ) : (
            <p className='text-gray-500'>No text metrics available</p>
          )}
        </div>

        {/* Navigation Buttons - View Original Source */}
        <div className='flex flex-col sm:flex-row justify-center gap-4 mt-12'>
          {analysisItem.retrieved_url && (
            <Button
              className='bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 gap-2'
              asChild
            >
              <a
                href={analysisItem.retrieved_url}
                target='_blank'
                rel='noopener noreferrer'
              >
                View Original Source
                <ExternalLink className='h-4 w-4' />
              </a>
            </Button>
          )}
        </div>
      </>
    )
  }

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-white dark:bg-black'>
        <p className='text-gray-500 dark:text-gray-400'>Loading analysis...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-white dark:bg-black'>
        <div className='bg-red-50 dark:bg-red-900/20 p-4 rounded-md max-w-md'>
          <p className='text-red-800 dark:text-red-300'>{error}</p>
          <Button className='mt-4' asChild>
            <Link href='/'>Return Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!analysisItem) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-white dark:bg-black'>
        <p className='text-gray-500 dark:text-gray-400'>Document not found</p>
      </div>
    )
  }

  const hasTos = analysisItem.document_type === 'tos'
  const hasPp = analysisItem.document_type === 'pp'

  return (
    <div className='min-h-screen flex flex-col bg-white dark:bg-black'>
      <main className='flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Breadcrumb */}
        <nav className='flex items-center text-sm mb-6'>
          <Link
            href='/'
            className='text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          >
            Home
          </Link>
          <ChevronRight className='h-4 w-4 mx-2 text-gray-500 dark:text-gray-400' />
          <Link
            href='/results'
            className='text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          >
            Search Results
          </Link>
          <ChevronRight className='h-4 w-4 mx-2 text-gray-500 dark:text-gray-400' />
          <span className='text-gray-900 dark:text-white font-medium'>
            {analysisItem.company_name}
          </span>
        </nav>

        {/* Document Info with Category Tags */}
        <div className='mb-8'>
          <div className='flex flex-wrap items-center gap-3 mb-3'>
            <h1 className='text-3xl font-bold text-black dark:text-white'>
              {analysisItem.company_name}
            </h1>
            <div className='flex gap-2'>
              {hasTos && (
                <Badge
                  className='cursor-pointer bg-blue-600 hover:bg-blue-700'
                  onClick={() => handleTagClick('tos')}
                >
                  <Tag className='h-3 w-3 mr-1' />
                  ToS
                </Badge>
              )}
              {hasPp && (
                <Badge
                  className='cursor-pointer bg-green-600 hover:bg-green-700'
                  onClick={() => handleTagClick('privacy')}
                >
                  <Tag className='h-3 w-3 mr-1' />
                  PP
                </Badge>
              )}
            </div>
          </div>
          <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6'>
            <p className='text-gray-500'>{analysisItem.url}</p>
            <p className='text-sm text-gray-400'>
              Last analyzed:{' '}
              {new Date(analysisItem.updated_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Document Type Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className='mb-8'>
          <TabsList className='w-full max-w-md grid grid-cols-2'>
            <TabsTrigger value='tos' disabled={!hasTos}>
              Terms of Service
            </TabsTrigger>
            <TabsTrigger value='privacy' disabled={!hasPp}>
              Privacy Policy
            </TabsTrigger>
          </TabsList>

          {hasTos && (
            <TabsContent value='tos' className='pt-6'>
              <div ref={tosRef}>{renderAnalysisContent('tos')}</div>
            </TabsContent>
          )}

          {hasPp && (
            <TabsContent value='privacy'>
              <div ref={ppRef} className='pt-6'>
                {renderAnalysisContent('privacy')}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  )
}
