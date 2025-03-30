'use client'

import {
  SignInButton,
  SignUpButton,
  UserButton,
  SignedIn,
  SignedOut,
} from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

export default function ClerkTestPage() {
  return (
    <div className='container mx-auto py-20'>
      <h1 className='text-3xl font-bold mb-8 text-center'>
        Clerk Authentication Test Page
      </h1>

      <div className='max-w-md mx-auto border border-gray-200 rounded-lg p-8 shadow-md'>
        <h2 className='text-xl font-semibold mb-6'>Authentication Status:</h2>

        <div className='space-y-4'>
          <SignedIn>
            <div className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4'>
              <strong>Signed In!</strong> You are currently authenticated.
            </div>

            <div className='flex items-center gap-2'>
              <span>Your user profile:</span>
              <UserButton afterSignOutUrl='/' />
            </div>
          </SignedIn>

          <SignedOut>
            <div className='bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4'>
              <strong>Signed Out!</strong> You are not authenticated.
            </div>

            <div className='flex flex-col gap-4 mt-6'>
              <SignInButton mode='modal'>
                <Button className='w-full'>Sign In</Button>
              </SignInButton>

              <SignUpButton mode='modal'>
                <Button variant='outline' className='w-full'>
                  Sign Up
                </Button>
              </SignUpButton>
            </div>
          </SignedOut>
        </div>
      </div>
    </div>
  )
}
