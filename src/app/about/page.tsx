import { Shield, Search, BarChart3, FileCode } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AboutPage() {
  return (
    <div className='min-h-screen flex flex-col bg-white dark:bg-black'>
      <main className='flex-1'>
        <section className='w-full py-12 md:py-24 lg:py-32'>
          <div className='container px-4 md:px-6 max-w-3xl'>
            <div className='space-y-4 text-center mb-16'>
              <h1 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-black dark:text-white'>
                About CRWLR
              </h1>
              <p className='mx-auto max-w-[700px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed'>
                Making legal documents understandable for everyone
              </p>
            </div>

            <div className='space-y-12'>
              <div className='space-y-4'>
                <h2 className='text-2xl font-bold text-black dark:text-white'>
                  Our Mission
                </h2>
                <p className='text-gray-500 dark:text-gray-400 leading-relaxed'>
                  {`CRWLR was founded with a simple mission: to make the complex
                  legal language of Terms of Service and Privacy Policies
                  accessible to everyone. We believe that understanding what
                  you're agreeing to online shouldn't require a law degree.`}
                </p>
              </div>

              <div className='grid gap-8 md:grid-cols-2'>
                <div className='space-y-4'>
                  <div className='flex items-center gap-2'>
                    <Search className='h-6 w-6 text-black dark:text-white' />
                    <h3 className='text-xl font-bold text-black dark:text-white'>
                      Document Analysis
                    </h3>
                  </div>
                  <p className='text-gray-500 dark:text-gray-400'>
                    {`We analyze Terms of Service and Privacy Policy documents
                    separately, providing specific insights for each document
                    type to help you understand what you're agreeing to.`}
                  </p>
                </div>

                <div className='space-y-4'>
                  <div className='flex items-center gap-2'>
                    <Shield className='h-6 w-6 text-black dark:text-white' />
                    <h3 className='text-xl font-bold text-black dark:text-white'>
                      Protection
                    </h3>
                  </div>
                  <p className='text-gray-500 dark:text-gray-400'>
                    {`Our analysis helps you identify potential privacy concerns
                    and understand your rights when using online services, with
                    clear distinctions between Terms of Service and Privacy
                    Policy implications.`}
                  </p>
                </div>

                <div className='space-y-4'>
                  <div className='flex items-center gap-2'>
                    <BarChart3 className='h-6 w-6 text-black dark:text-white' />
                    <h3 className='text-xl font-bold text-black dark:text-white'>
                      Text Mining
                    </h3>
                  </div>
                  <p className='text-gray-500 dark:text-gray-400'>
                    We apply advanced text mining techniques to extract
                    meaningful metrics from legal documents, including
                    readability scores, word frequencies, and linguistic
                    patterns specific to each document type.
                  </p>
                </div>

                <div className='space-y-4'>
                  <div className='flex items-center gap-2'>
                    <FileCode className='h-6 w-6 text-black dark:text-white' />
                    <h3 className='text-xl font-bold text-black dark:text-white'>
                      Comprehensive Data
                    </h3>
                  </div>
                  <p className='text-gray-500 dark:text-gray-400'>
                    For each document, we provide one-sentence summaries,
                    detailed 100-word explanations, text mining measurements,
                    and word frequency analysis to give you a complete
                    understanding.
                  </p>
                </div>
              </div>

              <div className='space-y-4'>
                <h2 className='text-2xl font-bold text-black dark:text-white'>
                  How It Works
                </h2>
                <p className='text-gray-500 dark:text-gray-400 leading-relaxed'>
                  {`CRWLR uses advanced text mining and AI analysis to scan Terms
                  of Service and Privacy Policy documents separately. Our
                  algorithms identify important clauses, potential concerns, and
                  summarize the key points in plain language for each document
                  type. We analyze linguistic patterns, readability scores, and
                  word frequencies to provide comprehensive insights into what
                  you're agreeing to.`}
                </p>
              </div>

              <div className='space-y-4'>
                <h2 className='text-2xl font-bold text-black dark:text-white'>
                  Our Technology
                </h2>
                <p className='text-gray-500 dark:text-gray-400 leading-relaxed'>
                  Our platform processes legal documents using natural language
                  processing and text mining techniques. For each document, we
                  calculate metrics like word count, average word and sentence
                  length, readability scores, and unique word ratios. We also
                  identify the most frequently used terms to highlight what
                  companies emphasize in their legal agreements.
                </p>
              </div>

              <div className='border-t border-gray-200 dark:border-gray-700 pt-8 text-center'>
                <p className='text-gray-500 dark:text-gray-400 mb-6'>
                  {`Ready to understand what you're really agreeing to?`}
                </p>
                <Button
                  asChild
                  className='bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-200'
                >
                  <Link href='/'>Try CRWLR Now</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
