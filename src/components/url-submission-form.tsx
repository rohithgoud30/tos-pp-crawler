'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'

// Simplified API configuration
const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api',
  FALLBACK_URL: 'https://api.crwlr.app/api',
  CORS_PROXY: 'https://corsproxy.io/?',
}

// Simplified API endpoints
const ENDPOINTS = {
  TOS: 'v1/tos',
  PRIVACY: 'v1/privacy',
  EXTRACT: 'v1/extract',
  SUMMARY: 'v1/summary',
}

// API request helper with proper types
interface ApiResponse {
  success?: boolean
  tos_url?: string
  pp_url?: string
  text?: string
  one_sentence_summary?: string
  hundred_word_summary?: string
  message?: string
}

const makeApiRequest = async (
  endpoint: string,
  body: Record<string, unknown>
): Promise<ApiResponse> => {
  const configs = [
    { url: API_CONFIG.BASE_URL },
    { url: API_CONFIG.FALLBACK_URL },
    { url: API_CONFIG.BASE_URL, useProxy: true },
    { url: API_CONFIG.FALLBACK_URL, useProxy: true },
  ]

  for (const config of configs) {
    try {
      const baseUrl = config.useProxy
        ? `${API_CONFIG.CORS_PROXY}${encodeURIComponent(config.url)}`
        : config.url

      const response = await fetch(`${baseUrl}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (response.ok) return await response.json()
    } catch (err) {
      console.warn(`API attempt failed:`, err)
    }
  }

  throw new Error('All API attempts failed')
}

type ProcessingStatus = 'waiting' | 'processing' | 'completed' | 'error'

interface ProcessingStage {
  id: string
  label: string
  status: ProcessingStatus
  startTime?: number
  endTime?: number
}

// Processing stages definition
const PROCESSING_STAGES = [
  { id: 'init', label: 'Initializing' },
  { id: 'url', label: 'Validating URL' },
  { id: 'find', label: 'Finding document URL' },
  { id: 'extract', label: 'Extracting document text' },
  { id: 'analyze', label: 'Analyzing content' },
  { id: 'summarize', label: 'Generating summary' },
] as const

// Simplified summary data structure
interface SummaryData {
  one_sentence: string
  hundred_words: string
}

export default function UrlSubmissionForm() {
  const [directUrl, setDirectUrl] = useState('')
  const [docType, setDocType] = useState<'tos' | 'pp'>('tos')
  const [isLoading, setIsLoading] = useState(false)
  const [processingStages, setProcessingStages] = useState<ProcessingStage[]>(
    PROCESSING_STAGES.map((stage) => ({
      ...stage,
      status: 'waiting' as ProcessingStatus,
      startTime: undefined,
      endTime: undefined,
    }))
  )
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [progress, setProgress] = useState(0)
  const [urlError, setUrlError] = useState(false)

  // Simplified stage update function
  const updateStage = (id: string, status: ProcessingStatus) => {
    setProcessingStages((prev) => {
      const currentTime = Date.now()
      const updatedStages = prev.map((stage) =>
        stage.id === id
          ? {
              ...stage,
              status,
              ...(status === 'processing' ? { startTime: currentTime } : {}),
              ...(status === 'completed' || status === 'error'
                ? { endTime: currentTime }
                : {}),
            }
          : stage
      )

      // Calculate progress based on completed stages
      const completed = updatedStages.filter(
        (s) => s.status === 'completed'
      ).length
      const processing = updatedStages.some((s) => s.status === 'processing')
      const progressValue =
        ((completed + (processing ? 0.5 : 0)) / updatedStages.length) * 100
      setProgress(Math.min(progressValue, 100))

      return updatedStages
    })
  }

  const handleSummarize = async (e: React.FormEvent) => {
    e.preventDefault()

    // Reset states
    setIsLoading(true)
    setError(null)
    setSummary(null)
    setSuccess(null)
    setProgress(0)
    setUrlError(false)

    // Reset all processing stages
    setProcessingStages((prev) =>
      prev.map((stage) => ({
        ...stage,
        status: 'waiting',
        startTime: undefined,
        endTime: undefined,
      }))
    )

    try {
      // Initialize
      updateStage('init', 'processing')
      if (!directUrl.trim()) {
        throw new Error('Please enter a URL')
      }

      // Normalize the input URL
      let normalizedUrl = directUrl.trim()

      // Check if URL has a scheme (http/https)
      if (!normalizedUrl.startsWith('http')) {
        normalizedUrl = `https://${normalizedUrl}`
      }

      try {
        new URL(normalizedUrl)
      } catch {
        throw new Error('Invalid URL format. Please enter a valid website URL')
      }

      updateStage('init', 'completed')

      // URL Validation
      updateStage('url', 'processing')

      // Define URL variations to try if the initial request fails
      const getUrlVariations = (url: string) => {
        try {
          const parsedUrl = new URL(url)
          const domain = parsedUrl.hostname

          // Create variations with and without www
          const variations = []

          // Original URL
          variations.push(url)

          // With www if not present
          if (!domain.startsWith('www.')) {
            const wwwDomain = `www.${domain}`
            variations.push(
              `${parsedUrl.protocol}//${wwwDomain}${parsedUrl.pathname}${parsedUrl.search}`
            )
          }

          // Without www if present
          if (domain.startsWith('www.')) {
            const nonWwwDomain = domain.replace('www.', '')
            variations.push(
              `${parsedUrl.protocol}//${nonWwwDomain}${parsedUrl.pathname}${parsedUrl.search}`
            )
          }

          // Try http version if using https
          if (parsedUrl.protocol === 'https:') {
            variations.push(
              `http://${domain}${parsedUrl.pathname}${parsedUrl.search}`
            )
          }

          return variations
        } catch (error) {
          // If parsing fails, just return the original
          console.warn('Error parsing URL for variations:', error)
          return [url]
        }
      }

      const urlVariations = getUrlVariations(normalizedUrl)
      let docResponse: ApiResponse | null = null
      let successfulUrl = ''

      // Try each URL variation until one succeeds
      for (const urlVariation of urlVariations) {
        try {
          const response = await makeApiRequest(
            docType === 'tos' ? ENDPOINTS.TOS : ENDPOINTS.PRIVACY,
            { url: urlVariation }
          )

          // Check if we got a document URL
          const targetUrl =
            docType === 'tos' ? response.tos_url : response.pp_url
          if (targetUrl) {
            docResponse = response
            successfulUrl = urlVariation
            break
          }
        } catch (err) {
          console.warn(`Failed attempt with URL: ${urlVariation}`, err)
          // Continue to the next variation
        }
      }

      if (!docResponse) {
        throw new Error(
          `Could not find ${
            docType === 'tos' ? 'Terms of Service' : 'Privacy Policy'
          } for any URL variation.`
        )
      }

      updateStage('url', 'completed')

      // Find Document
      updateStage('find', 'processing')
      const targetUrl =
        docType === 'tos' ? docResponse.tos_url : docResponse.pp_url
      if (!targetUrl) {
        throw new Error(
          `No ${
            docType === 'tos' ? 'Terms of Service' : 'Privacy Policy'
          } URL found`
        )
      }

      // Handle relative URLs
      const fullTargetUrl = targetUrl.startsWith('http')
        ? targetUrl
        : new URL(targetUrl, successfulUrl).href

      updateStage('find', 'completed')

      // Extract Text
      updateStage('extract', 'processing')
      const extractData = await makeApiRequest(ENDPOINTS.EXTRACT, {
        url: fullTargetUrl,
      })
      if (!extractData.text) {
        throw new Error('No text content found in the document')
      }
      updateStage('extract', 'completed')

      // Analyze Content
      updateStage('analyze', 'processing')
      // Analysis is part of the summary generation
      updateStage('analyze', 'completed')

      // Generate Summary
      updateStage('summarize', 'processing')
      const summaryData = await makeApiRequest(ENDPOINTS.SUMMARY, {
        text: extractData.text,
        document_type:
          docType === 'tos' ? 'Terms of Service' : 'Privacy Policy',
      })

      if (summaryData?.success) {
        setSummary({
          one_sentence: summaryData.one_sentence_summary || '',
          hundred_words: summaryData.hundred_word_summary || '',
        })
        updateStage('summarize', 'completed')
        setSuccess(
          `Successfully summarized the ${
            docType === 'tos' ? 'Terms of Service' : 'Privacy Policy'
          } from ${successfulUrl}`
        )
      } else {
        throw new Error('Failed to generate summary')
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      setUrlError(errorMessage.includes('URL'))

      // Set remaining stages to error
      setProcessingStages((prev) =>
        prev.map((stage) =>
          stage.status === 'waiting' || stage.status === 'processing'
            ? { ...stage, status: 'error', endTime: Date.now() }
            : stage
        )
      )
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setSummary(null)
    setSuccess(null)
    setError(null)
    setProgress(0)
    setProcessingStages((prev) =>
      prev.map((stage) => ({
        ...stage,
        status: 'waiting',
        startTime: undefined,
        endTime: undefined,
      }))
    )
  }

  return (
    <Card className='w-full max-w-[1000px] mx-auto shadow-sm border border-slate-200 dark:border-slate-800 dark:bg-slate-950'>
      <CardHeader className='pb-6 border-b border-slate-200 dark:border-slate-800'>
        <CardTitle className='text-xl font-semibold text-slate-900 dark:text-slate-50'>
          Summarize Terms & Privacy Documents
        </CardTitle>
        <CardDescription className='text-sm text-slate-600 dark:text-slate-400 mt-2'>
          Submit a website URL or app store link to get summaries of Terms of
          Service or Privacy Policy documents.
        </CardDescription>
      </CardHeader>

      <CardContent className='p-4 sm:p-6'>
        <div className='relative flex flex-col lg:block'>
          <div className='w-full lg:w-[640px] space-y-6'>
            <form onSubmit={handleSummarize}>
              <div className='space-y-6'>
                <div className='space-y-2'>
                  <div className='flex flex-col sm:flex-row gap-2 sm:gap-3'>
                    <Input
                      type='text'
                      placeholder='Enter website or app URL'
                      value={directUrl}
                      onChange={(e) => {
                        setDirectUrl(e.target.value)
                        setUrlError(false)
                        setError(null)
                      }}
                      className={`flex-1 h-10 text-sm ${
                        urlError ? 'border-red-500 focus:ring-red-500' : ''
                      }`}
                      disabled={isLoading}
                      required
                    />
                    <Button
                      type='submit'
                      disabled={isLoading || !directUrl.trim()}
                      className='h-10 px-5 text-sm w-full sm:w-auto sm:min-w-[120px] relative font-medium bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 dark:text-white disabled:dark:bg-slate-700 disabled:dark:hover:bg-slate-700 disabled:dark:opacity-50'
                    >
                      <span className={isLoading ? 'opacity-0' : ''}>
                        Summarize
                      </span>
                      {isLoading && (
                        <div className='absolute inset-0 flex items-center justify-center'>
                          <Loader2 className='w-4 h-4 animate-spin' />
                        </div>
                      )}
                    </Button>
                  </div>
                  {urlError && (
                    <p className='text-xs text-red-500 flex items-center'>
                      <AlertCircle className='h-3.5 w-3.5 mr-1.5 shrink-0' />
                      Please enter a valid URL
                    </p>
                  )}
                </div>

                <div className='flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 text-sm border-t border-slate-200 dark:border-slate-800 pt-6'>
                  <span className='text-slate-700 dark:text-slate-300 font-medium'>
                    Document Type:
                  </span>
                  <div className='flex gap-3 w-full sm:w-auto'>
                    <Button
                      type='button'
                      variant={docType === 'tos' ? 'default' : 'outline'}
                      onClick={() => setDocType('tos')}
                      className={`h-9 px-4 text-sm font-medium flex-1 sm:flex-none ${
                        docType === 'tos'
                          ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 dark:text-white'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300 dark:hover:text-slate-200'
                      }`}
                    >
                      Terms of Service
                    </Button>
                    <Button
                      type='button'
                      variant={docType === 'pp' ? 'default' : 'outline'}
                      onClick={() => setDocType('pp')}
                      className={`h-9 px-4 text-sm font-medium flex-1 sm:flex-none ${
                        docType === 'pp'
                          ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 dark:text-white'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300 dark:hover:text-slate-200'
                      }`}
                    >
                      Privacy Policy
                    </Button>
                  </div>
                </div>
              </div>
            </form>

            <div className='space-y-3'>
              {error && (
                <Alert variant='destructive' className='py-3'>
                  <AlertCircle className='h-4 w-4' />
                  <AlertTitle className='text-sm font-medium ml-3'>
                    {error}
                  </AlertTitle>
                </Alert>
              )}

              {success && !error && (
                <Alert className='py-3 bg-green-50 border-green-200'>
                  <CheckCircle className='h-4 w-4 text-green-500' />
                  <AlertTitle className='text-sm font-medium text-green-700 ml-3'>
                    {success}
                  </AlertTitle>
                </Alert>
              )}
            </div>

            {summary && (
              <div className='space-y-6 pt-2'>
                <div className='space-y-3 bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800'>
                  <h4 className='text-sm font-medium text-slate-900 dark:text-slate-50 mb-2'>
                    One Sentence Summary
                  </h4>
                  <p className='text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-950 p-3 rounded border border-slate-200 dark:border-slate-800'>
                    {summary.one_sentence}
                  </p>
                </div>

                <div className='space-y-3 bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800'>
                  <h4 className='text-sm font-medium text-slate-900 dark:text-slate-50 mb-2'>
                    100-Word Summary
                  </h4>
                  <p className='text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-950 p-3 rounded border border-slate-200 dark:border-slate-800'>
                    {summary.hundred_words}
                  </p>
                </div>

                <div className='flex justify-center pt-6'>
                  <Button
                    onClick={resetForm}
                    variant='outline'
                    className='h-9 px-6 text-sm font-medium min-w-[200px] bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200 hover:border-blue-300 dark:bg-blue-950 dark:hover:bg-blue-900 dark:text-blue-400 dark:border-blue-800 dark:hover:border-blue-700'
                  >
                    Summarize Another URL
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div
            className={`${
              !isLoading && !summary
                ? 'opacity-0 pointer-events-none'
                : 'opacity-100'
            } transition-opacity duration-200 mt-6 lg:mt-0 lg:absolute lg:top-0 lg:left-[688px] w-full lg:w-[280px] bg-slate-50 dark:bg-slate-900 rounded-lg p-4 sm:p-5 border border-slate-200 dark:border-slate-800`}
          >
            <div className='flex items-center gap-3 mb-5 pb-4 border-b border-slate-200 dark:border-slate-800'>
              <div className='relative w-5 h-5'>
                <Loader2
                  className={`w-5 h-5 absolute ${
                    isLoading
                      ? 'animate-spin text-blue-500'
                      : 'text-slate-300 dark:text-slate-600'
                  }`}
                />
              </div>
              <div className='flex-1 min-w-0'>
                <div className='text-slate-500 dark:text-slate-400 text-xs mt-1.5'>
                  {!isLoading &&
                  processingStages.some((s) => s.status === 'completed')
                    ? 'Completed'
                    : isLoading
                    ? 'In Progress'
                    : 'Waiting to start'}
                </div>
              </div>
              {isLoading && (
                <span className='text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-1 rounded-full'>
                  {Math.round(progress)}%
                </span>
              )}
            </div>

            <div className='space-y-2.5'>
              {processingStages.map((stage) => (
                <div
                  key={stage.id}
                  className='flex items-center justify-between p-2.5 rounded-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800'
                >
                  <div className='flex items-center gap-2.5 min-w-0 flex-1'>
                    <div className='shrink-0'>
                      {stage.status === 'waiting' && (
                        <div className='w-4 h-4 rounded-full border-2 border-slate-200 dark:border-slate-700' />
                      )}
                      {stage.status === 'processing' && (
                        <Loader2 className='w-4 h-4 text-blue-500 animate-spin' />
                      )}
                      {stage.status === 'completed' && (
                        <CheckCircle className='w-4 h-4 text-green-500 dark:text-green-400' />
                      )}
                      {stage.status === 'error' && (
                        <AlertCircle className='w-4 h-4 text-red-500 dark:text-red-400' />
                      )}
                    </div>
                    <span
                      className={`text-sm truncate ${
                        stage.status === 'waiting'
                          ? 'text-slate-400 dark:text-slate-500'
                          : stage.status === 'processing'
                          ? 'text-blue-600 dark:text-blue-400 font-medium'
                          : stage.status === 'completed'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400 font-medium'
                      }`}
                    >
                      {stage.label}
                    </span>
                  </div>
                  {(stage.status === 'completed' || stage.status === 'error') &&
                    stage.startTime &&
                    stage.endTime && (
                      <span className='text-xs font-medium text-slate-400 dark:text-slate-500 tabular-nums bg-slate-50 dark:bg-slate-900 px-1.5 py-0.5 rounded'>
                        {((stage.endTime - stage.startTime) / 1000).toFixed(1)}{' '}
                        sec
                      </span>
                    )}
                </div>
              ))}
            </div>

            {isLoading && (
              <div className='mt-4'>
                <Progress
                  value={progress}
                  className='h-1.5 bg-slate-100 dark:bg-slate-800'
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
