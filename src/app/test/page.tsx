'use client'

import Link from 'next/link'

export default function TestPage() {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen p-8'>
      <h1 className='text-3xl font-bold mb-8'>Test Page</h1>

      <p className='mb-4'>
        This is a simple test page to verify routing is working.
      </p>

      <Link
        href='/'
        className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
      >
        Back to Home
      </Link>
    </div>
  )
}
