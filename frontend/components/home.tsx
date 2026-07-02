'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Search, Share2, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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
  image?: string
}

type FilterKey = 'all' | 'ai' | 'crypto'
type SortKey = 'importance' | 'newest'

function categoryBadgeClass(category: string): string {
  if (category === 'ai') {
    return 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300'
  }
  if (category === 'crypto') {
    return 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300'
  }
  return 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800/80 dark:text-neutral-300'
}

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

// Remote RSS thumbnails are unreliable — hide the whole block if the image 404s
// or the feed didn't provide one.
function ArticleImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) return null
  return (
    <div className="relative w-full shrink-0 overflow-hidden bg-neutral-100 sm:w-64 sm:self-stretch dark:bg-neutral-900">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        onLoad={(e) => {
          // Some feeds ship 1x1 tracking pixels or tiny placeholders — treat
          // those as "no image" rather than showing an empty stretched box.
          const img = e.currentTarget
          if (img.naturalWidth < 200 || img.naturalHeight < 120) setFailed(true)
        }}
        className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-full"
      />
    </div>
  )
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

// Cycles through the topics we cover so the headline feels alive without being
// distracting. The gradient/clip styling comes from the parent <h1>.
const ROTATING_WORDS = ['AI + Crypto', 'Bitcoin', 'Ethereum', 'AI Agents', 'Web3']

function RotatingWord() {
  const [i, setI] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % ROTATING_WORDS.length), 2200)
    return () => clearInterval(id)
  }, [])

  // The animated span carries its own gradient+clip. It can't inherit the
  // parent <h1>'s background-clip:text because framer-motion adds a transform,
  // which breaks background-clip across the transformed layer (text goes
  // invisible). Giving the span its own clipped gradient fixes that.
  return (
    <span className="relative inline-flex overflow-hidden pb-1 align-bottom">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={ROTATING_WORDS[i]}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="inline-block bg-gradient-to-b from-orange-300 to-orange-600 bg-clip-text text-transparent"
        >
          {ROTATING_WORDS[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export function Home({ articles }: { articles: Article[] }) {
  const [active, setActive] = useState<FilterKey | null>(null)
  const [query, setQuery] = useState('')
  const [shownCount, setShownCount] = useState(PAGE_SIZE)
  const [loading, setLoading] = useState(false)
  const [sortBy, setSortBy] = useState<SortKey>('importance')

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

  const sorted = useMemo(() => {
    const copy = [...filtered]
    if (sortBy === 'newest') {
      copy.sort(
        (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
      )
    } else {
      copy.sort((a, b) => b.importance - a.importance)
    }
    return copy
  }, [filtered, sortBy])

  const visible = sorted.slice(0, shownCount)
  const hasMore = shownCount < sorted.length
  const showEmptyState =
    !loading && (active !== null || hasQuery) && sorted.length === 0

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
      <section className="mx-auto flex max-w-6xl flex-col items-center px-4 pt-16 pb-10">
        <div className="text-center">
          <h1 className="bg-gradient-to-b from-neutral-900 to-neutral-500 bg-clip-text text-4xl font-bold text-transparent dark:from-neutral-50 dark:to-neutral-400 md:text-6xl">
            <RotatingWord /> News
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-neutral-300">
            Signal over noise — the AI and crypto stories that actually matter,
            ranked and summarized for you.
          </p>
          <p className="mx-auto mt-3 text-xs uppercase tracking-widest text-neutral-500">
            Move your mouse to explore ↔
          </p>
        </div>
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

        {(active !== null || hasQuery) && !loading && sorted.length > 0 && (
          <div className="mb-4 flex items-center justify-end gap-2 text-sm">
            <span className="text-neutral-500">Sort by</span>
            <div className="inline-flex overflow-hidden rounded-full border border-neutral-300 dark:border-neutral-800">
              {(['importance', 'newest'] as SortKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    setSortBy(key)
                    setShownCount(PAGE_SIZE)
                  }}
                  className={cn(
                    'px-3 py-1 text-xs font-medium transition-colors',
                    sortBy === key
                      ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-black'
                      : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900'
                  )}
                >
                  {key === 'importance' ? 'Most important' : 'Newest'}
                </button>
              ))}
            </div>
          </div>
        )}

        {(active !== null || hasQuery) && !loading && sorted.length > 0 && (
          <div key={`${active ?? 'none'}-${trimmedQuery}-${sortBy}`} className="grid gap-4">
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
                <Card className="group relative flex flex-col overflow-hidden rounded-xl border-neutral-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-lg hover:shadow-neutral-300/50 sm:flex-row dark:border-neutral-800/80 dark:bg-gradient-to-b dark:from-neutral-900 dark:to-neutral-950 dark:hover:border-neutral-700 dark:hover:shadow-black/40">
                  <div className="flex min-w-0 flex-1 flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={cn(
                          'rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider',
                          categoryBadgeClass(article.category)
                        )}
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
                  </div>
                  {article.image && (
                    <ArticleImage src={article.image} alt={article.title} />
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
