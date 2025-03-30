import HeroSection from '@/components/hero-section'
import { auth } from '@clerk/nextjs/server'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  try {
    // Optional auth check - only redirect admins to dashboard
    // This won't block public access as we're not redirecting if no user found
    const { userId } = await auth()

    // Only proceed with the check if a user is logged in
    if (userId) {
      const user = await currentUser()
      // If user is an admin, redirect to dashboard
      if (user?.publicMetadata?.role === 'admin') {
        redirect('/dashboard')
      }
    }
  } catch (error) {
    // If auth fails, just show the public home page
    console.error('Auth check error:', error)
  }

  // Always render the home page for non-admin users (logged in or not)
  return (
    <div className='min-h-screen flex flex-col bg-white dark:bg-black'>
      <main className='flex-1'>
        <HeroSection />
      </main>
    </div>
  )
}
