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
      "CRWLR is a tool that separately analyzes Terms of Service and Privacy Policy documents to help you understand what you're agreeing to when you use online services. We scan legal documents, identify important clauses, and present the information in plain language with specific insights for each document type.",
  },
  {
    question: 'How does CRWLR work?',
    answer:
      'CRWLR uses text mining and AI analysis to scan and interpret legal documents. Our system processes Terms of Service and Privacy Policy documents separately, identifying key clauses, potential red flags, and summarizing the most important information. For each document type, we provide text mining metrics, word frequency analysis, and both brief and detailed summaries.',
  },
  {
    question:
      "What's the difference between your Terms of Service and Privacy Policy analysis?",
    answer:
      'Our Terms of Service analysis focuses on user rights, content ownership, service limitations, and legal obligations. Privacy Policy analysis examines data collection practices, information sharing, user control over data, and compliance with privacy regulations. Each analysis includes document-specific metrics and insights.',
  },
  {
    question: 'What metrics do you provide in your text mining analysis?',
    answer:
      'For each document type, we provide metrics including word count, average word length, sentence count, average sentence length, readability score, unique word ratio, capital letter frequency, punctuation density, question frequency, and paragraph count. These metrics help assess the complexity and accessibility of legal documents.',
  },
  {
    question: 'How do you generate the word frequency analysis?',
    answer:
      'We analyze each document type separately to identify the most frequently used terms. This helps highlight what companies emphasize in their Terms of Service versus their Privacy Policies. The word frequency analysis can reveal important patterns and priorities in legal documents.',
  },
  {
    question: "How accurate is CRWLR's analysis?",
    answer:
      'While our AI-powered analysis is highly sophisticated, it should not be considered legal advice. We strive for accuracy by analyzing each document type separately with specialized algorithms, but recommend consulting with a legal professional for critical matters. Our system is continuously improving based on user feedback and expert review.',
  },
  {
    question: 'Which websites and services does CRWLR support?',
    answer:
      'CRWLR can analyze any publicly available Terms of Service or Privacy Policy. We maintain a database of popular services that is updated regularly, and you can request analysis of any URL that contains legal documents. Our database includes major platforms like Google, Facebook, Twitter, Apple, Microsoft, and many others.',
  },
  {
    question: 'How often is the database updated?',
    answer:
      "We scan for updates to popular services' legal documents weekly. When we detect changes, we analyze the new version and highlight what has changed in both Terms of Service and Privacy Policy documents. This helps you stay informed about changes to the agreements you've accepted.",
  },
  {
    question: 'What are the one-sentence and 100-word summaries?',
    answer:
      "For each document type, we provide a one-sentence summary that captures the essential point of the agreement, and a more detailed 100-word summary that covers the key aspects. These summaries are designed to give you a quick understanding of what you're agreeing to without reading the entire document.",
  },
  {
    question: 'How does CRWLR calculate readability scores?',
    answer:
      'We use the Flesch-Kincaid readability test, which measures how difficult a text is to understand. Lower scores indicate more complex text that requires a higher reading level. Most Terms of Service and Privacy Policies score between 30-45, requiring college-level education to fully comprehend, which is why our summaries are so valuable.',
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
                  className='border border-gray-200 dark:border-gray-700 rounded-md px-6'
                >
                  <AccordionTrigger className='text-left font-medium py-4 hover:no-underline text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md px-2'>
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
    </div>
  )
}
