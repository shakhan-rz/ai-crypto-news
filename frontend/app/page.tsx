import { ShaderBackground } from '@/components/ui/shader-background'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Home } from '@/components/home'
import { getArticles, getLastUpdated } from '@/lib/articles'

export default function HomePage() {
  return (
    <main id="top" className="relative min-h-screen bg-black">
      <ShaderBackground className="z-0" />

      <div className="relative z-10">
        <Navbar />
        <Home articles={getArticles()} lastUpdated={getLastUpdated()} />
        <Footer />
      </div>
    </main>
  )
}
