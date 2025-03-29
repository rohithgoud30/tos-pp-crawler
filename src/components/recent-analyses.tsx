import { ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function RecentAnalyses() {
  // Example data
  const results = [
    {
      id: 1,
      name: "Twitter",
      url: "twitter.com",
      lastAnalyzed: "2023-11-15",
      score: 65,
    },
    {
      id: 2,
      name: "Facebook",
      url: "facebook.com",
      lastAnalyzed: "2023-11-10",
      score: 45,
    },
    {
      id: 3,
      name: "Instagram",
      url: "instagram.com",
      lastAnalyzed: "2023-11-05",
      score: 55,
    },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {results.map((result) => (
        <Card key={result.id} className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl">{result.name}</CardTitle>
            <p className="text-sm text-gray-500">{result.url}</p>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Last analyzed</p>
                <p>{result.lastAnalyzed}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Privacy score</p>
                <p className="text-right">{result.score}/100</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full gap-2 bg-white text-black border border-gray-200 hover:bg-gray-100" asChild>
              <a href={`/analysis/${result.id}`}>
                View Analysis
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

