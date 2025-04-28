// API utilities for document search

// Types for document search
export interface DocumentSearchParams {
  search_text: string
  document_type?: 'tos' | 'pp'
  page?: number
  per_page?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface DocumentListParams {
  document_type?: 'tos' | 'pp'
  page?: number
  per_page?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface DocumentItem {
  id: string
  url: string
  document_type: 'tos' | 'pp'
  company_name: string
  logo_url: string
  views: number
  updated_at: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export interface WordFrequency {
  word: string
  count: number
  percentage: number
  percentage_display: string
}

export interface TextMiningMetrics {
  word_count: number
  avg_word_length: number
  sentence_count: number
  avg_sentence_length: number
  readability_score: number
  readability_interpretation: string
  unique_word_ratio: number
  capital_letter_freq: number
  punctuation_density: number
  question_frequency: number
  paragraph_count: number
  common_word_percentage: number
}

export interface DocumentSection {
  type: string
  data: Record<string, unknown>
}

export interface DocumentDetail extends DocumentItem {
  retrieved_url: string
  raw_text: string
  one_sentence_summary: string
  hundred_word_summary: string
  word_frequencies: WordFrequency[]
  text_mining_metrics: TextMiningMetrics
  sections?: DocumentSection[] // Keeping optional for backward compatibility
  created_at: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || ''

// Helper function for API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const headers = {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
    ...options.headers,
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      error.message || `API request failed with status ${response.status}`
    )
  }

  return response.json()
}

// Document Search API
export async function searchDocuments(
  params: DocumentSearchParams
): Promise<PaginatedResponse<DocumentItem>> {
  return apiRequest<PaginatedResponse<DocumentItem>>(
    '/api/v1/documents/search',
    {
      method: 'POST',
      body: JSON.stringify(params),
    }
  )
}

// Get all documents with optional filtering
export async function getDocuments(
  params: DocumentListParams = {}
): Promise<PaginatedResponse<DocumentItem>> {
  const queryParams = new URLSearchParams()

  if (params.document_type)
    queryParams.append('document_type', params.document_type)
  if (params.page) queryParams.append('page', params.page.toString())
  if (params.per_page)
    queryParams.append('per_page', params.per_page.toString())
  if (params.sort_by) queryParams.append('sort_by', params.sort_by)
  if (params.sort_order) queryParams.append('sort_order', params.sort_order)

  const queryString = queryParams.toString()
  const endpoint = `/api/v1/documents${queryString ? `?${queryString}` : ''}`

  return apiRequest<PaginatedResponse<DocumentItem>>(endpoint)
}

// Get document details by ID
export async function getDocumentById(
  id: string,
  options: { skipViewIncrement?: boolean; signal?: AbortSignal } = {}
): Promise<DocumentDetail> {
  const queryParams = new URLSearchParams()

  // Add skipViewIncrement parameter to prevent double-counting in React StrictMode
  if (options.skipViewIncrement) {
    queryParams.append('skip_view_increment', 'true')
  }

  const queryString = queryParams.toString()
  const endpoint = `/api/v1/documents/${id}${
    queryString ? `?${queryString}` : ''
  }`

  // Pass signal to the apiRequest
  return apiRequest<DocumentDetail>(endpoint, {
    signal: options.signal,
  })
}
