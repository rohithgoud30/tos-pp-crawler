'use client'

import { BarChart3, ExternalLink, Tag, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { WordFrequencyChart } from '@/components/word-frequency-chart'
import { TextMetricsGrid } from '@/components/text-metrics-grid'
import { Breadcrumb } from '@/components/breadcrumb'
import { useParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { type WordFrequency, type TextMiningMetrics } from '@/lib/api'
import { useDocumentDetail } from '@/hooks/use-cached-data'
import { useUser } from '@clerk/nextjs'

// This Map stores document IDs that have already been fetched in the current session
// It persists between component remounts in StrictMode but is cleared on actual page navigation
const viewedDocuments = new Map<string, boolean>()

export default function AnalysisPage() {
  const params = useParams()
  const [error, setError] = useState<string | null>(null)
  const tosRef = useRef<HTMLDivElement>(null)
  const ppRef = useRef<HTMLDivElement>(null)
  const { user, isSignedIn } = useUser()
  const isAdmin = isSignedIn && user?.publicMetadata?.role === 'admin'

  // Add refs for sections to lazy load
  const wordFrequencyRef = useRef<HTMLDivElement>(null)
  const textMiningRef = useRef<HTMLDivElement>(null)

  const documentId = params.id as string

  // Check if we've already fetched this document in the current session
  const shouldSkipViewIncrement = viewedDocuments.has(documentId)

  // Use our SWR hook for data fetching with caching
  const {
    document: analysisItem,
    isLoading,
    error: fetchError,
  } = useDocumentDetail(documentId, {
    // Always skip view increment in development when using React.StrictMode
    // or if we've already viewed this document
    skipViewIncrement:
      process.env.NODE_ENV === 'development' || shouldSkipViewIncrement,
  })

  // Mark this document as viewed for this session to avoid double-counting views
  useEffect(() => {
    if (analysisItem && !viewedDocuments.has(documentId)) {
      viewedDocuments.set(documentId, true)
      console.log(`Document ${documentId} marked as viewed for this session`)
    }
  }, [analysisItem, documentId])

  // Set error state if fetch failed
  useEffect(() => {
    if (fetchError) {
      setError('Failed to load document analysis. Please try again.')
    } else {
      setError(null)
    }
  }, [fetchError])

  // Implement lazy loading of heavy components with intersection observer
  useEffect(() => {
    if (!analysisItem) return

    // Create intersection observer to lazy load word frequency and text mining sections
    const observerOptions = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Add a data-loaded attribute to indicate content is now visible
          entry.target.setAttribute('data-loaded', 'true')
          // Stop observing once loaded
          observer.unobserve(entry.target)
        }
      })
    }, observerOptions)

    // Observe the heavy components
    if (wordFrequencyRef.current) observer.observe(wordFrequencyRef.current)
    if (textMiningRef.current) observer.observe(textMiningRef.current)

    return () => observer.disconnect()
  }, [analysisItem])

  // Handle tag click to navigate to the appropriate section
  const handleTagClick = (docType: string) => {
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
        <div
          className='mb-5'
          id={docType === 'tos' ? 'tos-summary' : 'pp-summary'}
        >
          <div className='bg-slate-800 text-white py-2 px-4 rounded-t-md'>
            <h2 className='text-lg font-semibold'>One-Sentence Summary</h2>
          </div>
          <div className='bg-slate-50 dark:bg-slate-900 border border-t-0 border-slate-300 dark:border-slate-700 p-3 rounded-b-md'>
            <p className='text-gray-900 dark:text-gray-100'>
              {analysisItem.one_sentence_summary || 'No summary available'}
            </p>
          </div>
        </div>

        {/* 100-Word Summary */}
        <div className='mb-5'>
          <div className='bg-slate-800 text-white py-2 px-4 rounded-t-md'>
            <h2 className='text-lg font-semibold'>100-Word Summary</h2>
          </div>
          <div className='bg-slate-50 dark:bg-slate-900 border border-t-0 border-slate-300 dark:border-slate-700 p-3 rounded-b-md'>
            <p className='text-gray-800 dark:text-gray-200'>
              {analysisItem.hundred_word_summary ||
                'No detailed summary available'}
            </p>
          </div>
        </div>

        {/* Word Frequency Analysis - Lazy loaded */}
        <div className='mb-5' ref={wordFrequencyRef}>
          <div className='bg-slate-800 text-white py-2 px-4 rounded-t-md'>
            <h2 className='text-lg font-semibold'>Word Frequency Analysis</h2>
          </div>
          <div className='bg-slate-50 dark:bg-slate-900 border border-t-0 border-slate-300 dark:border-slate-700 p-3 rounded-b-md'>
            {analysisItem.word_frequencies &&
            analysisItem.word_frequencies.length > 0 ? (
              <WordFrequencyChart
                wordFrequencies={analysisItem.word_frequencies.slice(0, 20)}
              />
            ) : analysisItem.sections &&
              analysisItem.sections.find((s) => s.type === 'word_frequency') ? (
              // Fallback for backward compatibility
              <WordFrequencyChart
                wordFrequencies={(
                  (analysisItem.sections.find(
                    (s) => s.type === 'word_frequency'
                  )?.data as unknown as WordFrequency[]) || []
                ).slice(0, 20)}
              />
            ) : (
              <p className='text-gray-500 dark:text-gray-400'>
                No word frequency data available
              </p>
            )}
          </div>
        </div>

        {/* Text Mining Measurements - Lazy loaded */}
        <div className='mb-5' ref={textMiningRef}>
          <div className='bg-slate-800 text-white py-2 px-4 rounded-t-md flex items-center gap-2'>
            <BarChart3 className='h-4 w-4' />
            <h2 className='text-lg font-semibold'>Text Mining Measurements</h2>
          </div>
          <div className='bg-slate-50 dark:bg-slate-900 border border-t-0 border-slate-300 dark:border-slate-700 px-2 py-3 rounded-b-md'>
            {analysisItem.text_mining_metrics ? (
              <TextMetricsGrid metrics={analysisItem.text_mining_metrics} />
            ) : analysisItem.sections &&
              analysisItem.sections.find((s) => s.type === 'text_mining') ? (
              // Fallback for backward compatibility
              <TextMetricsGrid
                metrics={
                  (analysisItem.sections.find((s) => s.type === 'text_mining')
                    ?.data || {}) as unknown as TextMiningMetrics
                }
              />
            ) : (
              <p className='text-gray-500'>No text metrics available</p>
            )}
          </div>
        </div>
      </>
    )
  }

  if (isLoading) {
    return (
      <div className='min-h-screen bg-white dark:bg-black'>
        <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {/* Use the Breadcrumb component */}
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Search Results', href: '/results' },
              { label: 'Loading...', isCurrentPage: true },
            ]}
          />

          {/* Loading message - left aligned */}
          <div className='mt-8'>
            <h2 className='text-xl font-bold text-gray-800 dark:text-gray-200 mb-2'>
              Loading analysis...
            </h2>
            <p className='text-gray-600 dark:text-gray-400'>
              Please wait while we retrieve the document analysis.
            </p>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className='min-h-screen bg-white dark:bg-black'>
        <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {/* Use the Breadcrumb component */}
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Search Results', href: '/results' },
              { label: 'Error', isCurrentPage: true },
            ]}
          />

          {/* Error message - left aligned */}
          <div className='bg-red-50 dark:bg-red-900/20 p-4 rounded-md max-w-md mt-8'>
            <h2 className='text-xl font-bold text-red-800 dark:text-red-300 mb-2'>
              Error
            </h2>
            <p className='text-red-800 dark:text-red-300 mb-4'>{error}</p>
            <Button asChild>
              <Link href='/results'>Return to Search</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  if (!analysisItem) {
    return (
      <div className='min-h-screen bg-white dark:bg-black'>
        <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {/* Use the Breadcrumb component */}
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Search Results', href: '/results' },
              { label: 'Not Found', isCurrentPage: true },
            ]}
          />

          {/* Not found message - left aligned */}
          <div className='bg-gray-50 dark:bg-gray-900/20 p-4 rounded-md max-w-md mt-8'>
            <h2 className='text-xl font-bold text-gray-800 dark:text-gray-300 mb-2'>
              Document not found
            </h2>
            <p className='text-gray-600 dark:text-gray-400 mb-4'>
              The requested document could not be found.
            </p>
            <Button asChild>
              <Link href='/results'>Return to Search</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-white dark:bg-black'>
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
        {/* Use the Breadcrumb component */}
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Search Results' },
            { label: analysisItem.company_name, isCurrentPage: true },
          ]}
        />

        {/* Document Info with Category Tags */}
        <div className='mb-4'>
          <div className='flex flex-wrap items-center gap-3 mb-2'>
            {analysisItem.logo_url && (
              <div className='flex-shrink-0 h-12 w-12 mr-2 p-1 bg-white dark:bg-white rounded-md flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700'>
                <img
                  src={analysisItem.logo_url}
                  alt={`${analysisItem.company_name} logo`}
                  className='max-h-full max-w-full object-contain'
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            )}
            <h1 className='text-2xl font-bold text-black dark:text-white'>
              {analysisItem.company_name}
            </h1>
            <div className='flex gap-2'>
              {analysisItem.document_type === 'tos' && (
                <Badge
                  className='cursor-pointer bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white'
                  onClick={() => handleTagClick('tos')}
                >
                  <Tag className='h-3 w-3 mr-1' />
                  ToS
                </Badge>
              )}
              {analysisItem.document_type === 'pp' && (
                <Badge
                  className='cursor-pointer bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white'
                  onClick={() => handleTagClick('privacy')}
                >
                  <Tag className='h-3 w-3 mr-1' />
                  PP
                </Badge>
              )}
            </div>
          </div>
          <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6'>
            <p className='text-gray-500 text-sm'>{analysisItem.url}</p>
            <p className='text-sm text-gray-400'>
              Last analyzed:{' '}
              {new Date(analysisItem.updated_at).toLocaleDateString()}
            </p>
          </div>

          {/* Admin-specific: Show document URLs */}
          {isAdmin && analysisItem.retrieved_url && (
            <div className='mt-2 text-sm text-gray-600 dark:text-gray-400 border p-2 border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-900'>
              <p>
                {analysisItem.document_type === 'tos' ? 'ToS' : 'PP'} URL:{' '}
                <a
                  href={analysisItem.retrieved_url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-600 dark:text-blue-400 hover:underline'
                >
                  {analysisItem.retrieved_url}
                </a>
              </p>
            </div>
          )}
        </div>

        {/* Content area with max-width to match search results cards */}
        <div className='max-w-4xl mx-auto'>
          {analysisItem.document_type === 'tos' && renderAnalysisContent('tos')}
          {analysisItem.document_type === 'pp' &&
            renderAnalysisContent('privacy')}
        </div>

        {/* View Original Source Button or Reanalyze Button for admins */}
        <div className='flex justify-center mt-4 mb-4'>
          {analysisItem.retrieved_url && isAdmin ? (
            <Button
              className='flex items-center bg-amber-600 hover:bg-amber-700 text-white'
              onClick={() =>
                alert('Reanalyze functionality will be implemented later')
              }
            >
              Reanalyze
              <RefreshCw className='h-3 w-3 ml-2' />
            </Button>
          ) : (
            analysisItem.retrieved_url && (
              <a
                href={analysisItem.retrieved_url}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center bg-slate-800 hover:bg-slate-700 text-white rounded px-4 py-2 text-sm'
              >
                View Original Source
                <ExternalLink className='h-3 w-3 ml-2' />
              </a>
            )
          )}
        </div>
      </main>
    </div>
  )
}
