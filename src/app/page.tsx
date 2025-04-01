import Link from 'next/link'
import { Button } from '@/components/ui/button'
import HeroSection from '@/components/hero-section'

export default function Home() {
  return (
    <div className='min-h-screen flex flex-col bg-white dark:bg-black'>
      <HeroSection />

      <div className='flex justify-center pb-10'>
        <Link href='/analyze'>
          <Button className='bg-blue-600 hover:bg-blue-700 text-white'>
            Analyze ToS or Privacy Policy
          </Button>
        </Link>
      </div>
    </div>
  )
}
