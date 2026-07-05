# AI + Crypto News

**Live site: [ai-crypto-news-ten.vercel.app](https://ai-crypto-news-ten.vercel.app)**

An automated news aggregator for AI and crypto. It fetches articles from 8 RSS
sources, then uses a multi-provider LLM pipeline to classify each story
(AI / crypto / both), score its importance from 1–10, and write a short
summary. The result is a fast, filterable news site that updates itself every
3 hours via GitHub Actions and deploys automatically to Vercel.

## Features

- **Ranked feed** — stories sorted by AI-assigned importance, with a featured
  "Top story" card and Hot badges for high-impact news
- **Category filters** — AI / Crypto / All, plus full-text search and time
  windows (24h / week)
- **Live market data** — BTC & ETH prices (CoinGecko, refreshed every 60s) and
  the Crypto Fear & Greed index rendered as a mini gauge in the navbar
- **Article pages** — statically generated, SEO-friendly pages with summaries,
  related stories, and links to the original source
- **Breaking-news ticker** — an auto-scrolling strip of the hottest headlines
- **3D hero** — an interactive Spline robot that follows the cursor (skipped
  entirely on mobile to keep the page light)

## How It Works

```
RSS feeds ──> fetchFeeds.js ──> raw articles
                                    │
                                    ▼
                          processArticles.js
                    (classify + score + summarize)
                                    │
              Gemini → Groq → OpenRouter → Cerebras
                     → Mistral → GitHub Models
              (fallback chain with a circuit breaker:
               rate-limited providers are skipped)
                                    │
                                    ▼
                     data/processed-articles.json
                                    │
                                    ▼
                     Next.js frontend (Vercel)
```

A GitHub Actions workflow (`.github/workflows/update-news.yml`) runs the
pipeline every 3 hours, commits the refreshed data, and Vercel redeploys the
site automatically. Already-classified articles are cached, so each run only
sends new articles to the LLMs.

## Project Structure

```
.
├── config/feeds.json          # The 8 RSS sources (AI / crypto)
├── src/fetchFeeds.js          # Fetches feeds -> data/raw-articles.json
├── src/processArticles.js     # Multi-LLM classify/score/summarize pipeline
├── data/                      # processed-articles.json (read by the frontend)
├── frontend/                  # Next.js 16 app (App Router, Tailwind, shadcn)
└── .github/workflows/         # Scheduled pipeline + auto-commit
```

## Requirements

- Node.js 20+
- An API key for at least one LLM provider (all have free tiers):
  Gemini, Groq, OpenRouter, Cerebras, or Mistral

## Setup

1. Install dependencies (root and frontend):

```bash
npm install
cd frontend && npm install && cd ..
```

2. Create a `.env` file from the example and add your keys:

```bash
cp .env.example .env      # on Windows: copy .env.example .env
```

Any subset of keys works — the pipeline uses whichever providers are
configured, in order, and falls through on rate limits.

## Running the Data Pipeline

```bash
npm run fetch      # fetch feeds   -> data/raw-articles.json
npm run process    # classify etc. -> data/processed-articles.json
npm run pipeline   # both steps
```

> To just browse the site, you can skip this: `data/processed-articles.json`
> is kept up to date in the repo by the scheduled workflow.

## Running the Frontend

```bash
cd frontend
npm run dev        # http://localhost:3000
```

## Deployment

- **Vercel** — the frontend deploys from the `frontend/` directory on every
  push to `main`
- **GitHub Actions** — add your provider keys as repository secrets
  (`GEMINI_API_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`, `CEREBRAS_API_KEY`,
  `MISTRAL_API_KEY`); the workflow also uses the built-in `GITHUB_TOKEN` for
  the GitHub Models provider
