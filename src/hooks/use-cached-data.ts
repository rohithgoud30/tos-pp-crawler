'use client'

import useSWR, { SWRConfiguration, mutate } from 'swr'
import { useCallback } from 'react'
import {
  getDocumentById,
  searchDocuments,
  getDocuments,
  DocumentItem,
  DocumentListParams,
  DocumentDetail,
  DocumentSearchParams,
  getSubmissions,
  searchSubmissions,
  SubmissionListParams,
  SubmissionSearchParams,
  SubmissionItem,
} from '@/lib/api'

// Define the keys for different types of requests
export const CACHE_KEYS = {
  document: (id: string) => `document/${id}`,
  documentSearch: (params: string) => `search/${params}`,
  documentList: (params: string) => `documents/${params}`,
}

/**
 * Convert object params to a consistent string for cache keys
 */
function paramsToString(params: unknown): string {
  return JSON.stringify(params || {})
}

/**
 * Hook for fetching document details with caching
 */
export function useDocumentDetail(
  id: string | null | undefined,
  options: {
    skipViewIncrement?: boolean
    revalidateOnFocus?: boolean
    revalidateOnMount?: boolean
    dedupingInterval?: number
  } = {}
) {
  const swrOptions: SWRConfiguration = {
    revalidateOnFocus: options.revalidateOnFocus ?? false,
    revalidateOnMount: options.revalidateOnMount ?? true,
    dedupingInterval: options.dedupingInterval ?? 5 * 60 * 1000, // 5 minutes
  }

  // Don't fetch if id is not provided
  const shouldFetch = !!id

  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate: refetch,
  } = useSWR(
    shouldFetch ? CACHE_KEYS.document(id as string) : null,
    () =>
      id
        ? getDocumentById(id, { skipViewIncrement: options.skipViewIncrement })
        : null,
    swrOptions
  )

  // Helper to invalidate this cache
  const invalidateCache = useCallback(() => {
    if (id) {
      mutate(CACHE_KEYS.document(id))
    }
  }, [id])

  return {
    document: data,
    isLoading,
    isValidating,
    error,
    refetch,
    invalidateCache,
  }
}

/**
 * Hook for document search with caching
 */
export function useDocumentSearch(
  params: DocumentSearchParams | null,
  options: {
    revalidateOnFocus?: boolean
    revalidateOnMount?: boolean
    dedupingInterval?: number
  } = {}
) {
  const swrOptions: SWRConfiguration = {
    revalidateOnFocus: options.revalidateOnFocus ?? false,
    revalidateOnMount: options.revalidateOnMount ?? true,
    dedupingInterval: options.dedupingInterval ?? 5 * 60 * 1000, // 5 minutes
  }

  const paramsKey = params ? paramsToString(params) : ''
  const shouldFetch = !!params && !!params.search_text?.trim()

  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate: refetch,
  } = useSWR(
    shouldFetch ? CACHE_KEYS.documentSearch(paramsKey) : null,
    () => (params ? searchDocuments(params) : null),
    swrOptions
  )

  // Helper to invalidate this search cache
  const invalidateCache = useCallback(() => {
    if (params) {
      mutate(CACHE_KEYS.documentSearch(paramsToString(params)))
    }
  }, [params])

  // Helper to invalidate all search caches
  const invalidateAllSearches = useCallback(() => {
    mutate((key) => typeof key === 'string' && key.startsWith('search/'))
  }, [])

  return {
    results: data,
    isLoading,
    isValidating,
    error,
    refetch,
    invalidateCache,
    invalidateAllSearches,
  }
}

/**
 * Hook for document listing with caching
 */
export function useDocumentList(
  params: DocumentListParams = {},
  options: {
    revalidateOnFocus?: boolean
    revalidateOnMount?: boolean
    dedupingInterval?: number
  } = {}
) {
  const swrOptions: SWRConfiguration = {
    revalidateOnFocus: options.revalidateOnFocus ?? false,
    revalidateOnMount: options.revalidateOnMount ?? true,
    dedupingInterval: options.dedupingInterval ?? 5 * 60 * 1000, // 5 minutes
  }

  const paramsKey = paramsToString(params)

  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate: refetch,
  } = useSWR(
    CACHE_KEYS.documentList(paramsKey),
    () => getDocuments(params),
    swrOptions
  )

  // Helper to invalidate this specific list cache
  const invalidateCache = useCallback(() => {
    mutate(CACHE_KEYS.documentList(paramsKey))
  }, [paramsKey])

  // Helper to invalidate all document list caches
  const invalidateAllLists = useCallback(() => {
    mutate((key) => typeof key === 'string' && key.startsWith('documents/'))
  }, [])

  return {
    documents: data,
    isLoading,
    isValidating,
    error,
    refetch,
    invalidateCache,
    invalidateAllLists,
  }
}

/**
 * Pre-populate the cache with data we already have
 * Useful when navigating from a list to a detail view
 */
export function prefetchDocumentDetail(document: DocumentDetail) {
  mutate(CACHE_KEYS.document(document.id), document, false) // false = no revalidation
}

export function prefetchFromDocumentList(
  documents: DocumentItem[] | undefined
) {
  if (!documents) return

  // Pre-fetch document IDs into cache for faster navigation
  documents.forEach((doc) => {
    // Seed the cache with list data and trigger revalidation to fetch full detail
    mutate(CACHE_KEYS.document(doc.id), doc, true)
  })
}

/**
 * Global utility to clear all caches
 */
export function clearAllCaches() {
  mutate(() => true) // Match all keys
}

// For submissions list
export function useSubmissionsList(
  params: SubmissionListParams | null,
  options: SWRConfiguration = {}
) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    params ? ['/api/submissions', params] : null,
    async () => {
      if (!params) return null
      return getSubmissions(params)
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000, // 10 seconds
      ...options,
    }
  )

  return {
    submissions: data,
    error,
    isLoading,
    isValidating,
    mutate,
  }
}

// For submission search
export function useSubmissionSearch(
  params: SubmissionSearchParams | null,
  options: SWRConfiguration = {}
) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    params ? ['/api/submissions/search', params] : null,
    async () => {
      if (!params) return null
      return searchSubmissions(params)
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000, // 10 seconds
      ...options,
    }
  )

  return {
    results: data,
    error,
    isLoading,
    isValidating,
    mutate,
  }
}
