'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Search, Share2, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/neon-button'
import { HeroScene } from '@/components/hero-scene'
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
  if (score >= 8) return 'text-emerald-500 dark:text-emerald-400'
  if (score >= 5) return 'text-amber-500 dark:text-amber-400'
  return 'text-neutral-500 dark:text-neutral-400'
}

function timeAgo(pubDate: string): string | null {
  const then = new Date(pubDate).getTime()
  if (Number.isNaN(then)) return null

  const seconds = Math.round((Date.now() - then) / 1000)
  if (seconds < 60) return 'just now'

  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.round(hours / 24)
  if (days < 30) return `${days}d ago`

  const months = Math.round(days / 30)
  if (months < 12) return `${months}mo ago`

  return `${Math.round(months / 12)}y ago`
}

function ShareButton({ article }: { article: Article }) {
  const [copied, setCopied] = useState(false)

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (navigator.share) {
      try {
        await navigator.share({ title: article.title, url: article.link })
        return
      } catch {
        // user cancelled or share failed — fall back to copy
      }
    }

    try {
      await navigator.clipboard.writeText(article.link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable — nothing else we can do
    }
  }

  return (
    <button
      onClick={handleShare}
      aria-label={copied ? 'Link copied' : 'Share article'}
      className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="text-emerald-400"
          >
            <Check className="h-4 w-4" />
          </motion.span>
        ) : (
          <motion.span
            key="share"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Share2 className="h-4 w-4" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}

function ArticleSkeleton() {
  return (
    <Card className="overflow-hidden rounded-xl border-neutral-200 bg-white dark:border-neutral-800/80 dark:bg-gradient-to-b dark:from-neutral-900 dark:to-neutral-950">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="ml-auto h-5 w-12 rounded-full" />
        </div>
        <Skeleton className="mt-2 h-5 w-3/4" />
      </CardHeader>
      <CardContent className="pt-0">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="mt-2 h-3 w-11/12" />
        <Skeleton className="mt-2 h-3 w-2/3" />
      </CardContent>
    </Card>
  )
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
          ? 'border-orange-500 bg-gradient-to-br from-orange-400 to-orange-600 text-black shadow-sm shadow-orange-500/30'
          : 'border-neutral-300 bg-white/60 text-neutral-600 backdrop-blur-sm hover:border-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:bg-black/40 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-900 dark:hover:text-neutral-100',
        className
      )}
    >
      {label}{' '}
      <span className="text-neutral-500">({count})</span>
    </Button>
  )
}

