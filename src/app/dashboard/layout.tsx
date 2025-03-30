import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardSidebar } from '@/components/dashboard/sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/auth/login')
  }

  return (
    <div className='flex h-screen bg-gray-50'>
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main content */}
      <div className='flex flex-col flex-1 overflow-hidden'>
        <DashboardHeader />

        <main className='flex-1 overflow-y-auto p-6'>{children}</main>
      </div>
    </div>
  )
}
