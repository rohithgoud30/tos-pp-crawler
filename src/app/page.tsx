import HeroSection from "@/components/hero-section"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1">
        <HeroSection />
      </main>

      <footer className="w-full border-t border-gray-100 py-6">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:gap-6">
            <p className="text-center text-sm text-gray-500">
              © {new Date().getFullYear()} CRWLR. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

