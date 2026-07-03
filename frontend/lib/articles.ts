import rawArticles from '../../data/processed-articles.json'

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

// Stable short hash so two articles with identical titles still get unique slugs.
function hash(str: string): string {
  let h = 5381
  for (let i = 0; i < str.length; i++) {
    h = (h * 33) ^ str.charCodeAt(i)
  }
  return (h >>> 0).toString(36)
}

export function articleSlug(article: Article): string {
  const base = article.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '')
  return `${base}-${hash(article.link)}`
}

const articles: Article[] = [...(rawArticles as Article[])].sort(
  (a, b) => b.importance - a.importance
)

export function getArticles(): Article[] {
  return articles
}

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => articleSlug(a) === slug)
}

export function getRelatedArticles(article: Article, limit = 4): Article[] {
  const self = articleSlug(article)
  return articles
    .filter((a) => a.category === article.category && articleSlug(a) !== self)
    .slice(0, limit)
}

export function getLastUpdated(): string {
  const newest = articles.reduce((max, a) => {
    const t = new Date(a.pubDate).getTime()
    return Number.isNaN(t) ? max : Math.max(max, t)
  }, 0)
  return newest ? new Date(newest).toISOString() : new Date().toISOString()
}
