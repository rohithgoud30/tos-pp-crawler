'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { useNavigation } from '@/context/navigation-context'

type BreadcrumbItem = {
  label: string
  href?: string
  isCurrentPage?: boolean
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const { lastSearchState } = useNavigation()

  // Construct search results URL if needed
  const getSearchResultsUrl = () => {
    if (!lastSearchState) return '/results'

    const searchParams = new URLSearchParams()

    if (lastSearchState.query) {
      searchParams.set('q', lastSearchState.query)
    }
    if (lastSearchState.documentType) {
      searchParams.set('type', lastSearchState.documentType)
    }
    searchParams.set('sort', lastSearchState.sortOption)
    searchParams.set('order', lastSearchState.sortOrder)
    searchParams.set('perPage', lastSearchState.perPage.toString())
    if (lastSearchState.page > 1) {
      searchParams.set('page', lastSearchState.page.toString())
    }

    return `/results?${searchParams.toString()}`
  }

  return (
    <nav aria-label='Breadcrumb' className='flex items-center text-sm mb-4'>
      {items
        .map((item, index) => {
          // Special case for "Search Results" to use the saved state
          const href =
            item.label === 'Search Results' && lastSearchState
              ? getSearchResultsUrl()
              : item.href || '#'

          const isLast = index === items.length - 1

          // Create an array of elements for this breadcrumb item
          const elements = []

          // Add separator for all but first item
          if (index > 0) {
            elements.push(
              <ChevronRight
                key={`sep-${index}`}
                className='h-4 w-4 mx-2 text-gray-500 dark:text-gray-400'
              />
            )
          }

          // Add the breadcrumb link or text
          if (item.isCurrentPage || isLast) {
            elements.push(
              <span
                key={`item-${index}`}
                className='text-gray-900 dark:text-white font-medium'
              >
                {item.label}
              </span>
            )
          } else {
            elements.push(
              <Link
                key={`item-${index}`}
                href={href}
                className='text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              >
                {item.label}
              </Link>
            )
          }

          return elements
        })
        .flat()}
    </nav>
  )
}
