# AI + Crypto News

Collects RSS news from AI and crypto sources, summarizes and scores them with AI,
and displays them in a Next.js frontend with a 3D Spline robot and a filterable news feed.

## Project Structure

```
.
├── config/feeds.json          # List of 8 RSS sources (AI / crypto)
├── src/fetchFeeds.js          # Reads feeds -> data/raw-articles.json
├── src/processArticles.js     # Summarizes + scores with AI -> data/processed-articles.json
├── data/                      # Output data (frontend reads from processed-articles.json)
└── frontend/                  # Next.js app (App Router + Tailwind + shadcn)
```

## Requirements

- Node.js 20 or later
- API key for at least one provider: Gemini, Groq, or OpenRouter

## Setup

1. Install packages (both root and frontend):

```bash
npm install
cd frontend && npm install && cd ..
```

2. Create a `.env` file from the example and add your keys:

```bash
cp .env.example .env      # on Windows: copy .env.example .env
```

## Running the Data Pipeline

```bash
npm run fetch      # fetches feeds -> data/raw-articles.json
npm run process    # summarizes and scores -> data/processed-articles.json
# or run both together:
npm run pipeline
```

> If you only want to view the frontend, `data/processed-articles.json` is already
> included in the repo, so you don't need to run the pipeline.

## Running the Frontend

```bash
cd frontend
npm run dev        # http://localhost:3000
```

The frontend reads `../data/processed-articles.json`, so this file must exist.
