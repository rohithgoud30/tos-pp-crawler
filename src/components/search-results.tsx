"use client"

import { useState } from "react"
import { ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

type ResultState = "empty" | "loading" | "results"

export function SearchResults() {
  // This would normally come from a search query or API
  const [state, setState] = useState<ResultState>("results")

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

  // For demo purposes - toggle between states
  const toggleState = () => {
    if (state === "empty") setState("loading")
    else if (state === "loading") setState("results")
    else setState("empty")
  }

  if (state === "empty") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-xl font-medium mb-2">No results found</p>
        <p className="text-muted-foreground mb-6">Try searching for a different website or URL</p>
        <Button variant="outline" onClick={toggleState}>
          Show demo states
        </Button>
      </div>
    )
  }

  if (state === "loading") {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="pb-2">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {results.map((result) => (
        <Card key={result.id}>
          <CardHeader>
            <CardTitle className="text-xl">{result.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{result.url}</p>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Last analyzed</p>
                <p>{result.lastAnalyzed}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Privacy score</p>
                <p className="text-right">{result.score}/100</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full gap-2" variant="outline" asChild>
              <a href={`/analysis/${result.id}`}>
                View Analysis
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </CardFooter>
        </Card>
      ))}
      <Button variant="outline" className="col-span-full w-fit mx-auto mt-4" onClick={toggleState}>
        Toggle demo states
      </Button>
    </div>
  )
}

