import UrlSubmissionForm from '@/components/url-submission-form'

export const metadata = {
  title: 'Summarize ToS/PP - CRWLR',
  description:
    'Submit a URL to get summaries of Terms of Service or Privacy Policy documents',
}

export default function SummarizePage() {
  return (
    <div className='container mx-auto py-8 px-4'>
      <div className='max-w-3xl mx-auto text-center'>
        <p className='text-gray-600 dark:text-gray-300'>
          Submit a website or app link to get summaries of Terms of Service or
          Privacy Policy documents. Our system will automatically find the
          documents, extract the content, and provide easy-to-read summaries.
        </p>
      </div>
      <UrlSubmissionForm />
    </div>
  )
}