export function Home({ articles }: { articles: Article[] }) {
  const [active, setActive] = useState<FilterKey | null>(null)
  const [query, setQuery] = useState('')
  const [shownCount, setShownCount] = useState(PAGE_SIZE)
  const [loading, setLoading] = useState(false)

  const trimmedQuery = query.trim().toLowerCase()
  const hasQuery = trimmedQuery.length > 0

  const counts = useMemo(
    () => ({
      all: articles.length,
      ai: articles.filter((a) => a.category === 'ai').length,
      crypto: articles.filter((a) => a.category === 'crypto').length,
    }),
    [articles]
  )

  const filtered = useMemo(() => {
    // With no category selected we only show anything once the user searches.
    const base =
      active === null
        ? hasQuery
          ? articles
          : []
        : active === 'all'
          ? articles
          : articles.filter((a) => a.category === active)

    if (!hasQuery) return base

    return base.filter(
      (a) =>
        a.title.toLowerCase().includes(trimmedQuery) ||
        a.summary.toLowerCase().includes(trimmedQuery)
    )
  }, [articles, active, hasQuery, trimmedQuery])

  const visible = filtered.slice(0, shownCount)
  const hasMore = shownCount < filtered.length
  const showEmptyState =
    !loading && (active !== null || hasQuery) && filtered.length === 0

  function selectFilter(key: FilterKey) {
    const next = active === key ? null : key
    setActive(next)
    setShownCount(PAGE_SIZE)
    if (next !== null) {
      setLoading(true)
      setTimeout(() => setLoading(false), 400)
    } else {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-10 pb-8 text-center">
        <HeroScene />
        <h1 className="mt-2 bg-gradient-to-b from-neutral-900 to-neutral-500 bg-clip-text text-4xl font-bold text-transparent dark:from-neutral-50 dark:to-neutral-400 md:text-6xl">
          AI + Crypto News
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-neutral-600 dark:text-neutral-300">
          The most important AI and crypto news
        </p>
      </section>

      {/* News feed */}
      <section id="news" className="mx-auto max-w-5xl px-4 py-12 scroll-mt-16">
        <h2 className="mb-6 text-center text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Latest, ranked by importance
        </h2>

        <div className="mx-auto mb-6 max-w-md">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setShownCount(PAGE_SIZE)
              }}
              placeholder="Search news…"
              aria-label="Search news"
              className="w-full rounded-full border border-neutral-300 bg-white/60 py-2.5 pl-10 pr-10 text-sm text-neutral-900 placeholder:text-neutral-400 backdrop-blur-sm transition-colors focus:border-orange-500/60 focus:outline-none focus:ring-1 focus:ring-orange-500/40 dark:border-neutral-800 dark:bg-black/40 dark:text-neutral-100 dark:placeholder:text-neutral-500"
            />
            {hasQuery && (
              <button
                onClick={() => {
                  setQuery('')
                  setShownCount(PAGE_SIZE)
                }}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-200 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

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

        {active === null && !hasQuery && (
          <p className="text-center text-sm text-neutral-500">
            Pick a category above or search to see the news.
          </p>
        )}

        {showEmptyState && (
          <p className="text-center text-sm text-neutral-500">
            No news found{hasQuery ? ` for “${query.trim()}”` : ''}.
          </p>
        )}

        {active !== null && loading && (
          <div className="grid gap-4">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <ArticleSkeleton key={i} />
            ))}
          </div>
        )}

        {(active !== null || hasQuery) && !loading && filtered.length > 0 && (
          <div key={`${active ?? 'none'}-${trimmedQuery}`} className="grid gap-4">
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
                <Card className="group relative overflow-hidden rounded-xl border-neutral-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-lg hover:shadow-neutral-300/50 dark:border-neutral-800/80 dark:bg-gradient-to-b dark:from-neutral-900 dark:to-neutral-950 dark:hover:border-neutral-700 dark:hover:shadow-black/40">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider text-neutral-600 dark:bg-neutral-800/80 dark:text-neutral-300"
                      >
                        {article.category}
                      </Badge>
                      <span className="text-xs text-neutral-500">
                        {article.source}
                      </span>
                      {timeAgo(article.pubDate) && (
                        <>
                          <span className="text-neutral-400 dark:text-neutral-600">·</span>
                          <span className="text-xs text-neutral-500">
                            {timeAgo(article.pubDate)}
                          </span>
                        </>
                      )}
                      <span className="ml-auto flex shrink-0 items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold tabular-nums dark:bg-neutral-800/60">
                        <span className={scoreColor(article.importance)}>
                          {article.importance}
                        </span>
                        <span className="text-neutral-400 dark:text-neutral-600">/10</span>
                      </span>
                      <ShareButton article={article} />
                    </div>
                    <CardTitle className="mt-2 text-base leading-snug text-neutral-900 transition-colors group-hover:text-black dark:text-neutral-100 dark:group-hover:text-white">
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
                      <p className="line-clamp-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                        {article.summary}
                      </p>
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setShownCount((c) => c + PAGE_SIZE)}
              className="rounded-full border border-neutral-300 bg-transparent px-6 py-2 text-sm font-medium text-neutral-600 transition-colors hover:border-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-900 dark:hover:text-neutral-100"
            >
              Load more
            </button>
          </div>
        )}
      </section>
    </>
  )
}
