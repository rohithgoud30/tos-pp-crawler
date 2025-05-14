'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Search,
  ArrowUpDown,
  ExternalLink,
  Globe,
  Clock,
  FileText,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Check,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import {
  type SubmissionCreateParams,
  createSubmission,
  type SubmissionListParams,
  type SubmissionSearchParams,
  type SubmissionRetryParams,
  retrySubmission,
  adminSearchAllSubmissions,
  type AdminSearchSubmissionsParams,
} from '@/lib/api'
import {
  useSubmissionsList,
  useSubmissionSearch,
} from '@/hooks/use-cached-data'
import { useUser } from '@clerk/nextjs'

// Define enhanced submission response types to match backend
interface SubmissionItem {
  id: string
  url: string
  document_type: 'tos' | 'pp'
  document_url?: string
  status: string
  created_at: string
  updated_at: string
  document_id?: string
  user_email: string
}

interface PaginatedSubmissionResponse {
  items: SubmissionItem[]
  total: number
  page: number
  size: number
  error_status?: boolean
  error_message?: string
}

export default function SubmissionsPage() {
  const urlParams = useSearchParams()
  const router = useRouter()
  const { user, isLoaded, isSignedIn } = useUser()
  const isAdmin = isSignedIn && user?.publicMetadata?.role === 'admin'
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSearchQuery, setActiveSearchQuery] = useState('')
  const [adminMode, setAdminMode] = useState(false)
  const [adminUserEmail, setAdminUserEmail] = useState('')
  const [documentTypeFilter, setDocumentTypeFilter] = useState<
    'tos' | 'pp' | undefined
  >(undefined)
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  )
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [resultsPerPage, setResultsPerPage] = useState(adminMode ? 10 : 6)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [submissionForm, setSubmissionForm] = useState<SubmissionCreateParams>({
    url: '',
    document_type: 'tos',
    document_url: '',
    user_email: '',
  })
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [retryingId, setRetryingId] = useState<string | null>(null)
  const [retryStatus, setRetryStatus] = useState<
    'idle' | 'retrying' | 'success' | 'error'
  >('idle')
  const [retryError, setRetryError] = useState<string | null>(null)
  const [successfulRetryId, setSuccessfulRetryId] = useState<string | null>(
    null
  )
  const [adminSearchResults, setAdminSearchResults] =
    useState<PaginatedSubmissionResponse | null>(null)
  const [isAdminSearching, setIsAdminSearching] = useState(false)
  const [adminSearchError, setAdminSearchError] = useState<string | null>(null)

  // Redirect to login if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/auth/login')
    }
  }, [isLoaded, isSignedIn, router])

  // Set user email from Clerk
  useEffect(() => {
    if (isSignedIn && user?.emailAddresses?.length) {
      const primaryEmail =
        user.primaryEmailAddress?.emailAddress ||
        user.emailAddresses[0].emailAddress
      setSubmissionForm((prev) => ({ ...prev, user_email: primaryEmail }))
    }
  }, [isSignedIn, user])

  // Update resultsPerPage when adminMode changes
  useEffect(() => {
    setResultsPerPage(adminMode ? 10 : 6)
  }, [adminMode])

  // Update adminMode when isAdmin changes - ensure only admin users can enable this mode
  useEffect(() => {
    if (!isAdmin) {
      setAdminMode(false)
    }
  }, [isAdmin])

  // Build submission list parameters with safe conversion for hooks
  const submissionListParams =
    isSignedIn && !adminMode && submissionForm.user_email
      ? ({
          user_email: submissionForm.user_email,
          page: currentPage,
          size: resultsPerPage,
          sort_order: sortOrder,
          search_url: activeSearchQuery || undefined,
        } as SubmissionListParams)
      : null

  // Only use hooks for non-admin mode
  const hookListParams = !adminMode ? submissionListParams : null

  // Build submission search parameters
  const submissionSearchParams =
    isSignedIn &&
    activeSearchQuery &&
    !adminMode && // Only build regular search params when not in admin mode
    submissionForm.user_email
      ? ({
          query: activeSearchQuery,
          user_email: submissionForm.user_email,
          page: currentPage,
          size: resultsPerPage,
          sort_order: sortOrder,
          document_type: documentTypeFilter,
          status: statusFilter,
        } as SubmissionSearchParams)
      : null

  // Only use hooks for non-admin searches
  const hookSearchParams = !adminMode ? submissionSearchParams : null

  // Fetch submissions data
  const {
    submissions: listResults,
    isLoading: isListLoading,
    error: listFetchError,
    mutate: mutateList,
  } = useSubmissionsList(hookListParams, {
    revalidateOnMount: !adminMode, // Only revalidate if not in admin mode
  }) as {
    submissions: PaginatedSubmissionResponse | null
    isLoading: boolean
    error: Error | null
    mutate: () => void
  }

  // Fetch search results
  const {
    results: searchResults,
    isLoading: isSearchLoading,
    error: searchFetchError,
    mutate: mutateSearch,
  } = useSubmissionSearch(hookSearchParams, {
    revalidateOnMount: activeSearchQuery && !adminMode ? true : false, // Only revalidate if not in admin mode
  }) as {
    results: PaginatedSubmissionResponse | null
    isLoading: boolean
    error: Error | null
    mutate: () => void
  }

  // Handle admin search
  const handleAdminSearch = async () => {
    if (!isAdmin || !adminMode) {
      return
    }

    setIsAdminSearching(true)
    setAdminSearchError(null)

    try {
      const params: AdminSearchSubmissionsParams = {
        role: 'admin',
        page: currentPage,
        size: resultsPerPage,
        sort_order: sortOrder,
      }

      // Only add parameters that have values
      if (searchQuery.trim()) params.query = searchQuery.trim()
      if (adminUserEmail.trim()) params.user_email = adminUserEmail.trim()
      if (documentTypeFilter) params.document_type = documentTypeFilter
      if (statusFilter) params.status = statusFilter

      const results = await adminSearchAllSubmissions(params)
      setAdminSearchResults(results as unknown as PaginatedSubmissionResponse)

      // Update active search query to indicate search was performed
      setActiveSearchQuery(searchQuery)
    } catch (error) {
      console.error('Admin search error:', error)
      setAdminSearchError(
        error instanceof Error ? error.message : 'Admin search failed'
      )
      setAdminSearchResults(null)
    } finally {
      setIsAdminSearching(false)
    }
  }

  // Handle normal search
  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault()

    if (adminMode && isAdmin) {
      // Use admin search instead
      handleAdminSearch()
    } else {
      // Regular search behavior
      setActiveSearchQuery(searchQuery)
    }

    setCurrentPage(1)
  }

  // Determine which results to display
  const resultsPagination =
    adminMode && adminSearchResults
      ? adminSearchResults
      : activeSearchQuery
      ? searchResults
      : listResults

  const displayedResults = resultsPagination?.items || []
  const isLoading =
    adminMode && isAdmin
      ? isAdminSearching
      : activeSearchQuery
      ? isSearchLoading
      : isListLoading
  const isEmpty =
    !isLoading && (!resultsPagination || displayedResults.length === 0)

  // Only treat as error if it's a real error, not just empty results
  const hasError =
    !isLoading &&
    (adminSearchError != null ||
      (resultsPagination?.error_status === true &&
        !resultsPagination.error_message?.includes('No submissions found')))

  // Handle errors from hooks
  useEffect(() => {
    if (adminSearchError) {
      setFetchError(adminSearchError)
    } else if (searchFetchError) {
      setFetchError('Search failed. Please try again.')
    } else if (listFetchError) {
      setFetchError('Failed to load submissions. Please try again.')
    } else if (
      resultsPagination?.error_status &&
      resultsPagination.error_message
    ) {
      // Only set error for actual error conditions, not when just no submissions are found
      if (!resultsPagination.error_message.includes('No submissions found')) {
        setFetchError(resultsPagination.error_message)
      } else {
        setFetchError(null)
      }
    } else {
      setFetchError(null)
    }
  }, [adminSearchError, searchFetchError, listFetchError, resultsPagination])

  // Load URL parameters
  useEffect(() => {
    const queryParam = urlParams.get('q')
    const typeParam = urlParams.get('type') as 'tos' | 'pp' | undefined
    const statusParam = urlParams.get('status')
    const perPageParam = urlParams.get('perPage')
    const orderParam = urlParams.get('order') as 'asc' | 'desc' | undefined
    const pageParam = urlParams.get('page')

    if (queryParam) {
      setSearchQuery(queryParam)
      setActiveSearchQuery(queryParam)
    }

    if (typeParam && ['tos', 'pp'].includes(typeParam)) {
      setDocumentTypeFilter(typeParam)
    }

    if (statusParam) {
      setStatusFilter(statusParam)
    }

    if (perPageParam) {
      const perPageValue = Number.parseInt(perPageParam, 10)
      if ([6, 9, 12, 15].includes(perPageValue)) {
        setResultsPerPage(perPageValue)
      }
    }

    if (orderParam && ['asc', 'desc'].includes(orderParam)) {
      setSortOrder(orderParam)
    }

    if (pageParam) {
      const pageValue = Number.parseInt(pageParam, 10)
      if (pageValue > 0) {
        setCurrentPage(pageValue)
      }
    }
  }, [urlParams])

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setSubmissionForm((prev) => ({ ...prev, [name]: value }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Validate required fields
      if (!submissionForm.url) {
        throw new Error('URL is required')
      }
      if (!submissionForm.user_email) {
        throw new Error('User is not authenticated. Please log in.')
      }

      await createSubmission(submissionForm)
      // Reset form except for email
      setSubmissionForm((prev) => ({
        url: '',
        document_type: 'tos',
        document_url: '',
        user_email: prev.user_email,
      }))

      // Refresh the submission list
      mutateList()
      if (activeSearchQuery) {
        mutateSearch()
      }

      // Close the dialog if it's open
      setCreateDialogOpen(false)

      // Switch to the list tab
      setActiveSearchQuery('')
    } catch (error) {
      console.error('Submission error:', error)
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to submit URL'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle retry submission
  const handleRetrySubmission = async (
    submissionId: string,
    document_url?: string
  ) => {
    if (!submissionForm.user_email) {
      setRetryError('User is not authenticated. Please log in.')
      return
    }

    setRetryingId(submissionId)
    setRetryStatus('retrying')
    setRetryError(null)
    setSuccessfulRetryId(null)

    try {
      const retryParams: SubmissionRetryParams = {
        document_url: document_url || '',
        user_email: submissionForm.user_email,
      }

      const result = await retrySubmission(submissionId, retryParams)

      // Set success status
      setRetryStatus('success')

      // Refresh the submission list
      mutateList()
      if (activeSearchQuery) {
        mutateSearch()
      }

      // If successful and has document_id, store it for the View button
      if (result.status === 'success' && result.document_id) {
        setSuccessfulRetryId(result.document_id)
        // Do not redirect - let user choose when to navigate
      }
    } catch (error) {
      console.error('Retry error:', error)
      setRetryStatus('error')
      setRetryError(
        error instanceof Error ? error.message : 'Failed to retry submission'
      )
    } finally {
      // For errors, reset retry status after a delay
      if (retryStatus === 'error') {
        setTimeout(() => {
          setRetryingId(null)
          setRetryStatus('idle')
        }, 3000)
      }
      // Success state persists until user takes action
    }
  }

  // Handle document type filter change
  const handleDocumentTypeChange = (value: string) => {
    setDocumentTypeFilter(value === 'all' ? undefined : (value as 'tos' | 'pp'))
    // Only reset page, don't trigger search
    if (!adminMode) {
      setCurrentPage(1)
    }
  }

  // Handle status filter change
  const handleStatusChange = (value: string) => {
    setStatusFilter(value === 'all' ? undefined : value)
    // Only reset page, don't trigger search
    if (!adminMode) {
      setCurrentPage(1)
    }
  }

  // Handle sort order change
  const handleSortOrderChange = () => {
    setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'))
    // Only reset page, don't trigger search
    if (!adminMode) {
      setCurrentPage(1)
    }
  }

  // Handle results per page change
  const handleResultsPerPageChange = (value: string) => {
    setResultsPerPage(parseInt(value, 10))
    // Only reset page, don't trigger search
    if (!adminMode) {
      setCurrentPage(1)
    }
  }

  // Helper to format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className='bg-green-500'>Success</Badge>
      case 'failed':
        return <Badge variant='destructive'>Failed</Badge>
      case 'processing':
        return <Badge className='bg-blue-500'>Processing</Badge>
      case 'analyzing':
        return <Badge className='bg-purple-500'>Analyzing</Badge>
      case 'initialized':
        return <Badge variant='outline'>Initialized</Badge>
      default:
        return <Badge variant='secondary'>{status}</Badge>
    }
  }

  // Add handler to clear admin search
  const handleClearAdminSearch = () => {
    setSearchQuery('')
    setActiveSearchQuery('')
    setAdminUserEmail('')
    setDocumentTypeFilter(undefined)
    setStatusFilter(undefined)
    setAdminSearchResults(null)
    setCurrentPage(1)
  }

  // Handle pagination for admin search
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)

    // In admin mode, we need to perform a new search
    if (adminMode && isAdmin) {
      // Wait for state to update, then perform search
      setTimeout(() => handleAdminSearch(), 0)
    }
  }

  // If not loaded yet, show loading state
  if (!isLoaded) {
    return (
      <main className='container mx-auto py-6 flex justify-center items-center min-h-[70vh]'>
        <div className='text-center'>
          <Skeleton className='h-12 w-12 rounded-full mx-auto mb-4' />
          <Skeleton className='h-4 w-32 mx-auto mb-2' />
          <Skeleton className='h-4 w-48 mx-auto' />
        </div>
      </main>
    )
  }

  // If not signed in, don't render - we'll be redirected to login
  if (!isSignedIn) {
    return null
  }

  // Render table of submissions
  const renderSubmissionsTable = () => {
    return (
      <div className='w-full mx-auto p-4'>
        {/* Search section - redesigned to match the reference image */}
        <div className='mb-6 p-6 bg-card rounded-lg border shadow-sm'>
          {/* Search bar at the top */}
          <div className='mb-4 w-full'>
            <form onSubmit={handleSearch} className='flex w-full space-x-2'>
              <div className='relative flex-1'>
                <Input
                  type='text'
                  placeholder='Search by URL...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='w-full pr-10 h-12 bg-background border-muted-foreground/20 text-base'
                />
                <Button
                  type='submit'
                  size='icon'
                  className='absolute right-1 top-1 h-10 w-10 rounded-md'
                >
                  <Search className='h-5 w-5' />
                </Button>
              </div>
            </form>
          </div>

          {/* Admin mode toggle and user email - only visible to admins */}
          {isAdmin && (
            <div className='mb-4'>
              <div className='text-sm text-amber-600 dark:text-amber-400 mb-2 p-2 bg-amber-50 dark:bg-amber-950/30 rounded-md'>
                <strong>Note:</strong> Admin search functionality requires
                backend support. Make sure your backend API has been updated to
                support the admin search endpoint.
              </div>
              <div className='flex items-center gap-2 mb-2'>
                <Checkbox
                  id='adminMode'
                  checked={adminMode}
                  onCheckedChange={(checked: boolean) => setAdminMode(checked)}
                />
                <Label htmlFor='adminMode' className='font-medium'>
                  Admin Search Mode
                </Label>
              </div>

              {adminMode && (
                <div className='mt-2'>
                  <Label
                    htmlFor='adminUserEmail'
                    className='text-sm mb-1 block'
                  >
                    Filter by User Email (optional)
                  </Label>
                  <div className='flex gap-2 items-center mb-3'>
                    <div className='flex-1'>
                      <Input
                        id='adminUserEmail'
                        type='email'
                        placeholder='Enter user email to filter...'
                        value={adminUserEmail}
                        onChange={(e) => setAdminUserEmail(e.target.value)}
                        className='w-full'
                      />
                    </div>
                    <Button
                      type='button'
                      onClick={handleAdminSearch}
                      disabled={isAdminSearching}
                      className='whitespace-nowrap'
                    >
                      {isAdminSearching ? (
                        <>
                          <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className='mr-2 h-4 w-4' />
                          Search All
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Filters row */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-3'>
            {/* Document type filter */}
            <Select
              value={documentTypeFilter || 'all'}
              onValueChange={handleDocumentTypeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder='All Documents' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Types</SelectItem>
                <SelectItem value='tos'>Terms of Service</SelectItem>
                <SelectItem value='pp'>Privacy Policy</SelectItem>
              </SelectContent>
            </Select>

            {/* Status filter */}
            <Select
              value={statusFilter || 'all'}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Statuses</SelectItem>
                <SelectItem value='initialized'>Initialized</SelectItem>
                <SelectItem value='processing'>Processing</SelectItem>
                <SelectItem value='analyzing'>Analyzing</SelectItem>
                <SelectItem value='success'>Success</SelectItem>
                <SelectItem value='failed'>Failed</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort order control */}
            <div className='flex items-center'>
              <Button
                variant='outline'
                className='flex items-center justify-between w-full'
                onClick={handleSortOrderChange}
                title={`Currently sorting by date ${
                  sortOrder === 'desc' ? 'newest first' : 'oldest first'
                }`}
              >
                <span>{sortOrder === 'desc' ? 'Descending' : 'Ascending'}</span>
                <ArrowUpDown className='h-4 w-4 ml-2' />
              </Button>
            </div>

            {/* Select results per page */}
            <Select
              value={resultsPerPage.toString()}
              onValueChange={handleResultsPerPageChange}
            >
              <SelectTrigger>
                <SelectValue placeholder='Results per page' />
              </SelectTrigger>
              <SelectContent>
                {adminMode ? (
                  <>
                    <SelectItem value='10'>10 / page</SelectItem>
                    <SelectItem value='20'>20 / page</SelectItem>
                    <SelectItem value='50'>50 / page</SelectItem>
                    <SelectItem value='100'>100 / page</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value='6'>6 / page</SelectItem>
                    <SelectItem value='9'>9 / page</SelectItem>
                    <SelectItem value='12'>12 / page</SelectItem>
                    <SelectItem value='15'>15 / page</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Add Apply Filters button for admin mode */}
          {adminMode && isAdmin && (
            <div className='flex justify-end gap-3 mt-3'>
              <Button
                variant='outline'
                onClick={handleClearAdminSearch}
                className='border-slate-300'
              >
                <X className='mr-2 h-4 w-4' />
                Clear Filters
              </Button>
              <Button
                onClick={handleAdminSearch}
                disabled={isAdminSearching}
                className='bg-slate-800 hover:bg-slate-700'
              >
                {isAdminSearching ? (
                  <>
                    <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                    Applying Filters...
                  </>
                ) : (
                  <>
                    <Search className='mr-2 h-4 w-4' />
                    Apply Filters
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* New submission button above table */}
        <div className='flex justify-end mb-4'>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className='flex items-center'>
                <Plus className='mr-2 h-4 w-4' />
                New
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>

        {fetchError && (
          <div className='mb-4 p-3 rounded-md bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200'>
            <p className='flex items-center'>
              <AlertCircle className='h-4 w-4 mr-2' />
              {fetchError}
            </p>
            {fetchError.includes('Failed to load') && (
              <Button
                variant='outline'
                size='sm'
                className='mt-2'
                onClick={() => {
                  // Refresh data
                  mutateList()
                  if (activeSearchQuery) {
                    mutateSearch()
                  }
                }}
              >
                <RefreshCw className='mr-2 h-4 w-4' />
                Try Again
              </Button>
            )}
          </div>
        )}

        {/* Results count summary */}
        {resultsPagination && (
          <div className='flex flex-col md:flex-row justify-between mb-6 text-gray-500 dark:text-gray-400 text-center md:text-left'>
            <p className='mb-2 md:mb-0'>
              Showing{' '}
              {isLoading
                ? displayedResults.length
                : resultsPagination.items.length}{' '}
              of {resultsPagination.total} results
            </p>
          </div>
        )}

        {/* Submissions table */}
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && !displayedResults.length
                ? Array.from({ length: 3 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell>
                        <Skeleton className='h-6 w-full' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-6 w-16' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-6 w-24' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-6 w-32' />
                      </TableCell>
                      <TableCell className='text-right'>
                        <Skeleton className='h-6 w-20 ml-auto' />
                      </TableCell>
                    </TableRow>
                  ))
                : displayedResults.length > 0
                ? displayedResults.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className='max-w-[200px] truncate'>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className='flex items-center text-left'>
                              <Globe className='mr-2 h-4 w-4 flex-shrink-0' />
                              <span className='truncate'>{submission.url}</span>
                            </TooltipTrigger>
                            <TooltipContent>{submission.url}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline'>
                          {submission.document_type === 'tos'
                            ? 'Terms'
                            : 'Privacy'}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(submission.status)}</TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className='flex items-center'>
                              <Clock className='mr-2 h-4 w-4' />
                              {formatDate(submission.created_at)}
                            </TooltipTrigger>
                            <TooltipContent>
                              Last updated: {formatDate(submission.updated_at)}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex justify-end space-x-2'>
                          {submission.status === 'success' &&
                            submission.document_id && (
                              <Button variant='ghost' size='sm' asChild>
                                <Link
                                  href={`/analysis/${submission.document_id}`}
                                >
                                  <FileText className='mr-1 h-4 w-4' />
                                  View
                                </Link>
                              </Button>
                            )}
                          {submission.status === 'failed' &&
                            (retryingId === submission.id &&
                            retryStatus === 'success' &&
                            successfulRetryId ? (
                              <div className='flex flex-col w-full'>
                                <div className='p-3 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300 rounded-md mb-3 flex items-center'>
                                  <Check className='h-5 w-5 mr-2' />
                                  Analysis successful! Document is ready.
                                </div>
                                <div className='flex space-x-3'>
                                  <Button
                                    type='button'
                                    variant='outline'
                                    onClick={() => {
                                      setCreateDialogOpen(false)
                                      // Refresh the list after closing dialog
                                      mutateList()
                                    }}
                                  >
                                    Close
                                  </Button>
                                  <Button
                                    type='button'
                                    variant='default'
                                    className='bg-green-600 hover:bg-green-700'
                                    asChild
                                  >
                                    <Link
                                      href={`/analysis/${successfulRetryId}`}
                                    >
                                      <FileText className='mr-2 h-4 w-4' />
                                      View Analysis
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => {
                                  // Direct retry if we have submission id
                                  if (submission.document_url) {
                                    // If we already have document_url, retry directly
                                    handleRetrySubmission(
                                      submission.id,
                                      submission.document_url
                                    )
                                  } else {
                                    // Otherwise open dialog for user to enter document URL
                                    setSubmissionForm((prev) => ({
                                      ...prev,
                                      url: submission.url,
                                      document_type: submission.document_type,
                                      document_url: '',
                                    }))
                                    setCreateDialogOpen(true)
                                  }
                                }}
                                disabled={
                                  retryingId === submission.id &&
                                  retryStatus === 'retrying'
                                }
                                className={
                                  retryingId === submission.id
                                    ? retryStatus === 'success'
                                      ? 'bg-green-50 text-green-600 border-green-200'
                                      : retryStatus === 'error'
                                      ? 'bg-red-50 text-red-600 border-red-200'
                                      : ''
                                    : ''
                                }
                              >
                                {retryingId === submission.id ? (
                                  retryStatus === 'retrying' ? (
                                    <>
                                      <RefreshCw className='mr-1 h-4 w-4 animate-spin' />
                                      Retrying...
                                    </>
                                  ) : retryStatus === 'success' ? (
                                    <>
                                      <Check className='mr-1 h-4 w-4' />
                                      Success
                                    </>
                                  ) : retryStatus === 'error' ? (
                                    <>
                                      <AlertCircle className='mr-1 h-4 w-4' />
                                      Failed
                                    </>
                                  ) : (
                                    <>
                                      <RefreshCw className='mr-1 h-4 w-4' />
                                      Retry
                                    </>
                                  )
                                ) : (
                                  <>
                                    <RefreshCw className='mr-1 h-4 w-4' />
                                    Retry
                                  </>
                                )}
                              </Button>
                            ))}
                          <Button variant='ghost' size='sm' asChild>
                            <a
                              href={submission.url}
                              target='_blank'
                              rel='noopener noreferrer'
                            >
                              <ExternalLink className='h-4 w-4' />
                            </a>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                : isEmpty &&
                  !hasError && (
                    <TableRow>
                      <TableCell colSpan={5} className='text-center py-8'>
                        <div className='flex flex-col items-center justify-center text-muted-foreground'>
                          <FileText className='h-8 w-8 mb-2' />
                          <p>No submissions found</p>
                          <p className='text-sm'>
                            {activeSearchQuery ||
                            documentTypeFilter ||
                            statusFilter
                              ? 'Try a different search term or clear filters'
                              : 'Submit a URL to get started'}
                          </p>
                          <Button
                            variant='outline'
                            className='mt-4'
                            onClick={() => {
                              // Clear filters if they exist
                              if (
                                activeSearchQuery ||
                                documentTypeFilter ||
                                statusFilter
                              ) {
                                setActiveSearchQuery('')
                                setSearchQuery('')
                                setDocumentTypeFilter(undefined)
                                setStatusFilter(undefined)
                              } else {
                                setCreateDialogOpen(true)
                              }
                            }}
                          >
                            {activeSearchQuery ||
                            documentTypeFilter ||
                            statusFilter ? (
                              <>Clear Filters</>
                            ) : (
                              <>
                                <Plus className='mr-2 h-4 w-4' />
                                Submit New URL
                              </>
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
              {hasError && (
                <TableRow>
                  <TableCell colSpan={5} className='text-center py-8'>
                    <div className='flex flex-col items-center justify-center text-muted-foreground'>
                      <AlertCircle className='h-8 w-8 mb-2 text-red-500' />
                      <p className='text-red-500 font-medium'>
                        Error Loading Submissions
                      </p>
                      <p className='text-sm max-w-md text-center mt-1'>
                        {resultsPagination?.error_message ||
                          'There was a problem connecting to the server. Please try again.'}
                      </p>
                      <div className='flex space-x-3 mt-4'>
                        <Button
                          variant='outline'
                          onClick={() => {
                            // Refresh data
                            mutateList()
                            if (activeSearchQuery) {
                              mutateSearch()
                            }
                          }}
                        >
                          <RefreshCw className='mr-2 h-4 w-4' />
                          Try Again
                        </Button>
                        {(activeSearchQuery ||
                          documentTypeFilter ||
                          statusFilter) && (
                          <Button
                            variant='secondary'
                            onClick={() => {
                              // Clear filters
                              setActiveSearchQuery('')
                              setSearchQuery('')
                              setDocumentTypeFilter(undefined)
                              setStatusFilter(undefined)
                            }}
                          >
                            Clear Filters
                          </Button>
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination controls */}
        {resultsPagination &&
          resultsPagination.total > 0 &&
          !resultsPagination.error_status && (
            <div className='flex items-center justify-between mt-4'>
              <div className='flex items-center space-x-2'>
                <p className='text-sm text-muted-foreground'>
                  Showing{' '}
                  <span className='font-medium'>{displayedResults.length}</span>{' '}
                  of{' '}
                  <span className='font-medium'>{resultsPagination.total}</span>{' '}
                  results
                </p>
              </div>

              <div className='flex items-center space-x-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className='h-4 w-4' />
                </Button>
                <span className='text-sm'>
                  Page {currentPage} of{' '}
                  {Math.ceil(resultsPagination.total / resultsPerPage) || 1}
                </span>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={
                    currentPage >=
                    Math.ceil(resultsPagination.total / resultsPerPage)
                  }
                >
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>
            </div>
          )}
      </div>
    )
  }

  return (
    <main className='container mx-auto py-6'>
      <h1 className='text-3xl font-bold mb-6 text-center'>URL Submissions</h1>

      {renderSubmissionsTable()}

      {/* Dialog for creating a new submission */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>Submit URL for Analysis</DialogTitle>
            <DialogDescription>
              Enter the URL you want to analyze for legal documents.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='url'>Website URL</Label>
              <Input
                id='url'
                name='url'
                type='text'
                required
                placeholder='example.com'
                value={submissionForm.url}
                onChange={handleInputChange}
              />
              <p className='text-sm text-muted-foreground'>
                Enter the website&apos;s main URL
              </p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='document_type'>Document Type</Label>
              <Select
                name='document_type'
                value={submissionForm.document_type}
                onValueChange={(value) =>
                  setSubmissionForm((prev) => ({
                    ...prev,
                    document_type: value as 'tos' | 'pp',
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select document type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='tos'>Terms of Service</SelectItem>
                  <SelectItem value='pp'>Privacy Policy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Only show document_url field in retry dialog for failed submissions */}
            {submissionForm.url &&
              displayedResults.some(
                (s) => s.url === submissionForm.url && s.status === 'failed'
              ) && (
                <div className='space-y-2'>
                  <Label htmlFor='document_url'>Document URL</Label>
                  <Input
                    id='document_url'
                    name='document_url'
                    type='text'
                    placeholder='example.com/terms'
                    value={submissionForm.document_url || ''}
                    onChange={handleInputChange}
                  />
                  <p className='text-sm text-muted-foreground'>
                    Since the previous submission failed, please provide the
                    exact URL to the document
                  </p>
                </div>
              )}

            {submitError && (
              <div className='p-3 rounded-md bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200'>
                <p className='flex items-center'>
                  <AlertCircle className='h-4 w-4 mr-2' />
                  {submitError}
                </p>
              </div>
            )}

            <DialogFooter>
              {/* Show retry error message */}
              {retryError && (
                <div className='p-3 w-full rounded-md bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200 mb-3'>
                  <p className='flex items-center'>
                    <AlertCircle className='h-4 w-4 mr-2' />
                    {retryError}
                  </p>
                </div>
              )}

              {/* If this is a retry for a specific submission */}
              {displayedResults.some(
                (s) => s.url === submissionForm.url && s.status === 'failed'
              ) ? (
                successfulRetryId ? (
                  <div className='flex flex-col w-full'>
                    <div className='p-3 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300 rounded-md mb-3 flex items-center'>
                      <Check className='h-5 w-5 mr-2' />
                      Analysis successful! Document is ready.
                    </div>
                    <div className='flex space-x-3'>
                      <Button
                        type='button'
                        variant='outline'
                        onClick={() => {
                          setCreateDialogOpen(false)
                          // Refresh the list after closing dialog
                          mutateList()
                        }}
                      >
                        Close
                      </Button>
                      <Button
                        type='button'
                        variant='default'
                        className='bg-green-600 hover:bg-green-700'
                        asChild
                      >
                        <Link href={`/analysis/${successfulRetryId}`}>
                          <FileText className='mr-2 h-4 w-4' />
                          View Analysis
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type='button'
                    onClick={() => {
                      const failedSubmission = displayedResults.find(
                        (s) =>
                          s.url === submissionForm.url && s.status === 'failed'
                      )
                      if (failedSubmission) {
                        handleRetrySubmission(
                          failedSubmission.id,
                          submissionForm.document_url
                        )
                      }
                    }}
                    disabled={isSubmitting || retryStatus === 'retrying'}
                    className={
                      retryStatus === 'error'
                        ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                        : ''
                    }
                  >
                    {retryStatus === 'retrying' ? (
                      <>
                        <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                        Retrying...
                      </>
                    ) : retryStatus === 'error' ? (
                      <>
                        <AlertCircle className='mr-2 h-4 w-4' />
                        Retry Failed
                      </>
                    ) : (
                      'Retry Analysis'
                    )}
                  </Button>
                )
              ) : (
                <Button type='submit' disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                      Submitting...
                    </>
                  ) : (
                    'Submit URL for Analysis'
                  )}
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  )
}
