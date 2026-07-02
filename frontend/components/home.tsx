'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Spotlight } from '@/components/ui/spotlight'
import { SplineScene } from '@/components/ui/splite'
import { Button } from '@/components/ui/neon-button'
import { cn } from '@/lib/utils'

export type Article = {
  title: string
  link: string
  pubDate: string
  source: string
  category: string
  content: string
  summary: string
  importance: number
}

type FilterKey = 'all' | 'ai' | 'crypto'

const PAGE_SIZE = 5

function scoreColor(score: number) {
  if (score >= 8) return 'text-emerald-400'
  if (score >= 5) return 'text-amber-400'
  return 'text-neutral-400'
}

function FilterButton({
  label,
  count,
  isActive,
  onClick,
  className,
}: {
  label: string
  count: number
  isActive: boolean
  onClick: () => void
  className?: string
}) {
  return (
    <Button
      onClick={onClick}
      size="sm"
      className={cn(
        'px-4 py-1.5 text-sm font-medium',
        isActive
          ? 'border-neutral-100 bg-neutral-100 text-neutral-900'
          : 'border-neutral-800 bg-black/40 text-neutral-300 backdrop-blur-sm hover:border-neutral-600 hover:bg-neutral-900 hover:text-neutral-100',
        className
      )}
    >
      {label}{' '}
      <span className="text-neutral-500">({count})</span>
    </Button>
  )
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)')
    setIsMobile(query.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    query.addEventListener('change', handler)
    return () => query.removeEventListener('change', handler)
  }, [])

  return isMobile
}

export function Home({ articles }: { articles: Article[] }) {
  const [active, setActive] = useState<FilterKey | null>(null)
  const [shownCount, setShownCount] = useState(PAGE_SIZE)
  const isMobile = useIsMobile()

  const counts = useMemo(
    () => ({
      all: articles.length,
      ai: articles.filter((a) => a.category === 'ai').length,
      crypto: articles.filter((a) => a.category === 'crypto').length,
    }),
    [articles]
  )

  const filtered = useMemo(
    () =>
      active === null
        ? []
        : active === 'all'
          ? articles
          : articles.filter((a) => a.category === active),
    [articles, active]
  )

  const visible = filtered.slice(0, shownCount)
  const hasMore = shownCount < filtered.length

  function selectFilter(key: FilterKey) {
    setActive((prev) => (prev === key ? null : key))
    setShownCount(PAGE_SIZE)
  }

  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <Card className="relative w-full overflow-hidden border-transparent bg-transparent py-0">
          <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" />
          <div className="relative z-10 flex flex-col items-center">
            <div
              className="relative h-[420px] w-full"
              style={{
                maskImage: 'linear-gradient(to bottom, black 0%, black 72%, transparent 92%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 72%, transparent 92%)',
              }}
            >
              {/* Orange halo behind the robot */}
              <div className="robot-glow pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2" />
              {/* Ground shadow / pedestal */}
              <div className="robot-shadow pointer-events-none absolute bottom-8 left-1/2 h-10 w-64 -translate-x-1/2" />
              {/* Robot with a gentle floating motion.
                  The contrast/brightness filter tones down the harsh white
                  specular glare on the robot's glossy face.
                  Skipped on mobile: the Spline WebGL scene (~2MB + its own
                  GPU context) is too heavy for phones, so we show a static
                  glow instead of stalling the page. */}
              {isMobile ? (
                <div className="robot-float flex h-full w-full items-center justify-center">
                  <div className="h-40 w-40 rounded-full bg-gradient-to-br from-orange-400/40 to-orange-600/10 blur-2xl" />
                </div>
              ) : (
                <div
                  className="robot-float relative h-full w-full"
                  style={{ filter: 'contrast(0.9) brightness(0.95)' }}
                >
                  <SplineScene
                    scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                    className="h-full w-full"
                  />
                </div>
              )}
            </div>
            <div className="flex flex-col items-center px-8 pb-12 text-center">
              <h1 className="bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-4xl font-bold text-transparent md:text-6xl">
                AI + Crypto News
              </h1>
              <p className="mt-4 max-w-lg text-neutral-300">
                The most important AI and crypto news
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* News feed */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="mb-6 text-center text-2xl font-bold text-neutral-100">
          Latest, ranked by importance
        </h2>

        <div className="mb-8 flex flex-wrap justify-center gap-2">
          <FilterButton
            label="All"
            count={counts.all}
            isActive={active === 'all'}
            onClick={() => selectFilter('all')}
          />
          <FilterButton
            label="AI"
            count={counts.ai}
            isActive={active === 'ai'}
            onClick={() => selectFilter('ai')}
          />
          <FilterButton
            label="Crypto"
            count={counts.crypto}
            isActive={active === 'crypto'}
            onClick={() => selectFilter('crypto')}
          />
        </div>

        {active === null && (
          <p className="text-center text-sm text-neutral-500">
            Pick a category above to see the news.
          </p>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={active ?? 'none'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="grid gap-4"
          >
            {visible.map((article, i) => (
              <motion.div
                key={article.link || article.title}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: Math.min(i * 0.03, 0.4),
                  ease: 'easeOut',
                }}
              >
                <Card className="group relative overflow-hidden rounded-xl border-neutral-800/80 bg-gradient-to-b from-neutral-900 to-neutral-950 transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-700 hover:shadow-lg hover:shadow-black/40">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="rounded-full bg-neutral-800/80 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider text-neutral-300"
                      >
                        {article.category}
                      </Badge>
                      <span className="text-xs text-neutral-500">
                        {article.source}
                      </span>
                      <span className="ml-auto flex shrink-0 items-center gap-1 rounded-full bg-neutral-800/60 px-2 py-0.5 text-xs font-semibold tabular-nums">
                        <span className={scoreColor(article.importance)}>
                          {article.importance}
                        </span>
                        <span className="text-neutral-600">/10</span>
                      </span>
                    </div>
                    <CardTitle className="mt-2 text-base leading-snug text-neutral-100 transition-colors group-hover:text-white">
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="after:absolute after:inset-0"
                      >
                        {article.title}
                      </a>
                    </CardTitle>
                  </CardHeader>
                  {article.summary && (
                    <CardContent className="pt-0">
                      <p className="line-clamp-3 text-sm leading-relaxed text-neutral-400">
                        {article.summary}
                      </p>
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setShownCount((c) => c + PAGE_SIZE)}
              className="rounded-full border border-neutral-800 bg-transparent px-6 py-2 text-sm font-medium text-neutral-300 transition-colors hover:border-neutral-600 hover:bg-neutral-900 hover:text-neutral-100"
            >
              Load more
            </button>
          </div>
        )}
      </section>
    </>
  )
}
