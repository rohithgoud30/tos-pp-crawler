import {
  ArrowLeft,
  Shield,
  AlertTriangle,
  Clock,
  Download,
  Share2,
  Bookmark,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { useState } from 'react'

// Define the type for the mock analyses
type Analysis = {
  id: number
  name: string
  url: string
  lastAnalyzed: string
  tosScore: number
  privacyScore: number
  redFlags: number
  category: string
  summary: string
  tosHighlights: { type: string; text: string }[]
  privacyHighlights: { type: string; text: string }[]
  redFlagDetails: { title: string; description: string }[]
}

// Define the type for the mock analyses object
type MockAnalyses = {
  [key: string]: Analysis
}

// Mock data for the analysis
const mockAnalyses: MockAnalyses = {
  '1': {
    id: 1,
    name: 'Twitter',
    url: 'twitter.com',
    lastAnalyzed: 'November 15, 2023',
    tosScore: 45,
    privacyScore: 60,
    redFlags: 3,
    category: 'Social Media',
    summary:
      "Twitter's Terms of Service and Privacy Policy are lengthy and contain several concerning clauses. The platform collects extensive user data and reserves broad rights to user content. There are mandatory arbitration clauses and limitations on liability that users should be aware of.",
    tosHighlights: [
      {
        type: 'warning',
        text: 'Twitter can modify terms at any time with limited notice',
      },
      {
        type: 'warning',
        text: 'You grant Twitter a worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, transmit, display and distribute your content',
      },
      {
        type: 'danger',
        text: 'Mandatory arbitration clause limits your ability to sue in court',
      },
      {
        type: 'info',
        text: 'You can delete your content at any time, but copies may remain in cached or archived form',
      },
      {
        type: 'info',
        text: 'You must be at least 13 years old to use the service',
      },
    ],
    privacyHighlights: [
      {
        type: 'danger',
        text: 'Collects extensive data including location, device information, and browsing history',
      },
      {
        type: 'warning',
        text: 'Shares data with third-party advertisers and partners',
      },
      {
        type: 'warning',
        text: 'Uses data for targeted advertising and content recommendations',
      },
      { type: 'info', text: 'Provides options to download your data' },
      {
        type: 'info',
        text: 'Allows some control over how your data is used for advertising',
      },
    ],
    redFlagDetails: [
      {
        title: 'Broad License to User Content',
        description:
          'Twitter claims an extensive license to use your content in ways you might not expect or intend.',
      },
      {
        title: 'Mandatory Arbitration',
        description:
          'You waive your right to sue in court and must use arbitration, which typically favors companies.',
      },
      {
        title: 'Extensive Data Collection',
        description:
          'Twitter collects significantly more data than necessary for providing its core services.',
      },
    ],
  },
  '2': {
    id: 2,
    name: 'Facebook',
    url: 'facebook.com',
    lastAnalyzed: 'November 10, 2023',
    tosScore: 35,
    privacyScore: 40,
    redFlags: 5,
    category: 'Social Media',
    summary:
      "Facebook's Terms of Service and Privacy Policy are among the most concerning of major platforms. The service collects extremely detailed user data and shares it extensively. The terms grant Facebook very broad rights to user content and limit user recourse in case of disputes.",
    tosHighlights: [
      {
        type: 'danger',
        text: 'Facebook can use your name, profile picture, and information about your actions with ads without compensation',
      },
      {
        type: 'danger',
        text: 'Terms can change at any time with minimal notice',
      },
      {
        type: 'warning',
        text: 'You grant Facebook a non-exclusive, transferable, sub-licensable, royalty-free, worldwide license to host, use, distribute, modify, run, copy, publicly perform or display, translate, and create derivative works of your content',
      },
      {
        type: 'warning',
        text: 'Mandatory arbitration clause with class action waiver',
      },
      { type: 'info', text: 'You can delete your account at any time' },
    ],
    privacyHighlights: [
      {
        type: 'danger',
        text: 'Collects data across devices and from third-party partners',
      },
      {
        type: 'danger',
        text: 'Uses facial recognition technology on photos and videos',
      },
      {
        type: 'warning',
        text: 'Shares data with a wide network of partners, advertisers, and researchers',
      },
      {
        type: 'warning',
        text: 'Tracks your location even when not using the app',
      },
      {
        type: 'info',
        text: 'Provides some tools to view and control your data',
      },
    ],
    redFlagDetails: [
      {
        title: 'Extensive Data Sharing',
        description:
          'Facebook shares your data with a vast network of third parties with limited transparency.',
      },
      {
        title: 'Cross-Platform Tracking',
        description:
          "Facebook tracks your activity across other websites and apps, even when you're not using Facebook.",
      },
      {
        title: 'Facial Recognition',
        description:
          'Uses advanced facial recognition technology on user photos without explicit consent.',
      },
      {
        title: 'Broad Content License',
        description:
          'Claims extensive rights to use your content, including for commercial purposes.',
      },
      {
        title: 'Limited Liability',
        description:
          'Caps liability at a minimal amount regardless of harm caused to users.',
      },
    ],
  },
}

export default function AnalysisPage({ params }: { params: { id: string } }) {
  // Get the analysis data based on the ID from the URL
  const analysis =
    mockAnalyses[params.id as keyof MockAnalyses] || mockAnalyses['1'] // Default to Twitter if ID not found

  // Determine score colors
  const getTosScoreColor = (score: number) => {
    if (score >= 70) return 'bg-green-500'
    if (score >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getPrivacyScoreColor = (score: number) => {
    if (score >= 70) return 'bg-green-500'
    if (score >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  // Get badge color based on highlight type
  const getHighlightBadgeColor = (type: string) => {
    switch (type) {
      case 'danger':
        return 'bg-red-100 text-red-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'info':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const [searchTerm, setSearchTerm] = useState('')
  const [filteredItems, setFilteredItems] = useState(analysis.tosHighlights)

  const handleFilter = () => {
    const filtered = analysis.tosHighlights.filter((item) =>
      item.text.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredItems(filtered)
  }

  return (
    <div className='min-h-screen flex flex-col bg-white dark:bg-black'>
      <main className='flex-1'>
        <div className='container px-4 md:px-6 py-8'>
          {/* Back button */}
          <div className='mb-6'>
            <Button
              variant='ghost'
              size='sm'
              className='gap-1 text-gray-500 hover:text-black'
              asChild
            >
              <Link href='/results'>
                <ArrowLeft className='h-4 w-4' />
                Back to results
              </Link>
            </Button>
          </div>

          {/* Header */}
          <div className='flex flex-col md:flex-row justify-between items-start gap-4 mb-8'>
            <div>
              <h1 className='text-3xl font-bold'>{analysis.name}</h1>
              <div className='flex items-center gap-2 mt-1'>
                <span className='text-gray-500'>{analysis.url}</span>
                <Badge className='bg-gray-100 text-gray-800'>
                  {analysis.category}
                </Badge>
              </div>
              <p className='text-sm text-gray-500 mt-2 flex items-center gap-1'>
                <Clock className='h-3 w-3' />
                Last analyzed: {analysis.lastAnalyzed}
              </p>
            </div>

            <div className='flex flex-wrap gap-2'>
              <Button
                variant='outline'
                size='sm'
                className='gap-1 border-gray-200'
              >
                <Download className='h-4 w-4' />
                Download Report
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='gap-1 border-gray-200'
              >
                <Share2 className='h-4 w-4' />
                Share
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='gap-1 border-gray-200'
              >
                <Bookmark className='h-4 w-4' />
                Save
              </Button>
            </div>
          </div>

          {/* Score overview */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
            <div className='border border-gray-200 rounded-lg p-6'>
              <div className='flex items-center gap-2 mb-4'>
                <Shield className='h-5 w-5' />
                <h2 className='text-xl font-bold'>Terms of Service Score</h2>
              </div>
              <div className='flex items-center gap-4 mb-4'>
                <div className='text-4xl font-bold'>{analysis.tosScore}</div>
                <div className='flex-1'>
                  <Progress
                    value={analysis.tosScore}
                    className='h-3 bg-gray-100'
                  >
                    <div
                      className={`h-full ${getTosScoreColor(
                        analysis.tosScore
                      )}`}
                      style={{ width: `${analysis.tosScore}%` }}
                    ></div>
                  </Progress>
                  <div className='flex justify-between mt-1 text-xs text-gray-500'>
                    <span>Poor</span>
                    <span>Average</span>
                    <span>Good</span>
                  </div>
                </div>
              </div>
              <p className='text-gray-500 text-sm'>
                This score indicates how user-friendly the Terms of Service are,
                considering factors like readability, fairness, and user rights.
              </p>
            </div>

            <div className='border border-gray-200 rounded-lg p-6'>
              <div className='flex items-center gap-2 mb-4'>
                <Shield className='h-5 w-5' />
                <h2 className='text-xl font-bold'>Privacy Policy Score</h2>
              </div>
              <div className='flex items-center gap-4 mb-4'>
                <div className='text-4xl font-bold'>
                  {analysis.privacyScore}
                </div>
                <div className='flex-1'>
                  <Progress
                    value={analysis.privacyScore}
                    className='h-3 bg-gray-100'
                  >
                    <div
                      className={`h-full ${getPrivacyScoreColor(
                        analysis.privacyScore
                      )}`}
                      style={{ width: `${analysis.privacyScore}%` }}
                    ></div>
                  </Progress>
                  <div className='flex justify-between mt-1 text-xs text-gray-500'>
                    <span>Poor</span>
                    <span>Average</span>
                    <span>Good</span>
                  </div>
                </div>
              </div>
              <p className='text-gray-500 text-sm'>
                This score reflects how well the Privacy Policy protects user
                data, considering data collection, sharing practices, and user
                control.
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className='mb-8'>
            <h2 className='text-xl font-bold mb-4'>Summary</h2>
            <div className='border border-gray-200 rounded-lg p-6'>
              <p className='text-gray-700'>{analysis.summary}</p>
            </div>
          </div>

          {/* Red flags */}
          <div className='mb-8'>
            <div className='flex items-center gap-2 mb-4'>
              <AlertTriangle className='h-5 w-5 text-red-500' />
              <h2 className='text-xl font-bold'>
                Red Flags ({analysis.redFlags})
              </h2>
            </div>
            <div className='border border-gray-200 rounded-lg divide-y'>
              {analysis.redFlagDetails.map((flag, index) => (
                <div key={index} className='p-6'>
                  <h3 className='font-bold text-red-700 mb-2'>{flag.title}</h3>
                  <p className='text-gray-700'>{flag.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed analysis tabs */}
          <div>
            <h2 className='text-xl font-bold mb-4'>Detailed Analysis</h2>
            <Tabs
              defaultValue='tos'
              className='border border-gray-200 rounded-lg'
            >
              <TabsList className='w-full border-b border-gray-200 rounded-t-lg rounded-b-none bg-gray-50'>
                <TabsTrigger value='tos' className='flex-1 py-3'>
                  Terms of Service
                </TabsTrigger>
                <TabsTrigger value='privacy' className='flex-1 py-3'>
                  Privacy Policy
                </TabsTrigger>
              </TabsList>

              <TabsContent value='tos' className='p-6 space-y-4'>
                <h3 className='font-bold text-lg mb-4'>Key Points</h3>
                <div className='space-y-3'>
                  <input
                    type='text'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button onClick={handleFilter}>Filter</button>
                  {filteredItems.map((highlight, index) => (
                    <div key={index} className='flex items-start gap-3'>
                      <Badge
                        className={`${getHighlightBadgeColor(
                          highlight.type
                        )} mt-0.5`}
                      >
                        {highlight.type === 'danger'
                          ? 'High Risk'
                          : highlight.type === 'warning'
                          ? 'Caution'
                          : 'Info'}
                      </Badge>
                      <p className='text-gray-700'>{highlight.text}</p>
                    </div>
                  ))}
                </div>

                <Separator className='my-6' />

                <div className='text-center py-4'>
                  <p className='text-gray-500 mb-4'>
                    Want to see the full Terms of Service analysis?
                  </p>
                  <Button className='bg-black text-white hover:bg-gray-900'>
                    Sign Up for Full Access
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value='privacy' className='p-6 space-y-4'>
                <h3 className='font-bold text-lg mb-4'>Key Points</h3>
                <div className='space-y-3'>
                  {analysis.privacyHighlights.map((highlight, index) => (
                    <div key={index} className='flex items-start gap-3'>
                      <Badge
                        className={`${getHighlightBadgeColor(
                          highlight.type
                        )} mt-0.5`}
                      >
                        {highlight.type === 'danger'
                          ? 'High Risk'
                          : highlight.type === 'warning'
                          ? 'Caution'
                          : 'Info'}
                      </Badge>
                      <p className='text-gray-700'>{highlight.text}</p>
                    </div>
                  ))}
                </div>

                <Separator className='my-6' />

                <div className='text-center py-4'>
                  <p className='text-gray-500 mb-4'>
                    Want to see the full Privacy Policy analysis?
                  </p>
                  <Button className='bg-black text-white hover:bg-gray-900'>
                    Sign Up for Full Access
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}
