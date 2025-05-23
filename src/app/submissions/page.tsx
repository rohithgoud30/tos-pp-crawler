'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Search,
  ArrowUpDown,
  Globe,
  Clock,
  FileText,
  AlertCircle,
  Plus,
  RefreshCw,
  Check,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { useToast } from '@/components/ui/use-toast'
import {
  type SubmissionCreateParams,
  createSubmission,
  type SubmissionSearchParams,
  type SubmissionRetryParams,
  retrySubmission,
  adminSearchAllSubmissions,
  type AdminSearchSubmissionsParams,
  searchSubmissions,
} from '@/lib/api'
import { useSubmissionSearch } from '@/hooks/use-cached-data'
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
  error_message?: string | null
}

interface PaginatedSubmissionResponse {
  items: SubmissionItem[]
  total: number
  page: number
  size: number
  pages: number
  error_status?: boolean
  error_message?: string
}

// Helper function to normalize URLs and extract domains
const normalizeUrl = (
  url: string
): { normalizedUrl: string; domain: string } => {
  let normalizedUrl = url.toLowerCase().trim()
  if (!normalizedUrl.startsWith('http')) {
    normalizedUrl = 'https://' + normalizedUrl
  }

  try {
    // Try to extract domain - will throw if URL is invalid
    const urlObj = new URL(normalizedUrl)
    const domain = urlObj.hostname.replace('www.', '')
    return { normalizedUrl, domain }
  } catch (error) {
    // Log the error for debugging
    console.warn('URL parsing failed:', error)

    // If URL parsing fails, just return the original with a basic domain extraction
    const domain = normalizedUrl
      .replace('https://', '')
      .replace('http://', '')
      .replace('www.', '')
      .split('/')[0]
    return { normalizedUrl, domain }
  }
}

// Check for existing documents with similar domain
const checkExistingDocument = async (
  url: string,
  documentType: 'tos' | 'pp',
  userEmail: string
): Promise<{ exists: boolean; documentId?: string }> => {
  if (!url || !documentType || !userEmail) {
    return { exists: false }
  }

  try {
    const { domain } = normalizeUrl(url)

    // Search for existing documents with similar domain using the search API
    const searchParams: SubmissionSearchParams = {
      query: domain,
      user_email: userEmail,
      document_type: documentType,
      status: 'success',
      page: 1,
      size: 5,
    }

    const results = await searchSubmissions(searchParams)

    if (results.items && results.items.length > 0) {
      // Filter for exact domain matches to avoid false positives
      const exactMatches = results.items.filter((item) => {
        // Check if the item has a URL and normalize it
        if (item.url) {
          const itemDomain = normalizeUrl(item.url).domain
          return itemDomain === domain || item.url.includes(domain)
        }
        return false
      })

      if (exactMatches.length > 0 && exactMatches[0].document_id) {
        return {
          exists: true,
          documentId: exactMatches[0].document_id,
        }
      }
    }

    return { exists: false }
  } catch (error) {
    console.error('Error checking for existing document:', error)
    return { exists: false }
  }
}

