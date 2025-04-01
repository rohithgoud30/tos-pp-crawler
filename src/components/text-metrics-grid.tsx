interface TextMetrics {
  word_count: number
  avg_word_length: number
  sentence_count: number
  avg_sentence_length: number
  readability_score: number
  unique_word_ratio: number
  capital_letter_frequency: number
  punctuation_density: number
  question_frequency: number
  paragraph_count: number
}

export function TextMetricsGrid({ metrics }: { metrics: TextMetrics }) {
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
    { label: 'Readability Score', value: metrics.readability_score.toFixed(1) },
    { label: 'Unique Word Ratio', value: metrics.unique_word_ratio.toFixed(2) },
    {
      label: 'Capital Letter Frequency',
      value: `${(metrics.capital_letter_frequency * 100).toFixed(0)}%`,
    },
    {
      label: 'Punctuation Density',
      value: metrics.punctuation_density.toFixed(2),
    },
    {
      label: 'Question Frequency',
      value: `${(metrics.question_frequency * 100).toFixed(0)}%`,
    },
    {
      label: 'Paragraph Count',
      value: metrics.paragraph_count.toLocaleString(),
    },
  ]

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4'>
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
        </div>
      ))}
    </div>
  )
}
