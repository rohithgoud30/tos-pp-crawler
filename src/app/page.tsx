import HeroSection from '@/components/hero-section'
// Removing this import since the notification is now managed by the DocumentStatsDisplay component
// import { ColdStartNotification } from '@/components/cold-start-notification'

export default function Home() {
  return (
    <div className='min-h-screen flex flex-col bg-white dark:bg-black'>
      <HeroSection />
      {/* The notification is now managed by the DocumentStatsDisplay component */}
    </div>
  )
}