export default function SubmissionsPage() {
  const { toast } = useToast()
  const urlParams = useSearchParams()
  const router = useRouter()
  const { user, isLoaded, isSignedIn } = useUser()
  const isAdmin = isSignedIn && user?.publicMetadata?.role === 'admin'
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSearchQuery, setActiveSearchQuery] = useState('')
  const [adminUserEmail, setAdminUserEmail] = useState('')
  const [documentTypeFilter, setDocumentTypeFilter] = useState<
    'tos' | 'pp' | undefined
  >(undefined)
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  )
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [resultsPerPage, setResultsPerPage] = useState(6)
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
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false)
  const [duplicateFound, setDuplicateFound] = useState<{
    exists: boolean
    documentId?: string
  }>({ exists: false })

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

  // Ensure default results per page for admins
  useEffect(() => {
    if (isAdmin) {
      setResultsPerPage(6)
    }
  }, [isAdmin])

  // Debug admin role detection
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      console.log('User auth info:', {
        isSignedIn,
        publicMetadata: user?.publicMetadata,
        isAdmin,
      })
    }
  }, [isLoaded, isSignedIn, user, isAdmin])

  // For regular users, create params that include currentPage
  const hookSearchParams =
    !isAdmin && submissionForm.user_email
      ? ({
          query: activeSearchQuery, // Use active search query (empty string returns all)
          user_email: submissionForm.user_email,
          size: resultsPerPage,
          page: currentPage,
          sort_order: sortOrder,
          document_type: documentTypeFilter,
          status: statusFilter,
        } as SubmissionSearchParams)
      : null

  // Fetch submissions (use search endpoint for both listing and search)
  const {
    results: searchResults,
    isLoading: isSearchLoading,
    error: searchFetchError,
    mutate: mutateSearch,
  } = useSubmissionSearch(hookSearchParams, {
    revalidateOnMount: !isAdmin,
    revalidateIfStale: true,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  }) as {
    results: PaginatedSubmissionResponse | null
    isLoading: boolean
    error: Error | null
    mutate: () => void
  }

  // Handle admin search using unified search-submissions endpoint
  const handleAdminSearch = async (page?: number) => {
    if (!isAdmin) return
    setIsAdminSearching(true)
    setAdminSearchError(null)
    try {
      // Build search parameters for admin search
      const params: AdminSearchSubmissionsParams = {
        role: 'admin',
        page: page || currentPage,
        size: resultsPerPage,
        sort_order: sortOrder,
      }

      // Only add parameters that have values
      params.query = searchQuery.trim() || '' // Always set query (empty string if blank)
      if (adminUserEmail.trim()) params.user_email = adminUserEmail.trim()
      if (documentTypeFilter) params.document_type = documentTypeFilter
      // Always set status parameter even if undefined to ensure filtering works consistently
      params.status = statusFilter?.toLowerCase()

      console.log('Calling adminSearchAllSubmissions with params:', params)
      const results = await adminSearchAllSubmissions(params)
      console.log('Admin search completed successfully:', results)
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

    // Always reset to page 1 first when searching
    setCurrentPage(1)

    if (isAdmin) {
      // Use admin search instead - with delay to ensure page state is updated
      setTimeout(() => handleAdminSearch(), 0)
    } else {
      // Regular search behavior
      setActiveSearchQuery(searchQuery)
    }
  }

  // Determine which results to display (use search for non-admin always)
  const resultsPagination =
    isAdmin && adminSearchResults
      ? adminSearchResults
      : !isAdmin
      ? searchResults
      : null

  const displayedResults = resultsPagination?.items || []
  const isLoading = isAdmin ? isAdminSearching : isSearchLoading
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
  }, [adminSearchError, searchFetchError, resultsPagination])

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
      setStatusFilter(statusParam.toLowerCase())
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

  // Auto-trigger admin search when in admin mode
  useEffect(() => {
    if (isAdmin) {
      handleAdminSearch()
    }
  }, [isAdmin])

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

    // Reset states
    setIsSubmitting(true)
    setSubmitError(null)
    setDuplicateFound({ exists: false })

    try {
      // Validate required fields
      if (!submissionForm.url) {
        throw new Error('URL is required')
      }
      if (!submissionForm.user_email) {
        throw new Error('User is not authenticated. Please log in.')
      }

      // Check for duplicate documents before submitting
      setIsCheckingDuplicate(true)
      const checkResult = await checkExistingDocument(
        submissionForm.url,
        submissionForm.document_type,
        submissionForm.user_email
      )
      setIsCheckingDuplicate(false)

      if (checkResult.exists && checkResult.documentId) {
        setDuplicateFound(checkResult)

        // Show notification about duplicate
        toast({
          title: 'Potential Duplicate Found',
          description: 'This URL appears to already exist in the database.',
          variant: 'default',
        })

        // Ask user if they want to proceed
        const shouldProceed = window.confirm(
          'This URL appears to already exist in our database. Would you like to continue with the submission anyway?'
        )

        if (!shouldProceed) {
          // User chose not to proceed - redirect to existing document
          router.push(`/analysis/${checkResult.documentId}`)
          setIsSubmitting(false)
          setCreateDialogOpen(false)
          return
        }
        // If user chooses to proceed, continue with normal submission
      }

      const response = await createSubmission(submissionForm)

      // Handle duplicate from API response
      if (
        response.status === 'success' &&
        response.document_id &&
        response.error_message?.includes('Document already exists')
      ) {
        // Close the dialog if it's open
        setCreateDialogOpen(false)

        // Show notification that document already exists
        toast({
          title: 'Document Already Exists',
          description: 'Redirecting to the existing document analysis.',
        })

        // Redirect to the existing document analysis page
        router.push(`/analysis/${response.document_id}`)
        return
      }

      // Regular case - reset form except for email
      setSubmissionForm((prev) => ({
        url: '',
        document_type: 'tos',
        document_url: '',
        user_email: prev.user_email,
      }))

      // Refresh the submissions list
      mutateSearch()

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

  // Handle document type filter change
  const handleDocumentTypeChange = (value: string) => {
    setDocumentTypeFilter(value === 'all' ? undefined : (value as 'tos' | 'pp'))
    // Always reset page to 1 when changing filters
    setCurrentPage(1)
    // For admin mode, trigger admin search
    if (isAdmin) {
      setTimeout(() => handleAdminSearch(1), 0)
    }
    // Non-admin will auto-trigger via useEffect
  }

  // Handle status filter change
  const handleStatusChange = (value: string) => {
    setStatusFilter(value === 'all' ? undefined : value.toLowerCase())
    // Always reset page to 1 when changing filters
    setCurrentPage(1)
    // For admin mode, trigger admin search
    if (isAdmin) {
      setTimeout(() => handleAdminSearch(1), 0)
    }
    // Non-admin will auto-trigger via useEffect
  }

  // Handle sort order change
  const handleSortOrderChange = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    // Always reset page to 1 when changing filters
    setCurrentPage(1)
    // For admin mode, trigger admin search
    if (isAdmin) {
      setTimeout(() => handleAdminSearch(1), 0)
    }
    // Non-admin will auto-trigger via useEffect
  }

  // Handle results per page change
  const handleResultsPerPageChange = (value: string) => {
    setResultsPerPage(parseInt(value, 10))
    // Always reset page to 1 when changing filters
    setCurrentPage(1)
    // For admin mode, trigger admin search
    if (isAdmin) {
      setTimeout(() => handleAdminSearch(1), 0)
    }
    // Non-admin will auto-trigger via useEffect
  }

  // Auto-trigger search on filter changes for non-admin users
  useEffect(() => {
    if (!isAdmin && submissionForm.user_email) {
      // Always reset to page 1 when filter parameters change
      setCurrentPage(1)
      // Always refresh search results (empty query will fetch all)
      mutateSearch()
    }
  }, [
    documentTypeFilter,
    statusFilter,
    sortOrder,
    resultsPerPage,
    submissionForm.user_email,
    mutateSearch,
  ])

  // Go to specific page and trigger admin search if in admin mode
  const goToPage = (page: number) => {
    setCurrentPage(page)
    if (isAdmin) {
      handleAdminSearch(page)
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
  const getStatusBadge = (status: string, error_message?: string | null) => {
    // Normalize status to lowercase for comparison
    const normalizedStatus = status.toLowerCase()

    // If it's a duplicate document (success with document_id and error_message about duplication)
    if (
      normalizedStatus === 'success' &&
      error_message &&
      error_message.includes('Document already exists')
    ) {
      return <Badge className='bg-amber-500'>Duplicate</Badge>
    }

    // Regular status cases
    switch (normalizedStatus) {
      case 'success':
        return <Badge className='bg-green-500'>Success</Badge>
      case 'failed':
        return <Badge variant='destructive'>Failed</Badge>
      case 'processing':
        return <Badge className='bg-blue-500'>Processing</Badge>
      case 'initialized':
        return <Badge variant='outline'>Initialized</Badge>
      default:
        return <Badge variant='secondary'>{status}</Badge>
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
      // Get the submission from the displayed results
      const submission = displayedResults.find((s) => s.id === submissionId)

      if (submission) {
        // First check for duplicates
        setIsCheckingDuplicate(true)
        const checkResult = await checkExistingDocument(
          submission.url,
          submission.document_type,
          submissionForm.user_email
        )
        setIsCheckingDuplicate(false)

        if (checkResult.exists && checkResult.documentId) {
          // Show notification about duplicate
          toast({
            title: 'Duplicate Document Found',
            description:
              'This URL already exists in our database. Redirecting to the existing document.',
          })

          // Close dialog if open
          setCreateDialogOpen(false)

          // Set retry status to success
          setRetryStatus('success')

          // Store document ID for use in View button
          setSuccessfulRetryId(checkResult.documentId)

          // Redirect to the existing document analysis page after a short delay
          setTimeout(() => {
            router.push(`/analysis/${checkResult.documentId}`)
          }, 1500) // 1.5 second delay
          return
        }
      }

      const retryParams: SubmissionRetryParams = {
        document_url: document_url || '',
        user_email: submissionForm.user_email,
      }

      const result = await retrySubmission(submissionId, retryParams)

      // Debug response
      console.log('Retry submission response:', result)

      // Check if this is a duplicate document case
      if (
        result.status === 'success' &&
        result.document_id &&
        result.error_message?.includes('Document already exists')
      ) {
        // Show notification that document already exists
        toast({
          title: 'Document Already Exists',
          description: 'Redirecting to the existing document analysis.',
        })

        // Close dialog if open
        setCreateDialogOpen(false)

        // Set retry status to success
        setRetryStatus('success')

        // Redirect to the existing document analysis page after a short delay
        setTimeout(() => {
          router.push(`/analysis/${result.document_id}`)
        }, 1500) // 1.5 second delay
        return
      }

      // Set success status
      setRetryStatus('success')

      // Show success notification
      toast({
        title: 'Retry Successful',
        description:
          result.status === 'success' && result.document_id
            ? 'Analysis complete. Redirecting to results.'
            : `Status updated to: ${result.status}`,
      })

      // Refresh the submissions list
      mutateSearch()

      // If successful and has document_id, store it for the View button
      if (result.status === 'success' && result.document_id) {
        setSuccessfulRetryId(result.document_id)
        // Redirect to analysis page after a short delay to show the status change
        setTimeout(() => {
          router.push(`/analysis/${result.document_id}`)
        }, 1500) // 1.5 second delay
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
    }
  }

  // Initialize the page only on first load, don't override manual selections
  useEffect(() => {
    if (resultsPagination?.page && !activeSearchQuery && currentPage === 1) {
      // Only update if we're on the initial page and not in search mode
      setCurrentPage(resultsPagination.page)
    }
  }, [resultsPagination?.page, currentPage, activeSearchQuery])

  // Reset page when search parameters change
  useEffect(() => {
    // Reset to page 1 when search parameters change
    setCurrentPage(1)
  }, [activeSearchQuery, documentTypeFilter, statusFilter, resultsPerPage])

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
              <div className='mt-2 mb-3'>
                <Label htmlFor='adminUserEmail' className='text-sm mb-1 block'>
                  Filter by User Email (optional)
                </Label>
                <Input
                  id='adminUserEmail'
                  type='email'
                  placeholder='Enter user email to filter...'
                  value={adminUserEmail}
                  onChange={(e) => setAdminUserEmail(e.target.value)}
                  className='w-full'
                />
              </div>
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
                <SelectItem value='6'>6 / page</SelectItem>
                <SelectItem value='9'>9 / page</SelectItem>
                <SelectItem value='12'>12 / page</SelectItem>
                <SelectItem value='15'>15 / page</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
                  mutateSearch()
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
                {isAdmin && <TableHead>User</TableHead>}
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
                      {isAdmin && (
                        <TableCell>
                          <Skeleton className='h-6 w-32' />
                        </TableCell>
                      )}
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
                          {submission.document_type === 'tos' ? 'ToS' : 'PP'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(
                          submission.status,
                          submission.error_message
                        )}
                      </TableCell>
                      {isAdmin && (
                        <TableCell className='max-w-[150px] truncate'>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger className='flex items-center text-left'>
                                <span className='truncate text-sm text-muted-foreground'>
                                  {submission.user_email}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className='text-xs'>
                                  <span className='font-semibold'>Email:</span>{' '}
                                  {submission.user_email}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      )}
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
                          {/* Single action button with different states */}
                          {/* Case 1: Success with document_id - Show View button */}
                          {submission.status.toLowerCase() === 'success' ? (
                            <Button
                              variant='default'
                              size='sm'
                              onClick={() => {
                                router.push(
                                  `/analysis/${submission.document_id}`
                                )
                              }}
                            >
                              <FileText className='mr-1 h-4 w-4' />
                              View
                            </Button>
                          ) : /* Case 2: Failed status - Show Retry button */
                          submission.status.toLowerCase() === 'failed' ? (
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => {
                                // Direct retry if we have document_url
                                if (submission.document_url) {
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
                          ) : (
                            /* Case 3: Other statuses - Show disabled button */
                            <Button variant='outline' size='sm' disabled={true}>
                              {submission.status.toLowerCase() ===
                              'processing' ? (
                                <>
                                  <RefreshCw className='mr-1 h-4 w-4 animate-spin' />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <Clock className='mr-1 h-4 w-4' />
                                  Pending
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                : isEmpty &&
                  !hasError && (
                    <TableRow>
                      <TableCell
                        colSpan={isAdmin ? 6 : 5}
                        className='text-center py-8'
                      >
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
                  <TableCell
                    colSpan={isAdmin ? 6 : 5}
                    className='text-center py-8'
                  >
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
                            mutateSearch()
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
        {resultsPagination && resultsPagination.pages > 1 && (
          <div className='flex flex-wrap justify-center gap-2 items-center mt-6 px-4'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => goToPage(Math.max(1, resultsPagination.page - 1))}
              disabled={resultsPagination.page <= 1}
              className='px-2 h-9 min-w-9'
            >
              &lt;
            </Button>

            {/* Generate page numbers with ellipsis for large ranges */}
            {Array.from({ length: resultsPagination.pages }).map((_, i) => {
              const pageNum = i + 1
              // Handle mobile view by showing fewer pages on small screens
              const isVisible =
                pageNum === 1 ||
                pageNum === resultsPagination.pages ||
                (pageNum >= resultsPagination.page - 1 &&
                  pageNum <= resultsPagination.page + 1)

              // Show ellipsis instead of consecutive numbers
              const showPrevEllipsis =
                pageNum === resultsPagination.page - 1 && pageNum > 2
              const showNextEllipsis =
                pageNum === resultsPagination.page + 1 &&
                pageNum < resultsPagination.pages - 1

              if (!isVisible && !showPrevEllipsis && !showNextEllipsis)
                return null

              if (showPrevEllipsis) {
                return (
                  <div
                    key={`ellipsis-prev-${pageNum}`}
                    className='flex space-x-1 items-center'
                  >
                    <span className='mx-1 text-muted-foreground'>•••</span>
                    <Button
                      key={pageNum}
                      variant={
                        pageNum === resultsPagination.page
                          ? 'default'
                          : 'outline'
                      }
                      size='sm'
                      className='w-9 h-9 p-0 font-medium'
                      onClick={() => goToPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  </div>
                )
              }

              if (showNextEllipsis) {
                return (
                  <div
                    key={`ellipsis-next-${pageNum}`}
                    className='flex space-x-1 items-center'
                  >
                    <Button
                      key={pageNum}
                      variant={
                        pageNum === resultsPagination.page
                          ? 'default'
                          : 'outline'
                      }
                      size='sm'
                      className='w-9 h-9 p-0 font-medium'
                      onClick={() => goToPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                    <span className='mx-1 text-muted-foreground'>•••</span>
                  </div>
                )
              }

              return (
                <Button
                  key={pageNum}
                  variant={
                    pageNum === resultsPagination.page ? 'default' : 'outline'
                  }
                  size='sm'
                  className='w-9 h-9 p-0 font-medium'
                  onClick={() => goToPage(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            })}

            <Button
              variant='outline'
              size='sm'
              onClick={() =>
                goToPage(
                  Math.min(resultsPagination.pages, resultsPagination.page + 1)
                )
              }
              disabled={resultsPagination.page >= resultsPagination.pages}
              className='px-2 h-9 min-w-9'
            >
              &gt;
            </Button>
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
                readOnly={displayedResults.some(
                  (s) => s.url === submissionForm.url && s.status === 'failed'
                )}
                className={
                  displayedResults.some(
                    (s) => s.url === submissionForm.url && s.status === 'failed'
                  )
                    ? 'bg-muted cursor-not-allowed'
                    : ''
                }
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
                  !displayedResults.some(
                    (s) => s.url === submissionForm.url && s.status === 'failed'
                  ) &&
                  setSubmissionForm((prev) => ({
                    ...prev,
                    document_type: value as 'tos' | 'pp',
                  }))
                }
                disabled={displayedResults.some(
                  (s) => s.url === submissionForm.url && s.status === 'failed'
                )}
              >
                <SelectTrigger
                  className={
                    displayedResults.some(
                      (s) =>
                        s.url === submissionForm.url && s.status === 'failed'
                    )
                      ? 'bg-muted cursor-not-allowed'
                      : ''
                  }
                >
                  <SelectValue placeholder='Select document type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='tos'>Terms of Service</SelectItem>
                  <SelectItem value='pp'>Privacy Policy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Display warning if duplicate is found */}
            {duplicateFound.exists && duplicateFound.documentId && (
              <div className='p-3 rounded-md bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300 flex items-start'>
                <Info className='h-5 w-5 mr-2 flex-shrink-0 mt-0.5' />
                <div>
                  <p className='font-medium'>Potential Duplicate Found</p>
                  <p className='text-sm mt-1'>
                    This URL appears to already exist in our database.
                  </p>
                  <Button
                    type='button'
                    variant='link'
                    className='text-sm p-0 h-auto mt-1 text-amber-800 dark:text-amber-300 underline'
                    onClick={() => {
                      router.push(`/analysis/${duplicateFound.documentId}`)
                      setCreateDialogOpen(false)
                    }}
                  >
                    View existing document
                  </Button>
                </div>
              </div>
            )}

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
                          mutateSearch()
                        }}
                      >
                        Close
                      </Button>
                      <Button
                        type='button'
                        variant='default'
                        className='bg-green-600 hover:bg-green-700'
                        onClick={() =>
                          router.push(`/analysis/${successfulRetryId}`)
                        }
                      >
                        <FileText className='mr-2 h-4 w-4' />
                        View Analysis
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
                    disabled={isSubmitting || isCheckingDuplicate}
                    className={
                      isSubmitting
                        ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                        : ''
                    }
                  >
                    {isSubmitting || isCheckingDuplicate ? (
                      <>
                        <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                        {isCheckingDuplicate ? 'Checking...' : 'Submitting...'}
                      </>
                    ) : (
                      'Retry Analysis'
                    )}
                  </Button>
                )
              ) : (
                <Button
                  type='submit'
                  disabled={isSubmitting || isCheckingDuplicate}
                >
                  {isSubmitting || isCheckingDuplicate ? (
                    <>
                      <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                      {isCheckingDuplicate ? 'Checking...' : 'Submitting...'}
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
