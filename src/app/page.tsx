import Link from 'next/link'
import { Button } from '@/components/ui/button'
import HeroSection from '@/components/hero-section'

export default function Home() {
  return (
    <div className='min-h-screen flex flex-col bg-white dark:bg-black'>
      <main className='flex-1'>
        <HeroSection />
      </main>

      <div className='flex justify-center pb-10'>
        <Link href='/clerk-test'>
          <Button className='bg-blue-600 hover:bg-blue-700 text-white'>
            Test Clerk Authentication
          </Button>
        </Link>
      </div>
    </div>
  )
}
