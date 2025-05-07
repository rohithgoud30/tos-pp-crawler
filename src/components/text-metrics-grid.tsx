import { type TextMiningMetrics } from '@/lib/api'

export function TextMetricsGrid({ metrics }: { metrics: TextMiningMetrics }) {
  const metricsData = [
    {
      label: 'Word Count',
      value: `${metrics.word_count.toLocaleString()} words`,
    },
    {
      label: 'Average Word Length',
      value: `${Number(metrics.avg_word_length).toFixed(2)} characters`,
    },
    {
      label: 'Sentence Count',
      value: `${metrics.sentence_count.toLocaleString()} sentences`,
    },
    {
      label: 'Average Sentence Length',
      value: `${Number(metrics.avg_sentence_length).toFixed(2)} words`,
    },
    {
      label: 'Readability Score',
      value: Number(metrics.readability_score).toFixed(2),
    },
    {
      label: 'Readability Interpretation',
      value: metrics.readability_interpretation,
    },
    {
      label: 'Unique Word Ratio',
      value: `${Number(metrics.unique_word_ratio).toFixed(2)}%`,
    },
    {
      label: 'Capital Letter Frequency',
      value: `${Number(metrics.capital_letter_freq).toFixed(2)}%`,
    },
    {
      label: 'Punctuation Density',
      value: Number(metrics.punctuation_density).toFixed(2),
    },
    {
      label: 'Question Frequency',
      value: `${Number(metrics.question_frequency).toFixed(2)}%`,
    },
    {
      label: 'Common Word Percentage',
      value: `${Number(metrics.common_word_percentage).toFixed(2)}%`,
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
          <p className='text-xs font-medium text-black dark:text-white'>
            {metric.value}
          </p>
        </div>
      ))}
    </div>
  )
}
