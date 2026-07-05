import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ExternalLink } from 'lucide-react'
import { BackLink } from '@/components/back-link'
import { ShaderBackground } from '@/components/ui/shader-background'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  articleSlug,
  getArticleBySlug,
  getArticles,
  getRelatedArticles,
} from '@/lib/articles'

export function generateStaticParams() {
  return getArticles().map((a) => ({ slug: articleSlug(a) }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) return { title: 'Article not found' }
  return {
    title: article.title,
    description: article.summary || article.content,
    openGraph: {
      title: article.title,
      description: article.summary || article.content,
      type: 'article',
      publishedTime: new Date(article.pubDate).toISOString(),
      ...(article.image ? { images: [article.image] } : {}),
    },
    twitter: {
      card: article.image ? 'summary_large_image' : 'summary',
      title: article.title,
      description: article.summary || article.content,
    },
  }
}

function categoryBadgeClass(category: string): string {
  if (category === 'ai') return 'bg-sky-500/15 text-sky-300'
  if (category === 'crypto') return 'bg-orange-500/15 text-orange-300'
  if (category === 'both') return 'bg-violet-500/15 text-violet-300'
  return 'bg-neutral-800/80 text-neutral-300'
}

function formatDate(pubDate: string): string {
  const d = new Date(pubDate)
  if (Number.isNaN(d.getTime())) return pubDate
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) notFound()

  const related = getRelatedArticles(article)

  return (
    <main className="relative min-h-screen bg-black">
      <ShaderBackground className="z-0" />
      <div className="relative z-10">
        <Navbar />

        <article className="mx-auto max-w-3xl px-4 py-12">
          <BackLink />

          <div className="rounded-2xl border border-neutral-800/60 bg-black/70 p-6 shadow-2xl backdrop-blur-md md:p-10">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className={cn(
                'rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider',
                categoryBadgeClass(article.category)
              )}
            >
              {article.category}
            </Badge>
            <span className="text-sm text-neutral-400">{article.source}</span>
            <span className="text-neutral-600">·</span>
            <time className="text-sm text-neutral-400">
              {formatDate(article.pubDate)}
            </time>
            <span className="ml-auto flex shrink-0 items-center gap-1 rounded-full bg-neutral-800/60 px-2.5 py-0.5 text-sm font-semibold tabular-nums">
              <span className="text-orange-400">{article.importance}</span>
              <span className="text-neutral-500">/10</span>
            </span>
          </div>

          <h1 className="mt-4 bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-3xl font-bold leading-tight text-transparent md:text-4xl">
            {article.title}
          </h1>

          {article.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.image}
              alt={article.title}
              referrerPolicy="no-referrer"
              className="mt-8 w-full rounded-xl border border-neutral-800/80 object-cover"
            />
          )}

          {article.summary && (
            <p className="mt-8 text-lg leading-relaxed text-neutral-200">
              {article.summary}
            </p>
          )}

          {article.content && article.content !== article.summary && (
            <p className="mt-4 leading-relaxed text-neutral-400">
              {article.content}
            </p>
          )}

          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-orange-500/60 bg-gradient-to-br from-orange-400 to-orange-600 px-6 py-2.5 text-sm font-semibold text-black shadow-sm shadow-orange-500/30 transition-transform hover:scale-[1.02]"
          >
            Read the full story at {article.source}
            <ExternalLink className="h-4 w-4" />
          </a>

          {related.length > 0 && (
            <section className="mt-16">
              <h2 className="mb-4 text-xl font-bold text-neutral-100">
                Related news
              </h2>
              <div className="grid gap-3">
                {related.map((r) => (
                  <Link
                    key={r.link}
                    href={`/article/${articleSlug(r)}`}
                    className="group rounded-xl border border-neutral-800/80 bg-gradient-to-b from-neutral-900 to-neutral-950 p-4 transition-colors hover:border-neutral-700"
                  >
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <span>{r.source}</span>
                      <span className="ml-auto tabular-nums">
                        <span className="text-orange-400">{r.importance}</span>
                        /10
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm font-medium leading-snug text-neutral-200 transition-colors group-hover:text-white">
                      {r.title}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
          </div>
        </article>

        <Footer />
      </div>
    </main>
  )
}
