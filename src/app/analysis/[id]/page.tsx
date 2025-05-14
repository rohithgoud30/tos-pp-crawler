'use client'

import {
  BarChart3,
  ExternalLink,
  Tag,
  RefreshCw,
  Edit,
  Check,
  X,
} from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'

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
  const { toast } = useToast()

  // Add state for URL editing and reanalysis
  const [isEditing, setIsEditing] = useState(false)
  const [editedUrl, setEditedUrl] = useState('')
  const [displayedUrl, setDisplayedUrl] = useState('') // New state for displayed URL
  const [isReanalyzing, setIsReanalyzing] = useState(false)

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

  // Set displayed URL when analysis item loads
  useEffect(() => {
    if (analysisItem?.retrieved_url) {
      setDisplayedUrl(analysisItem.retrieved_url)
    }
  }, [analysisItem?.retrieved_url])

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

  // Add function to handle reanalysis
  const handleReanalyze = async () => {
    if (!analysisItem) return

    setIsReanalyzing(true)

    try {
      const endpoint =
        analysisItem.document_type === 'tos'
          ? '/api/v1/reanalyze-tos'
          : '/api/v1/reanalyze-pp'

      // Create the base payload with just the document ID
      const payload: { document_id: string; url?: string } = {
        document_id: documentId,
      }

      // Use the displayed URL if it's different from the original retrieved URL
      if (
        displayedUrl.trim() !== '' &&
        displayedUrl.trim() !== analysisItem.retrieved_url
      ) {
        payload.url = displayedUrl.trim()
      }

      // Get API key from environment
      const API_KEY = process.env.NEXT_PUBLIC_API_KEY || ''

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: 'Reanalysis successful',
          description: 'The document has been reanalyzed successfully.',
          variant: 'default',
        })
        // Refresh the page to show updated analysis
        window.location.reload()
      } else {
        toast({
          title: 'Reanalysis failed',
          description: data.message || 'An error occurred during reanalysis.',
          variant: 'destructive',
        })
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to reanalyze document. Please try again.',
        variant: 'destructive',
      })
      console.error('Reanalysis error:', err)
    } finally {
      setIsReanalyzing(false)
      setIsEditing(false)
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
            <div className='mt-2 mb-5'>
              <div className='bg-slate-800 text-white py-2 px-4 rounded-t-md flex items-center'>
                <h2 className='text-lg font-semibold'>
                  {analysisItem.document_type === 'tos' ? 'ToS' : 'PP'} URL
                </h2>
                {!isEditing && (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      setIsEditing(true)
                      setEditedUrl(displayedUrl || '')
                    }}
                    className='ml-2 h-7 px-2 bg-transparent text-white border-white/30 hover:bg-white/10 hover:text-white'
                  >
                    <Edit className='h-3 w-3 mr-1' />
                    Edit
                  </Button>
                )}
              </div>
              <div className='bg-slate-50 dark:bg-slate-900 border border-t-0 border-slate-300 dark:border-slate-700 p-3 rounded-b-md'>
                {isEditing ? (
                  <div className='flex gap-2'>
                    <Input
                      type='text'
                      value={editedUrl}
                      onChange={(e) => setEditedUrl(e.target.value)}
                      className='flex-1'
                    />
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => {
                        // Reset to original URL
                        setIsEditing(false)
                        setEditedUrl(
                          displayedUrl || analysisItem.retrieved_url || ''
                        )
                      }}
                      className='text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600'
                    >
                      <X className='h-4 w-4 mr-1' />
                      Cancel
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => {
                        // Save the edited URL to displayedUrl
                        if (editedUrl.trim() !== '') {
                          setDisplayedUrl(editedUrl.trim())
                        }
                        // Just save the URL without triggering reanalysis
                        setIsEditing(false)
                        // Don't trigger reanalysis automatically
                      }}
                      className='text-green-500 border-green-200 hover:bg-green-50 hover:text-green-600'
                    >
                      <Check className='h-4 w-4 mr-1' />
                      Save
                    </Button>
                  </div>
                ) : (
                  <a
                    href={displayedUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 dark:text-blue-400 hover:underline text-sm break-all'
                  >
                    {displayedUrl}
                  </a>
                )}
              </div>
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
              className='flex items-center bg-slate-800 hover:bg-slate-700 text-white rounded px-4 py-2 h-9'
              onClick={handleReanalyze}
              disabled={isReanalyzing}
            >
              {isReanalyzing ? 'Processing...' : 'Reanalyze'}
              <RefreshCw
                className={`h-3 w-3 ml-2 ${
                  isReanalyzing ? 'animate-spin' : ''
                }`}
              />
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
