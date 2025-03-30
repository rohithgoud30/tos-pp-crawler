export function WordFrequencyChart({
  wordFrequencies,
}: {
  wordFrequencies: Array<{ word: string; count: number }>
}) {
  // Find the maximum count to calculate percentages
  const maxCount = Math.max(...wordFrequencies.map((item) => item.count))

  return (
    <div className='space-y-3'>
      {wordFrequencies.map((item, index) => (
        <div key={index} className='flex items-center'>
          <div className='w-24 text-right mr-4 text-sm text-gray-700 dark:text-gray-300 font-medium'>
            {item.word}
          </div>
          <div className='flex-1 h-8 bg-gray-100 dark:bg-gray-800 relative rounded-sm overflow-hidden'>
            <div
              className='absolute top-0 left-0 h-full bg-gray-300 dark:bg-gray-600'
              style={{ width: `${(item.count / maxCount) * 100}%` }}
            ></div>
            <div className='absolute top-0 left-0 h-full w-full flex items-center px-3'>
              <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                {item.count}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
