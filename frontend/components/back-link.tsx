'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

// Goes back in browser history (preserving the reader's filters and scroll
// position on the home page) and only falls back to "/" when the article was
// opened directly, e.g. from a shared link.
export function BackLink() {
  const router = useRouter()

  return (
    <button
      onClick={() => {
        if (window.history.length > 1) {
          router.back()
        } else {
          router.push('/')
        }
      }}
      className="mb-8 inline-flex items-center gap-1.5 text-sm text-neutral-400 transition-colors hover:text-neutral-100"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to all news
    </button>
  )
}
