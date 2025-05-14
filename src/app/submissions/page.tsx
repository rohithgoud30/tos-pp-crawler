'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { type SubmissionCreateParams, createSubmission } from '@/lib/api'
import {
  useSubmissionsList,
  useSubmissionSearch,
} from '@/hooks/use-cached-data'

export default function SubmissionsPage() {
  const urlParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('create')
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSearchQuery, setActiveSearchQuery] = useState('')
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

  // Load the user email from localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail') || ''
    setSubmissionForm((prev) => ({ ...prev, user_email: storedEmail }))
  }, [])

  // Build submission list parameters
  const submissionListParams = {
    user_email: submissionForm.user_email,
    page: currentPage,
    size: resultsPerPage,
    sort_order: sortOrder,
    search_url: activeSearchQuery || undefined,
  }

  // Build submission search parameters
  const submissionSearchParams = activeSearchQuery
    ? {
        query: activeSearchQuery,
        user_email: submissionForm.user_email,
        page: currentPage,
        size: resultsPerPage,
        sort_order: sortOrder,
        document_type: documentTypeFilter,
        status: statusFilter,
      }
    : null

  // Fetch submissions data
  const {
    submissions: listResults,
    isLoading: isListLoading,
    error: listFetchError,
    mutate: mutateList,
  } = useSubmissionsList(
    submissionForm.user_email ? submissionListParams : null,
    {
      revalidateOnMount: true,
    }
  )

  // Fetch search results
  const {
    results: searchResults,
    isLoading: isSearchLoading,
    error: searchFetchError,
    mutate: mutateSearch,
  } = useSubmissionSearch(
    activeSearchQuery && submissionForm.user_email
      ? submissionSearchParams
      : null,
    {
      revalidateOnMount: activeSearchQuery ? true : false,
    }
  )

  // Determine which results to display
  const resultsPagination = activeSearchQuery ? searchResults : listResults
  const displayedResults = resultsPagination?.items || []
  const isLoading = activeSearchQuery ? isSearchLoading : isListLoading

  // Handle errors from hooks
  useEffect(() => {
    if (searchFetchError) {
      setFetchError('Search failed. Please try again.')
    } else if (listFetchError) {
      setFetchError('Failed to load submissions. Please try again.')
    } else {
      setFetchError(null)
    }
  }, [searchFetchError, listFetchError])

  // Load URL parameters
  useEffect(() => {
    const tabParam = urlParams.get('tab')
    const queryParam = urlParams.get('q')
    const typeParam = urlParams.get('type') as 'tos' | 'pp' | undefined
    const statusParam = urlParams.get('status')
    const perPageParam = urlParams.get('perPage')
    const orderParam = urlParams.get('order') as 'asc' | 'desc' | undefined
    const pageParam = urlParams.get('page')

    if (tabParam && ['create', 'list'].includes(tabParam)) {
      setActiveTab(tabParam)
    }

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

    // Save the email to localStorage if it's the email field
    if (name === 'user_email') {
      localStorage.setItem('userEmail', value)
    }
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
        throw new Error('Email is required')
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
      setActiveTab('list')
    } catch (error) {
      console.error('Submission error:', error)
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to submit URL'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle search
  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    setActiveSearchQuery(searchQuery)
    setCurrentPage(1)
  }

  // Handle document type filter change
  const handleDocumentTypeChange = (value: string) => {
    setDocumentTypeFilter(value === 'all' ? undefined : (value as 'tos' | 'pp'))
    setCurrentPage(1)
  }

  // Handle status filter change
  const handleStatusChange = (value: string) => {
    setStatusFilter(value === 'all' ? undefined : value)
    setCurrentPage(1)
  }

  // Handle sort order change
  const handleSortOrderChange = () => {
    setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'))
    setCurrentPage(1)
  }

  // Handle results per page change
  const handleResultsPerPageChange = (value: string) => {
    setResultsPerPage(parseInt(value, 10))
    setCurrentPage(1)
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

  // Render submission form
  const renderSubmissionForm = () => {
    return (
      <div className='w-full max-w-3xl mx-auto p-4'>
        <Card>
          <CardHeader>
            <CardTitle>Submit URL for Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='user_email'>Email</Label>
                <Input
                  id='user_email'
                  name='user_email'
                  type='email'
                  required
                  placeholder='Your email address'
                  value={submissionForm.user_email}
                  onChange={handleInputChange}
                />
                <p className='text-sm text-muted-foreground'>
                  We&apos;ll use this to track your submissions
                </p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='url'>Website URL</Label>
                <Input
                  id='url'
                  name='url'
                  type='url'
                  required
                  placeholder='https://example.com'
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

              <div className='space-y-2'>
                <Label htmlFor='document_url'>Document URL (Optional)</Label>
                <Input
                  id='document_url'
                  name='document_url'
                  type='url'
                  placeholder='https://example.com/terms'
                  value={submissionForm.document_url || ''}
                  onChange={handleInputChange}
                />
                <p className='text-sm text-muted-foreground'>
                  If you know the exact URL of the document, enter it here
                </p>
              </div>

              {submitError && (
                <div className='p-3 rounded-md bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200'>
                  <p className='flex items-center'>
                    <AlertCircle className='h-4 w-4 mr-2' />
                    {submitError}
                  </p>
                </div>
              )}

              <Button type='submit' className='w-full' disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                    Submitting...
                  </>
                ) : (
                  'Submit URL for Analysis'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render table of submissions
  const renderSubmissionsTable = () => {
    return (
      <div className='w-full mx-auto p-4'>
        <div className='mb-4 flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0'>
          {/* Search bar */}
          <div className='flex w-full max-w-sm items-center space-x-2'>
            <form
              onSubmit={handleSearch}
              className='flex w-full max-w-sm space-x-2'
            >
              <Input
                type='search'
                placeholder='Search by URL...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full'
              />
              <Button type='submit' size='icon'>
                <Search className='h-4 w-4' />
              </Button>
            </form>
          </div>

          <div className='flex items-center space-x-2'>
            {/* Document type filter */}
            <Select
              value={documentTypeFilter || 'all'}
              onValueChange={handleDocumentTypeChange}
            >
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Document Type' />
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
              <SelectTrigger className='w-[180px]'>
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
            <Button
              variant='outline'
              size='icon'
              onClick={handleSortOrderChange}
              title={`Currently sorting by date ${
                sortOrder === 'desc' ? 'newest first' : 'oldest first'
              }`}
            >
              <ArrowUpDown className='h-4 w-4' />
            </Button>

            {/* New submission button */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className='flex items-center'>
                  <Plus className='mr-2 h-4 w-4' />
                  New
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Submit New URL</DialogTitle>
                  <DialogDescription>
                    Enter the details of the URL you want to analyze
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='dialog_url'>Website URL</Label>
                    <Input
                      id='dialog_url'
                      name='url'
                      type='url'
                      required
                      placeholder='https://example.com'
                      value={submissionForm.url}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='dialog_document_type'>Document Type</Label>
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

                  <div className='space-y-2'>
                    <Label htmlFor='dialog_document_url'>
                      Document URL (Optional)
                    </Label>
                    <Input
                      id='dialog_document_url'
                      name='document_url'
                      type='url'
                      placeholder='https://example.com/terms'
                      value={submissionForm.document_url || ''}
                      onChange={handleInputChange}
                    />
                    <p className='text-sm text-muted-foreground'>
                      If you know the exact URL of the document, enter it here
                    </p>
                  </div>

                  {submitError && (
                    <div className='p-3 rounded-md bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200'>
                      <p className='flex items-center'>
                        <AlertCircle className='h-4 w-4 mr-2' />
                        {submitError}
                      </p>
                    </div>
                  )}

                  <DialogFooter>
                    <Button
                      type='submit'
                      className='w-full'
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                          Submitting...
                        </>
                      ) : (
                        'Submit URL for Analysis'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {fetchError && (
          <div className='mb-4 p-3 rounded-md bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200'>
            <p className='flex items-center'>
              <AlertCircle className='h-4 w-4 mr-2' />
              {fetchError}
            </p>
          </div>
        )}

        {/* Email required notice */}
        {!submissionForm.user_email && (
          <div className='mb-4 p-3 rounded-md bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200'>
            <p className='flex items-center'>
              <AlertCircle className='h-4 w-4 mr-2' />
              Please enter your email to view your submissions.
            </p>
            <div className='mt-2 flex items-center space-x-2'>
              <Input
                type='email'
                placeholder='Your email address'
                name='user_email'
                value={submissionForm.user_email}
                onChange={handleInputChange}
                className='max-w-xs'
              />
              <Button
                variant='secondary'
                size='sm'
                onClick={() => mutateList()}
              >
                Load
              </Button>
            </div>
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
                          {submission.status === 'failed' && (
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => {
                                // Open retry dialog
                                setSubmissionForm((prev) => ({
                                  ...prev,
                                  url: submission.url,
                                  document_type: submission.document_type,
                                  document_url: '',
                                }))
                                setCreateDialogOpen(true)
                              }}
                            >
                              <RefreshCw className='mr-1 h-4 w-4' />
                              Retry
                            </Button>
                          )}
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
                : !isLoading && (
                    <TableRow>
                      <TableCell colSpan={5} className='text-center py-8'>
                        <div className='flex flex-col items-center justify-center text-muted-foreground'>
                          <FileText className='h-8 w-8 mb-2' />
                          <p>No submissions found</p>
                          <p className='text-sm'>
                            {activeSearchQuery
                              ? 'Try a different search term or clear filters'
                              : 'Submit a URL to get started'}
                          </p>
                          <Button
                            variant='outline'
                            className='mt-4'
                            onClick={() => setCreateDialogOpen(true)}
                          >
                            <Plus className='mr-2 h-4 w-4' />
                            Submit New URL
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination controls */}
        {resultsPagination && resultsPagination.total > 0 && (
          <div className='flex items-center justify-between mt-4'>
            <div className='flex items-center space-x-2'>
              <p className='text-sm text-muted-foreground'>
                Showing{' '}
                <span className='font-medium'>{displayedResults.length}</span>{' '}
                of{' '}
                <span className='font-medium'>{resultsPagination.total}</span>{' '}
                results
              </p>
              <Select
                value={resultsPerPage.toString()}
                onValueChange={handleResultsPerPageChange}
              >
                <SelectTrigger className='w-[70px]'>
                  <SelectValue placeholder={`${resultsPerPage}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='6'>6</SelectItem>
                  <SelectItem value='9'>9</SelectItem>
                  <SelectItem value='12'>12</SelectItem>
                  <SelectItem value='15'>15</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='flex items-center space-x-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setCurrentPage(currentPage - 1)}
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
                onClick={() => setCurrentPage(currentPage + 1)}
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
      <h1 className='text-3xl font-bold mb-6'>URL Submissions</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='w-full max-w-md mb-4'>
          <TabsTrigger value='create' className='flex-1'>
            Create Submission
          </TabsTrigger>
          <TabsTrigger value='list' className='flex-1'>
            My Submissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value='create'>{renderSubmissionForm()}</TabsContent>

        <TabsContent value='list'>{renderSubmissionsTable()}</TabsContent>
      </Tabs>
    </main>
  )
}
