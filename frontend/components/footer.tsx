import { Sparkles } from 'lucide-react'
import feeds from '../../config/feeds.json'

const SOURCES = feeds.map((f) => f.name)

export function Footer() {
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-white/40 backdrop-blur-sm dark:border-neutral-800/60 dark:bg-black/30">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 text-black">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                AI + Crypto News
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              The most important AI and crypto news, ranked by importance and
              summarized automatically.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              News sources
            </h3>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              {SOURCES.map((source) => (
                <li key={source} className="text-sm text-neutral-600 dark:text-neutral-400">
                  {source}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Links
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              <li>
                <a
                  href="#news"
                  className="text-sm text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                  Latest news
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/shakhan-rz/ai-crypto-news"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                  Source on GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-neutral-200 pt-6 text-center text-xs text-neutral-500 dark:border-neutral-800/40">
          © {new Date().getFullYear()} AI + Crypto News. Built for learning.
        </div>
      </div>
    </footer>
  )
}
