'use client'

import { BarChart3, ExternalLink, Tag } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { WordFrequencyChart } from '@/components/word-frequency-chart'
import { TextMetricsGrid } from '@/components/text-metrics-grid'
import { Breadcrumb } from '@/components/breadcrumb'
import { useSearchParams, useParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import {
  getDocumentById,
  type DocumentDetail,
  type WordFrequency,
  type TextMiningMetrics,
} from '@/lib/api'

// This Map stores document IDs that have already been fetched in the current session
// It persists between component remounts in StrictMode but is cleared on actual page navigation
const viewedDocuments = new Map<string, boolean>()

export default function AnalysisPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [analysisItem, setAnalysisItem] = useState<DocumentDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const tosRef = useRef<HTMLDivElement>(null)
  const ppRef = useRef<HTMLDivElement>(null)
  const fetchControllerRef = useRef<AbortController | null>(null)

  // Get document type from URL parameters and load data
  useEffect(() => {
    const documentId = params.id as string
    if (!documentId) return

    // Create a new AbortController instance for this request
    fetchControllerRef.current = new AbortController()
    const signal = fetchControllerRef.current.signal

    const fetchDocument = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Check if we've already fetched this document in the current session
        // This prevents double-counting views in React StrictMode during development
        const shouldFetchFresh = !viewedDocuments.has(documentId)

        // Get document details from API
        const documentData = await getDocumentById(documentId, {
          // Always skip view increment in development when using React.StrictMode
          skipViewIncrement:
            process.env.NODE_ENV === 'development' || !shouldFetchFresh,
          // Pass the abort signal to cancel the request if needed
          signal: signal,
        })

        // Only set state if the request wasn't aborted
        if (!signal.aborted) {
          setAnalysisItem(documentData)

          // Mark this document as viewed for this session
          if (shouldFetchFresh) {
            viewedDocuments.set(documentId, true)
            console.log(
              `Document ${documentId} marked as viewed for this session`
            )
          } else {
            console.log(
              `Document ${documentId} already viewed in this session, not incrementing view count`
            )
          }
        }
      } catch (err) {
        // Only set error state if the request wasn't aborted and it's not an abort error
        if (
          !signal.aborted &&
          !(err instanceof DOMException && err.name === 'AbortError')
        ) {
          console.error('Error fetching document:', err)
          setError('Failed to load document analysis. Please try again.')
        }
      } finally {
        // Only update loading state if the request wasn't aborted
        if (!signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    fetchDocument()

    // Cleanup function to abort any in-flight requests when component unmounts
    // This prevents state updates after the component unmounts
    return () => {
      if (fetchControllerRef.current) {
        fetchControllerRef.current.abort()
        fetchControllerRef.current = null
      }
    }
  }, [params.id, searchParams])

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

        {/* Word Frequency Analysis */}
        <div className='mb-5'>
          <div className='bg-slate-800 text-white py-2 px-4 rounded-t-md'>
            <h2 className='text-lg font-semibold'>Word Frequency Analysis</h2>
          </div>
          <div className='bg-slate-50 dark:bg-slate-900 border border-t-0 border-slate-300 dark:border-slate-700 p-3 rounded-b-md'>
            {analysisItem.word_frequencies &&
            analysisItem.word_frequencies.length > 0 ? (
              <WordFrequencyChart
                wordFrequencies={analysisItem.word_frequencies}
              />
            ) : analysisItem.sections &&
              analysisItem.sections.find((s) => s.type === 'word_frequency') ? (
              // Fallback for backward compatibility
              <WordFrequencyChart
                wordFrequencies={
                  (analysisItem.sections.find(
                    (s) => s.type === 'word_frequency'
                  )?.data || []) as WordFrequency[]
                }
              />
            ) : (
              <p className='text-gray-500 dark:text-gray-400'>
                No word frequency data available
              </p>
            )}
          </div>
        </div>

        {/* Text Mining Measurements */}
        <div className='mb-5'>
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
              <div className='flex-shrink-0 h-12 w-12 mr-2 bg-gray-50 dark:bg-gray-900 rounded-md flex items-center justify-center overflow-hidden'>
                <img
                  src={analysisItem.logo_url}
                  alt={`${analysisItem.company_name} logo`}
                  className='h-full w-full object-contain'
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
        </div>

        {/* Content area with max-width to match search results cards */}
        <div className='max-w-4xl mx-auto'>
          {analysisItem.document_type === 'tos' && renderAnalysisContent('tos')}
          {analysisItem.document_type === 'pp' &&
            renderAnalysisContent('privacy')}
        </div>

        {/* View Original Source Button */}
        <div className='flex justify-center mt-4 mb-4'>
          {analysisItem.retrieved_url && (
            <a
              href={analysisItem.retrieved_url}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center bg-slate-800 hover:bg-slate-700 text-white rounded px-4 py-2 text-sm'
            >
              View Original Source
              <ExternalLink className='h-3 w-3 ml-2' />
            </a>
          )}
        </div>
      </main>
    </div>
  )
}
