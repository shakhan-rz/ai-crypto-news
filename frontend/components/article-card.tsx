'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Flame, Share2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { timeAgo } from '@/lib/format'
import { articleSlug, type Article } from '@/lib/articles'

function categoryBadgeClass(category: string): string {
  if (category === 'ai') {
    return 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300'
  }
  if (category === 'crypto') {
    return 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300'
  }
  if (category === 'both') {
    return 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300'
  }
  return 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800/80 dark:text-neutral-300'
}

function scoreColor(score: number) {
  if (score >= 8) return 'text-emerald-500 dark:text-emerald-400'
  if (score >= 5) return 'text-amber-500 dark:text-amber-400'
  return 'text-neutral-500 dark:text-neutral-400'
}

// Thin edge bar mirroring the importance score, so ranking reads at a glance.
function scoreBarClass(score: number) {
  if (score >= 8) return 'bg-emerald-500/70'
  if (score >= 5) return 'bg-amber-500/60'
  return 'bg-neutral-600/50'
}

// Shared "floating glass" card look: translucent surface + hairline border,
// warming up with an orange glow on hover.
const glassCard =
  'group relative overflow-hidden rounded-xl border-neutral-200 bg-white transition-all duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:scale-[1.01] hover:border-orange-300 hover:shadow-lg hover:shadow-orange-500/10 dark:border-white/[0.08] dark:bg-white/[0.04] dark:backdrop-blur-md dark:hover:border-orange-500/40 dark:hover:bg-white/[0.06] dark:hover:shadow-xl dark:hover:shadow-orange-500/10'

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

    const url = `${window.location.origin}/article/${articleSlug(article)}`

    if (navigator.share) {
      try {
        await navigator.share({ title: article.title, url })
        return
      } catch {
        // user cancelled or share failed — fall back to copy
      }
    }

    try {
      await navigator.clipboard.writeText(url)
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

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Card className={cn(glassCard, 'flex flex-col sm:flex-row')}>
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-y-0 left-0 z-10 w-1',
          scoreBarClass(article.importance)
        )}
      />
      <div className="flex min-w-0 flex-1 flex-col pl-1">
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
            {article.importance >= 8 && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-red-700 dark:bg-red-500/15 dark:text-red-400"
              >
                <Flame className="h-3 w-3" />
                Hot
              </Badge>
            )}
            <span className="text-xs text-neutral-500">{article.source}</span>
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
          <CardTitle className="mt-2 text-lg leading-snug text-neutral-900 transition-colors group-hover:text-black dark:text-neutral-100 dark:group-hover:text-white">
            <Link
              href={`/article/${articleSlug(article)}`}
              className="after:absolute after:inset-0"
            >
              {article.title}
            </Link>
          </CardTitle>
        </CardHeader>
        {article.summary && (
          <CardContent className="pt-0">
            <p className="line-clamp-3 text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-400">
              {article.summary}
            </p>
          </CardContent>
        )}
      </div>
      {article.image && <ArticleImage src={article.image} alt={article.title} />}
    </Card>
  )
}

// Magazine-style lead card for the top-ranked story: full-width image,
// oversized headline.
export function FeaturedArticleCard({ article }: { article: Article }) {
  return (
    <Card className={cn(glassCard, 'flex flex-col')}>
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-y-0 left-0 z-10 w-1',
          scoreBarClass(article.importance)
        )}
      />
      {article.image && (
        <div className="relative h-56 w-full overflow-hidden bg-neutral-100 md:h-72 dark:bg-neutral-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.image}
            alt={article.title}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col pl-1">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-orange-700 dark:bg-orange-500/15 dark:text-orange-300"
            >
              <Flame className="h-3 w-3" />
              Top story
            </Badge>
            <Badge
              variant="secondary"
              className={cn(
                'rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider',
                categoryBadgeClass(article.category)
              )}
            >
              {article.category}
            </Badge>
            <span className="text-xs text-neutral-500">{article.source}</span>
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
          <CardTitle className="mt-3 text-2xl font-bold leading-tight text-neutral-900 transition-colors group-hover:text-black md:text-3xl dark:text-neutral-100 dark:group-hover:text-white">
            <Link
              href={`/article/${articleSlug(article)}`}
              className="after:absolute after:inset-0"
            >
              {article.title}
            </Link>
          </CardTitle>
        </CardHeader>
        {article.summary && (
          <CardContent className="pt-0">
            <p className="line-clamp-3 text-base leading-relaxed text-neutral-600 dark:text-neutral-300">
              {article.summary}
            </p>
          </CardContent>
        )}
      </div>
    </Card>
  )
}

export function ArticleSkeleton() {
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
