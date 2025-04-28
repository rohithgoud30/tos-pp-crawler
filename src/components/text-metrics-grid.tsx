import { type TextMiningMetrics } from '@/lib/api'

export function TextMetricsGrid({ metrics }: { metrics: TextMiningMetrics }) {
  const metricsData = [
    {
      label: 'Word Count',
      value: `${metrics.word_count.toLocaleString()} words`,
    },
    {
      label: 'Average Word Length',
      value: `${metrics.avg_word_length} characters`,
    },
    {
      label: 'Sentence Count',
      value: `${metrics.sentence_count.toLocaleString()} sentences`,
    },
    {
      label: 'Average Sentence Length',
      value: `${metrics.avg_sentence_length} words`,
    },
    {
      label: 'Readability Score',
      value: metrics.readability_score.toFixed(1),
      description: metrics.readability_interpretation,
    },
    {
      label: 'Unique Word Ratio',
      value: `${metrics.unique_word_ratio.toFixed(2)}%`,
    },
    {
      label: 'Capital Letter Frequency',
      value: `${metrics.capital_letter_freq.toFixed(2)}%`,
    },
    {
      label: 'Punctuation Density',
      value: metrics.punctuation_density.toFixed(2),
    },
    {
      label: 'Question Frequency',
      value: `${metrics.question_frequency}%`,
    },
    {
      label: 'Paragraph Count',
      value: metrics.paragraph_count.toLocaleString(),
    },
    {
      label: 'Common Word Percentage',
      value: `${metrics.common_word_percentage.toFixed(2)}%`,
    },
  ]

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
      {metricsData.map((metric, index) => (
        <div
          key={index}
          className='border border-gray-200 dark:border-gray-700 rounded-md p-4'
        >
          <p className='text-sm text-gray-500 dark:text-gray-400 mb-1'>
            {metric.label}
          </p>
          <p className='text-lg font-medium text-black dark:text-white'>
            {metric.value}
          </p>
          {metric.description && (
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
              {metric.description}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
