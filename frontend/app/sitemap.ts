import type { MetadataRoute } from 'next'
import { articleSlug, getArticles, getLastUpdated } from '@/lib/articles'

const BASE = 'https://ai-crypto-news-ten.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(getLastUpdated())
  return [
    { url: BASE, lastModified, changeFrequency: 'hourly', priority: 1 },
    ...getArticles().map((a) => ({
      url: `${BASE}/article/${articleSlug(a)}`,
      lastModified: new Date(a.pubDate),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    })),
  ]
}
