'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowDown, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/neon-button'
import { HeroScene } from '@/components/hero-scene'
import {
  ArticleCard,
  ArticleSkeleton,
  FeaturedArticleCard,
} from '@/components/article-card'
import { CryptoPrices } from '@/components/crypto-prices'
import { NewsTicker } from '@/components/news-ticker'
import { BackToTop } from '@/components/back-to-top'
import { cn } from '@/lib/utils'
import { timeAgo } from '@/lib/format'
import { type Article } from '@/lib/articles'

export type { Article }

type FilterKey = 'all' | 'ai' | 'crypto'
type SortKey = 'importance' | 'newest'
type TimeKey = 'any' | 'day' | 'week'

const TIME_WINDOWS: Record<Exclude<TimeKey, 'any'>, number> = {
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
}

// Articles tagged "both" belong to the AI and the Crypto filter alike.
function inCategory(article: Article, key: 'ai' | 'crypto'): boolean {
  return article.category === key || article.category === 'both'
}

const PAGE_SIZE = 5

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

export function Home({
  articles,
  lastUpdated,
}: {
  articles: Article[]
  lastUpdated?: string
}) {
  // Default to "All" so visitors land on content, never an empty page.
  const [active, setActive] = useState<FilterKey | null>('all')
  const [query, setQuery] = useState('')
  const [shownCount, setShownCount] = useState(PAGE_SIZE)
  const [loading, setLoading] = useState(false)
  const [sortBy, setSortBy] = useState<SortKey>('importance')
  const [timeRange, setTimeRange] = useState<TimeKey>('any')

  const trimmedQuery = query.trim().toLowerCase()
  const hasQuery = trimmedQuery.length > 0

  // Let navbar links (/?cat=ai#news) preselect a category.
  useEffect(() => {
    const cat = new URLSearchParams(window.location.search).get('cat')
    if (cat === 'ai' || cat === 'crypto' || cat === 'all') {
      setActive(cat)
    }
  }, [])

  const counts = useMemo(
    () => ({
      all: articles.length,
      ai: articles.filter((a) => inCategory(a, 'ai')).length,
      crypto: articles.filter((a) => inCategory(a, 'crypto')).length,
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
          : articles.filter((a) => inCategory(a, active))

    const inWindow =
      timeRange === 'any'
        ? base
        : base.filter((a) => {
            const t = new Date(a.pubDate).getTime()
            return !Number.isNaN(t) && Date.now() - t <= TIME_WINDOWS[timeRange]
          })

    if (!hasQuery) return inWindow

    return inWindow.filter(
      (a) =>
        a.title.toLowerCase().includes(trimmedQuery) ||
        a.summary.toLowerCase().includes(trimmedQuery)
    )
  }, [articles, active, hasQuery, trimmedQuery, timeRange])

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
      <section className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 pt-16 pb-10 md:flex-row md:justify-between md:gap-8">
        <div className="text-center md:text-left">
          <h1 className="bg-gradient-to-b from-neutral-900 to-neutral-500 bg-clip-text text-4xl font-bold text-transparent dark:from-neutral-50 dark:to-neutral-400 md:text-6xl">
            <span className="bg-gradient-to-b from-orange-300 to-orange-600 bg-clip-text text-transparent">
              AI + Crypto
            </span>{' '}
            News
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-lg leading-relaxed text-neutral-600 dark:text-neutral-300 md:mx-0">
            Signal over noise. The AI and crypto stories that actually matter,
            ranked and summarized for you.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 md:justify-start">
            <a
              href="#news"
              className="inline-flex items-center gap-2 rounded-full border border-orange-500/60 bg-gradient-to-br from-orange-400 to-orange-600 px-6 py-2.5 text-sm font-semibold text-black shadow-[0_0_24px_rgba(249,115,22,0.45)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_36px_rgba(249,115,22,0.65)]"
            >
              Browse the news
              <ArrowDown className="h-4 w-4" />
            </a>
            <CryptoPrices />
          </div>

        </div>
        <HeroScene />
      </section>

      {/* Breaking headlines ticker */}
      <NewsTicker articles={articles} />
      <BackToTop />

      {/* News feed */}
      <section id="news" className="mx-auto max-w-5xl px-4 py-12 scroll-mt-16">
        <h2 className="mb-2 text-center text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Latest, ranked by importance
        </h2>
        {lastUpdated && timeAgo(lastUpdated) && (
          <p className="mb-6 text-center text-sm text-neutral-500">
            Updated {timeAgo(lastUpdated)}
          </p>
        )}

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

        {(active !== null || hasQuery) && (
          <div className="mb-8 flex items-center justify-center gap-2 text-sm">
            <span className="text-neutral-500">From</span>
            <div className="inline-flex overflow-hidden rounded-full border border-neutral-300 dark:border-neutral-800">
              {(
                [
                  ['any', 'All time'],
                  ['day', 'Last 24h'],
                  ['week', 'This week'],
                ] as [TimeKey, string][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    setTimeRange(key)
                    setShownCount(PAGE_SIZE)
                  }}
                  className={cn(
                    'px-3 py-1 text-xs font-medium transition-colors',
                    timeRange === key
                      ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-black'
                      : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {active === null && !hasQuery && (
          <p className="text-center text-base text-neutral-500">
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
          <div className="mb-4 flex items-center justify-between gap-2 text-sm">
            <span className="tabular-nums text-neutral-500">
              {sorted.length} {sorted.length === 1 ? 'story' : 'stories'}
            </span>
            <span className="ml-auto text-neutral-500">Sort by</span>
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
                {i === 0 ? (
                  <FeaturedArticleCard article={article} />
                ) : (
                  <ArticleCard article={article} />
                )}
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
