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
                Making Terms of Service and Privacy Policy documents
                understandable for everyone
              </p>
            </div>

            <div className='space-y-12'>
              <div className='space-y-4'>
                <h2 className='text-2xl font-bold text-black dark:text-white'>
                  Our Mission
                </h2>
                <p className='text-gray-500 dark:text-gray-400 leading-relaxed'>
                  {`CRWLR was built to demystify the complex legal language in Terms of Service and Privacy Policy documents. We believe everyone has the right to understand what they're agreeing to online without needing legal expertise. Our platform provides precise, consistent analysis with metrics displayed to 2 decimal places, helping users make informed decisions about the services they use.`}
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
                    {`Our platform analyzes Terms of Service and Privacy Policy documents independently, extracting key metrics with 2 decimal precision. Search for existing analyses or submit new URLs for immediate processing. Each document receives comprehensive metrics and AI-generated summaries.`}
                  </p>
                </div>

                <div className='space-y-4'>
                  <div className='flex items-center gap-2'>
                    <Shield className='h-6 w-6 text-black dark:text-white' />
                    <h3 className='text-xl font-bold text-black dark:text-white'>
                      Informed Decision Making
                    </h3>
                  </div>
                  <p className='text-gray-500 dark:text-gray-400'>
                    {`Our precisely calculated metrics (to 2 decimal places) help you identify potentially concerning patterns in legal documents. You can compare documents across services, understanding exactly what rights you're granting and what data is being collected through quantitative analysis.`}
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
                    We apply advanced text mining to extract precise metrics
                    (displayed to exactly 2 decimal places) including
                    readability scores, word frequencies, and linguistic
                    patterns. Our analysis calculates metrics like average word
                    length (5.21 characters), readability scores (92.10), and
                    unique word ratios with consistent decimal precision.
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
                    Each document analysis includes one-sentence summaries,
                    detailed 100-word explanations, precise text metrics with 2
                    decimal places, and visualization of the top 20 most
                    frequently used terms. This multi-faceted approach gives you
                    a complete understanding of legal documents.
                  </p>
                </div>
              </div>

              <div className='space-y-4'>
                <h2 className='text-2xl font-bold text-black dark:text-white'>
                  How It Works
                </h2>
                <p className='text-gray-500 dark:text-gray-400 leading-relaxed'>
                  {`When you submit a URL or search for a company, CRWLR identifies and analyzes the Terms of Service and Privacy Policy documents. Our system calculates key metrics with 2 decimal precision, identifies word frequency patterns, and generates summaries. The results are presented in an intuitive dashboard showing exactly what you're agreeing to when you use these services, with all numeric values consistently formatted.`}
                </p>
              </div>

              <div className='space-y-4'>
                <h2 className='text-2xl font-bold text-black dark:text-white'>
                  Our Technology
                </h2>
                <p className='text-gray-500 dark:text-gray-400 leading-relaxed'>
                  CRWLR&apos;s platform employs natural language processing and
                  advanced text mining techniques. We process documents to
                  calculate precise metrics with consistent 2 decimal place
                  formatting, including word count, readability scores
                  (displayed as 92.10 rather than 92.1), sentence structure
                  analysis, and linguistic patterns. Our visualization tools
                  identify the top 20 most frequently used terms to highlight
                  key themes in legal agreements.
                </p>
              </div>

              <div className='space-y-4'>
                <h2 className='text-2xl font-bold text-black dark:text-white'>
                  AI-Powered Summarization
                </h2>
                <p className='text-gray-500 dark:text-gray-400 leading-relaxed'>
                  We leverage advanced AI models to automatically generate
                  concise summaries of complex legal documents. Our system
                  produces both one-sentence overviews and comprehensive
                  100-word summaries that distill the essence of lengthy Terms
                  of Service and Privacy Policy documents. This AI-driven
                  approach transforms dense legal text into accessible language,
                  helping users quickly understand the key points without
                  reading pages of legalese.
                </p>
              </div>

              <div className='space-y-4'>
                <h2 className='text-2xl font-bold text-black dark:text-white'>
                  Natural Language Processing
                </h2>
                <p className='text-gray-500 dark:text-gray-400 leading-relaxed'>
                  Our platform uses sophisticated NLP algorithms to analyze
                  legal document structure, semantic content, and linguistic
                  patterns. These NLP capabilities allow us to extract
                  meaningful insights from complex legal text, identify
                  important clauses, and present the information in a
                  user-friendly format. By applying computational linguistics to
                  Terms of Service and Privacy Policy documents, we make them
                  truly understandable for everyone.
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
