import React from 'react'
import { AnalysisClient } from '@/components/analysis-client'

// This is a server component that receives the params
export default function AnalysisPage({ params }: { params: { id: string } }) {
  // Pass the id as a prop to the client component
  return <AnalysisClient id={params.id} />
}
