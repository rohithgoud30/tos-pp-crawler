import Link from 'next/link'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'

const faqItems = [
  {
    question: 'What is CRWLR?',
    answer:
      "CRWLR is a tool that analyzes Terms of Service and Privacy Policy documents to help you understand what you're agreeing to when you use online services. We scan legal documents, identify important clauses, and present the information in plain language.",
  },
  {
    question: 'How does CRWLR work?',
    answer:
      'CRWLR uses text mining and AI analysis to scan and interpret legal documents. Our system identifies key clauses, potential red flags, and summarizes the most important information. Each document receives a score based on user-friendliness, privacy protection, and clarity.',
  },
  {
    question: 'Is CRWLR free to use?',
    answer:
      'Yes, basic searches and analyses are completely free. We offer premium features for users who need more detailed analysis or want to monitor changes to Terms of Service over time.',
  },
  {
    question: "How accurate is CRWLR's analysis?",
    answer:
      'While our AI-powered analysis is highly sophisticated, it should not be considered legal advice. We strive for accuracy, but recommend consulting with a legal professional for critical matters. Our system is continuously improving based on user feedback and expert review.',
  },
  {
    question: 'Which websites and services does CRWLR support?',
    answer:
      'CRWLR can analyze any publicly available Terms of Service or Privacy Policy. We maintain a database of popular services that is updated regularly, and you can request analysis of any URL that contains legal documents.',
  },
  {
    question: 'How often is the database updated?',
    answer:
      "We scan for updates to popular services' legal documents weekly. When we detect changes, we analyze the new version and highlight what has changed. Premium users receive notifications when services they use update their terms.",
  },
  {
    question: 'Can I use CRWLR for my business?',
    answer:
      "Yes, we offer business plans that allow you to monitor competitors' terms, ensure compliance with regulations, and even analyze your own legal documents for clarity and user-friendliness.",
  },
  {
    question: 'How does CRWLR calculate privacy scores?',
    answer:
      'Our privacy scores are based on multiple factors including data collection practices, sharing with third parties, user control over data, retention policies, and compliance with privacy regulations. Higher scores indicate more user-friendly and privacy-respecting terms.',
  },
  {
    question: "What are 'red flags' in CRWLR's analysis?",
    answer:
      'Red flags highlight potentially concerning clauses in legal documents. These might include broad rights to user content, mandatory arbitration clauses, significant limitations on liability, unilateral terms changes without notice, or extensive data collection practices.',
  },
  {
    question: 'Do I need to create an account to use CRWLR?',
    answer:
      'No, you can perform basic searches without creating an account. However, creating a free account allows you to save your search history, receive alerts about changes to services you use, and access additional features.',
  },
]

export default function FAQPage() {
  return (
    <div className='min-h-screen flex flex-col bg-white dark:bg-black'>
      <main className='flex-1'>
        <section className='w-full py-12 md:py-24 lg:py-32'>
          <div className='container px-4 md:px-6 max-w-3xl'>
            <div className='space-y-4 text-center mb-16'>
              <h1 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-black dark:text-white'>
                Frequently Asked Questions
              </h1>
              <p className='mx-auto max-w-[700px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed'>
                Everything you need to know about CRWLR
              </p>
            </div>

            <Accordion type='single' collapsible className='w-full space-y-4'>
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className='border border-gray-200 dark:border-white/10 rounded-md px-6'
                >
                  <AccordionTrigger className='text-left font-medium py-4 hover:no-underline text-black dark:text-white'>
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className='text-gray-500 dark:text-gray-400 pb-4'>
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className='mt-16 text-center space-y-6'>
              <div className='space-y-2'>
                <h2 className='text-xl font-bold text-black dark:text-white'>
                  Still have questions?
                </h2>
                <p className='text-gray-500 dark:text-gray-400'>
                  {`If you couldn't find the answer to your question, feel free to
                  contact us.`}
                </p>
              </div>
              <Button
                asChild
                className='bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-200'
              >
                <Link href='/contact'>Contact Us</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className='w-full border-t border-gray-100 py-6'>
        <div className='container px-4 md:px-6'>
          <div className='flex flex-col items-center justify-center gap-4 md:flex-row md:gap-6'>
            <p className='text-center text-sm text-gray-500'>
              © {new Date().getFullYear()} CRWLR. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
