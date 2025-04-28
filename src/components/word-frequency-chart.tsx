import { type WordFrequency } from '@/lib/api'

export function WordFrequencyChart({
  wordFrequencies,
}: {
  wordFrequencies: WordFrequency[]
}) {
  // Display top 20 words maximum
  const topWords = wordFrequencies.slice(0, 20)

  return (
    <div className='space-y-3'>
      <div className='text-center mb-4'>
        <h3 className='text-md font-semibold text-gray-800 dark:text-gray-200'>
          Top 20 Most Frequent Words
        </h3>
        <p className='text-xs text-gray-500 dark:text-gray-400'>
          Words with highest occurrence in the document
        </p>
      </div>
      <div className='grid grid-cols-1 gap-2'>
        {topWords.map((item, index) => (
          <div key={index} className='flex items-center'>
            <div className='w-24 text-right mr-4 text-sm text-gray-700 dark:text-gray-300 font-medium'>
              <span className='mr-2 text-gray-500 dark:text-gray-400'>
                {index + 1}.
              </span>
              {item.word}
            </div>
            <div className='flex-1 h-8 bg-gray-100 dark:bg-gray-800 relative rounded-sm overflow-hidden'>
              <div
                className='absolute top-0 left-0 h-full bg-gray-300 dark:bg-gray-600'
                style={{ width: `${item.percentage * 100}%` }}
              ></div>
              <div className='absolute top-0 left-0 h-full w-full flex items-center justify-between px-3'>
                <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                  {item.count}
                </span>
                <span className='text-xs text-gray-500 dark:text-gray-400'>
                  {item.percentage_display}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
