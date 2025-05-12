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
      <div className='grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 place-items-center md:place-items-stretch'>
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            className='overflow-hidden w-full max-w-[400px] md:max-w-none'
          >
            <CardHeader className='pb-0'>
              <div className='flex flex-col items-center mb-2'>
                <Skeleton className='h-16 w-16 rounded-md mb-3' />
                <Skeleton className='h-6 w-36 mb-2' />
              </div>
              <Skeleton className='h-4 w-48 mx-auto' />
            </CardHeader>
            <CardContent className='pb-2 pt-4'>
              <div className='flex justify-between items-center'>
                <div className='space-y-2'>
                  <Skeleton className='h-3 w-16' />
                  <Skeleton className='h-5 w-32' />
                </div>
                <div className='space-y-2'>
                  <Skeleton className='h-3 w-16 ml-auto' />
                  <Skeleton className='h-5 w-24 ml-auto' />
                </div>
              </div>
            </CardContent>
            <CardFooter className='pt-3'>
              <Skeleton className='h-10 w-full' />
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
      <div className='grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 place-items-center md:place-items-stretch'>
        {results.items.map((item) => (
          <Card
            key={item.id}
            className='group transition-all duration-200 hover:border-primary/30 dark:hover:border-primary/20 w-full max-w-[400px] md:max-w-none'
          >
            <div className='relative'>
              <CardHeader className='pb-0'>
                <div className='flex flex-col items-center text-center mb-2'>
                  {item.logo_url && (
                    <div className='w-16 h-16 mb-3 rounded-md overflow-hidden bg-white flex items-center justify-center p-1.5 border border-gray-100 shadow-sm'>
                      <img
                        src={item.logo_url}
                        alt={`${item.company_name} logo`}
                        className='max-w-full max-h-full object-contain'
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  <CardTitle className='text-xl group-hover:text-primary transition-colors'>
                    {item.company_name}
                  </CardTitle>
                </div>
                <p className='text-sm text-muted-foreground text-center truncate'>
                  {item.url}
                </p>
              </CardHeader>
              <CardContent className='pt-4'>
                <div className='flex justify-between items-center'>
                  <div>
                    <p className='text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1'>
                      Doc Type
                    </p>
                    <p className='capitalize font-medium text-sm'>
                      {item.document_type === 'tos'
                        ? 'Terms of Service'
                        : 'Privacy Policy'}
                    </p>
                  </div>
                  <div>
                    <p className='text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1 text-right'>
                      Updated
                    </p>
                    <p className='text-right font-medium text-sm'>
                      {new Date(item.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className='pt-3'>
                <Button
                  className='w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors'
                  variant='outline'
                  asChild
                >
                  <a href={`/analysis/${item.id}`}>
                    View Analysis
                    <ExternalLink className='h-4 w-4' />
                  </a>
                </Button>
              </CardFooter>
            </div>
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
