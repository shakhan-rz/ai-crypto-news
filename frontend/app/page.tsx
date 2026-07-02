import { DottedSurface } from '@/components/ui/dotted-surface'
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
    <main id="top" className="relative min-h-screen bg-neutral-50 dark:bg-[rgb(10,10,10)]">
      <DottedSurface className="z-0" />

      <div className="relative z-10">
        <Navbar />
        <Home articles={articles} />
        <Footer />
      </div>
    </main>
  )
}
