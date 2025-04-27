import { NextResponse } from 'next/server'

// Simple pass-through middleware until we properly set up Clerk
export default function middleware() {
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
