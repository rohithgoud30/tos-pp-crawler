"use client"

import type React from "react"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [documentType, setDocumentType] = useState("both")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Searching for:", searchQuery, "Document type:", documentType)
    // Handle search logic here
  }

  return (
    <section className="w-full py-16 md:py-24 lg:py-32 flex items-center justify-center">
      <div className="container px-4 md:px-6 max-w-3xl">
        <div className="flex flex-col items-center space-y-10 text-center">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              🧠 Understand What You're Agreeing To
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
              CRWLR analyzes Terms of Service and Privacy Policies so you don't have to read the fine print.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by website name or URL..."
                className="pl-10 h-14 text-base border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full h-14 bg-black text-white hover:bg-gray-800 font-medium text-base">
              Search
            </Button>

            <div className="flex justify-center pt-2">
              <RadioGroup
                defaultValue="both"
                className="flex space-x-4"
                value={documentType}
                onValueChange={setDocumentType}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tos" id="tos" />
                  <Label htmlFor="tos" className="text-sm font-medium">
                    Terms of Service
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="privacy" id="privacy" />
                  <Label htmlFor="privacy" className="text-sm font-medium">
                    Privacy Policy
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="both" id="both" />
                  <Label htmlFor="both" className="text-sm font-medium">
                    Both
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

