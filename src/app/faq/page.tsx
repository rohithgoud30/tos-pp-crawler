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
      'CRWLR uses text mining and AI analysis to scan and interpret legal documents. Our system processes Terms of Service and Privacy Policy documents separately, extracting key metrics like word count, readability scores, and semantic content. We provide text analysis with exact decimal precision (to 2 decimal places), word frequency patterns, and both concise and detailed summaries.',
  },
  {
    question: 'What AI technology powers your summarization features?',
    answer:
      'We employ advanced natural language processing models specifically fine-tuned for legal document analysis. Our AI summarization system can process complex legal language and generate both one-sentence overviews and comprehensive 100-word summaries that extract the most important points from lengthy documents. This AI technology makes dense legal text accessible to everyone.',
  },
  {
    question: 'How does your NLP technology analyze legal documents?',
    answer:
      'Our NLP (Natural Language Processing) algorithms analyze document structure, identify semantic patterns, and extract key terms from legal texts. The system recognizes important clauses, potential obligations, and significant restrictions by understanding the contextual meaning within complex legal language. This computational linguistic approach allows us to translate legalese into clear, understandable information.',
  },
  {
    question:
      "What's the difference between your Terms of Service and Privacy Policy analysis?",
    answer:
      'Our Terms of Service analysis focuses on user rights, service limitations, content ownership, and legal obligations. Privacy Policy analysis examines data collection practices, information sharing policies, data retention, and compliance with privacy regulations. Each document type receives specialized analysis with precise metrics displayed consistently to 2 decimal places.',
  },
  {
    question: 'What metrics do you provide in your text mining analysis?',
    answer:
      'We provide a comprehensive set of metrics including word count, average word length (to 2 decimal places), sentence count, average sentence length (to 2 decimal places), readability score (to 2 decimal places), unique word ratio, capital letter frequency, punctuation density, question frequency, and common word percentage. These precise measurements help assess document complexity.',
  },
  {
    question: 'How do you generate the word frequency analysis?',
    answer:
      'Our system analyzes the document text to identify the top 20 most frequently used terms, displaying them with their occurrence count and percentage of the total text. This visualization helps identify key themes and priorities in legal documents. Different patterns typically emerge between Terms of Service and Privacy Policy documents.',
  },
  {
    question: "How accurate is CRWLR's analysis?",
    answer:
      'Our analysis provides precise metrics (to 2 decimal places) and AI-generated summaries. While we strive for accuracy in our measurements and analysis, the interpretative aspects should not be considered legal advice. We recommend consulting with a legal professional for critical matters. Our precise metrics provide reliable quantitative insights into document complexity.',
  },
  {
    question: 'Which websites and services does CRWLR support?',
    answer:
      'CRWLR can analyze Terms of Service and Privacy Policy documents from any publicly accessible URL. Our database includes popular services and is regularly updated. You can search for existing analyses by company name or URL, or submit new URLs for analysis through our submission form.',
  },
  {
    question: 'How often is the database updated?',
    answer:
      "Our system regularly checks for updates to popular services' legal documents. When changes are detected, we perform a new analysis and maintain the historical record of previous versions. This allows you to track how Terms of Service and Privacy Policies evolve over time.",
  },
  {
    question: 'What are the one-sentence and 100-word summaries?',
    answer:
      "For each document, we generate a one-sentence summary that captures the essential point of the agreement, and a more detailed 100-word summary covering key aspects. These AI-generated summaries distill complex legal text into accessible language, helping you quickly understand what you're agreeing to without reading the entire document.",
  },
  {
    question: 'How does CRWLR calculate readability scores?',
    answer:
      'We use the Flesch-Kincaid readability test, which measures text complexity based on sentence length and word syllables. The score is presented with 2 decimal precision (e.g., 92.10 rather than 92.1). Higher scores indicate easier readability, while lower scores indicate more complex text requiring advanced education to comprehend.',
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
