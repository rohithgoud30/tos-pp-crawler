import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define which routes are public (don't require authentication)
const isPublicRoute = createRouteMatcher([
  '/',
  '/about',
  '/contact',
  '/faq',
  '/results(.*)',
  '/analysis/(.*)',
  '/auth/login(.*)',
  '/auth/register(.*)',
])

// Define admin-only routes
const isAdminRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth()

  // Check for admin access to dashboard
  if (
    isAdminRoute(req) &&
    ((await auth()).sessionClaims?.metadata as { role?: string })?.role !==
      'admin'
  ) {
    const url = new URL('/', req.url)
    return NextResponse.redirect(url)
  }

  // If user is not authenticated and tries to access a protected route
  if (!userId && !isPublicRoute(req)) {
    // Add any custom logic before redirecting
    return redirectToSignIn()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
