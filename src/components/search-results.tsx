'use client'

import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { DocumentItem, PaginatedResponse } from '@/lib/api'

type ResultState = 'empty' | 'loading' | 'results'

interface SearchResultsProps {
  state: ResultState
  results?: PaginatedResponse<DocumentItem>
  onLoadMore?: () => void
}

export function SearchResults({
  state,
  results,
  onLoadMore,
}: SearchResultsProps) {
  if (state === 'empty') {
    return (
      <div className='flex flex-col items-center justify-center py-12 text-center'>
        <p className='text-xl font-medium mb-2'>No results found</p>
        <p className='text-muted-foreground mb-6'>
          Try searching for a different company or URL
        </p>
      </div>
    )
  }

  if (state === 'loading') {
    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {[1, 2, 3].map((i) => (
          <Card key={i} className='overflow-hidden'>
            <CardHeader className='pb-2'>
              <Skeleton className='h-6 w-3/4 mb-2' />
              <Skeleton className='h-4 w-1/2' />
            </CardHeader>
            <CardContent className='pb-2'>
              <Skeleton className='h-4 w-full mb-2' />
              <Skeleton className='h-4 w-2/3' />
            </CardContent>
            <CardFooter>
              <Skeleton className='h-9 w-full' />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (!results || results.items.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12 text-center'>
        <p className='text-xl font-medium mb-2'>No results found</p>
        <p className='text-muted-foreground mb-6'>
          Try searching for a different company or URL
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {results.items.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className='flex items-center gap-3'>
                {item.logo_url && (
                  <img
                    src={item.logo_url}
                    alt={`${item.company_name} logo`}
                    className='w-8 h-8 object-contain'
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                )}
                <CardTitle className='text-xl'>{item.company_name}</CardTitle>
              </div>
              <p className='text-sm text-muted-foreground'>{item.url}</p>
            </CardHeader>
            <CardContent>
              <div className='flex justify-between items-center'>
                <div>
                  <p className='text-sm text-muted-foreground'>Document type</p>
                  <p className='capitalize'>
                    {item.document_type === 'tos'
                      ? 'Terms of Service'
                      : 'Privacy Policy'}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Last updated</p>
                  <p className='text-right'>
                    {new Date(item.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className='w-full gap-2' variant='outline' asChild>
                <a href={`/analysis/${item.id}`}>
                  View Analysis
                  <ExternalLink className='h-4 w-4' />
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {results.has_next && (
        <div className='flex justify-center mt-6'>
          <Button variant='outline' onClick={onLoadMore} className='px-8'>
            Load More
          </Button>
        </div>
      )}

      <div className='text-center text-sm text-muted-foreground mt-4'>
        Showing {results.items.length} of {results.total} results
      </div>
    </div>
  )
}
