import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Check if we have a real publishable key
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
const hasValidKey =
  publishableKey &&
  publishableKey.startsWith('pk_') &&
  !publishableKey.includes('dummy')

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/test(.*)',
  '/about(.*)',
  '/contact(.*)',
  '/faq(.*)',
  '/results(.*)',
  '/auth/login(.*)',
  '/auth/signup(.*)',
  '/analysis(.*)',
  '/summerize(.*)',
])

// Define admin-only routes
const isAdminRoute = createRouteMatcher(['/admin(.*)', '/dashboard/admin(.*)'])

// Create a pass-through middleware for when Clerk is not configured
const passThroughMiddleware = () => {
  return NextResponse.next()
}

// Only use Clerk middleware if we have a valid key
const middleware = hasValidKey
  ? clerkMiddleware(async (auth, req) => {
      const { userId } = await auth()

      // Check for admin routes
      if (isAdminRoute(req)) {
        // Get session claims and check for admin role
        const session = await auth()
        const role = (session.sessionClaims?.metadata as { role?: string })
          ?.role

        if (role !== 'admin') {
          const homeUrl = new URL('/', req.url)
          return NextResponse.redirect(homeUrl)
        }
      }

      // Allow access to public routes
      if (isPublicRoute(req)) {
        return NextResponse.next()
      }

      // For all other protected routes, check authentication
      if (!userId) {
        const signInUrl = new URL('/auth/login', req.url)
        signInUrl.searchParams.set('redirect_url', req.url)
        return NextResponse.redirect(signInUrl)
      }

      return NextResponse.next()
    })
  : passThroughMiddleware

export default middleware

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
