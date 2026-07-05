import Link from 'next/link'
import { Flame } from 'lucide-react'
import { articleSlug, type Article } from '@/lib/articles'

export function NewsTicker({ articles }: { articles: Article[] }) {
  const hot = articles.filter((a) => a.importance >= 8).slice(0, 12)
  if (hot.length < 3) return null

  // Two copies of the list make the CSS loop seamless.
  const items = [...hot, ...hot]

  return (
    <div className="relative overflow-hidden border-y border-neutral-200 bg-white/40 py-2.5 backdrop-blur-sm dark:border-neutral-800/80 dark:bg-black/40">
      <div className="ticker-track">
        {items.map((a, i) => (
          <Link
            key={`${a.link}-${i}`}
            href={`/article/${articleSlug(a)}`}
            className="group flex shrink-0 items-center gap-2 px-6 text-sm text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
          >
            <Flame className="h-3.5 w-3.5 shrink-0 text-red-500 dark:text-red-400" />
            <span className="max-w-md truncate">{a.title}</span>
            <span className="text-xs text-neutral-400 dark:text-neutral-600">·</span>
            <span className="shrink-0 text-xs text-neutral-500">{a.source}</span>
          </Link>
        ))}
      </div>
      {/* Edge fades so headlines dissolve instead of hard-clipping */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent dark:from-black" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent dark:from-black" />
    </div>
  )
}
