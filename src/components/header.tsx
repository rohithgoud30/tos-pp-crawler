import Link from "next/link"
import { FileText } from "lucide-react"

import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="w-full border-b border-gray-200">
      <div className="container flex h-16 items-center px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          <span className="font-semibold">CRWLR</span>
        </Link>
        <nav className="ml-auto flex gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/about">About</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/faq">FAQ</Link>
          </Button>
          <Button
            variant="default"
            size="sm"
            className="bg-white text-black border border-gray-200 hover:bg-gray-100"
            asChild
          >
            <Link href="/login">Login</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}

