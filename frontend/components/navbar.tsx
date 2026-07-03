'use client'

import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.05-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.31-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.05.14 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.24 2.87.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.21.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" />
    </svg>
  )
}

function fearGreedColor(value: number): string {
  if (value <= 25) return 'text-red-500 dark:text-red-400'
  if (value <= 45) return 'text-orange-500 dark:text-orange-400'
  if (value <= 55) return 'text-yellow-500 dark:text-yellow-400'
  if (value <= 75) return 'text-lime-500 dark:text-lime-400'
  return 'text-emerald-500 dark:text-emerald-400'
}

function FearGreed() {
  const [data, setData] = useState<{ value: number; label: string } | null>(null)

  useEffect(() => {
    const ctrl = new AbortController()
    fetch('https://api.alternative.me/fng/', { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        const d = json?.data?.[0]
        if (d) {
          setData({ value: Number(d.value), label: d.value_classification })
        }
      })
      .catch(() => {})
    return () => ctrl.abort()
  }, [])

  if (!data) return null

  return (
    <span
      title="Crypto Fear & Greed Index"
      className="hidden items-center gap-1.5 rounded-full border border-neutral-300 px-2.5 py-1 text-xs font-medium tabular-nums sm:flex dark:border-neutral-800"
    >
      <span className="text-neutral-500">Fear &amp; Greed</span>
      <span className={cn('font-semibold', fearGreedColor(data.value))}>
        {data.value}
      </span>
      <span className={cn('hidden md:inline', fearGreedColor(data.value))}>
        {data.label}
      </span>
    </span>
  )
}

const NAV_LINKS = [
  { label: 'AI', href: '/?cat=ai#news' },
  { label: 'Crypto', href: '/?cat=crypto#news' },
] as const

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-neutral-200 bg-white/70 shadow-sm backdrop-blur-md dark:border-neutral-800/60 dark:bg-black/60'
          : 'border-b border-transparent bg-transparent'
      )}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <a href="/#top" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 text-black">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            AI + Crypto News
          </span>
        </a>

        <div className="flex items-center gap-1">
          <FearGreed />
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="rounded-full px-3 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-200 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-100"
            >
              {label}
            </a>
          ))}
          <a
            href="https://github.com/shakhan-rz/ai-crypto-news"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View source on GitHub"
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-200 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-100"
          >
            <GithubIcon className="h-4 w-4" />
          </a>
        </div>
      </nav>
    </header>
  )
}
