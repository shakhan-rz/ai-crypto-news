import { VideoBackground } from '@/components/ui/video-background'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Home, type Article } from '@/components/home'
import rawArticles from '../../data/processed-articles.json'

// Sorted once at build time — the data is baked into the bundle so it works
// on any host (Vercel included) without reading from the filesystem at runtime.
const articles = [...(rawArticles as Article[])].sort(
  (a, b) => b.importance - a.importance
)

export default function HomePage() {
  return (
    <main id="top" className="relative min-h-screen bg-black">
      <VideoBackground className="z-0" />
      {/* Legibility overlay so the video never fights the text */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-black/50" />

      <div className="relative z-10">
        <Navbar />
        <Home articles={articles} />
        <Footer />
      </div>
    </main>
  )
}
