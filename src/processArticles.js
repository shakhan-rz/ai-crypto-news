require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');

const DATA_DIR = path.join(__dirname, '..', 'data');
const INPUT_FILE = path.join(DATA_DIR, 'raw-articles.json');
const OUTPUT_FILE = path.join(DATA_DIR, 'processed-articles.json');
const DELAY_MS = 500;
const DEFAULT_SCORE = 5;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildPrompt(article) {
  return `Read the news article below and return ONLY a valid JSON object with exactly these three keys, with no extra text or explanation:
{"summary": "a 2-3 sentence summary of the article in English", "importance": an integer between 1 and 10, "category": "ai" or "crypto" or "both"}

Score importance based on how significant and noteworthy this news is for an AI and crypto community (10 = highly important, 1 = not important).

Choose category based on the article's actual topic, not its publisher: "ai" if it is about artificial intelligence, "crypto" if it is about cryptocurrency/blockchain, "both" if it genuinely covers both.

Title: ${article.title}
Content: ${article.content}`;
}

const VALID_CATEGORIES = new Set(['ai', 'crypto', 'both']);

function parseModelResponse(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error('model response did not contain valid JSON');
  }
  const parsed = JSON.parse(match[0]);
  const summary = String(parsed.summary || '').trim();
  let importance = Number(parsed.importance);
  if (!summary || Number.isNaN(importance)) {
    throw new Error('response missing summary/importance fields');
  }
  importance = Math.max(1, Math.min(10, Math.round(importance)));
  const category = String(parsed.category || '').trim().toLowerCase();
  return {
    summary,
    importance,
    category: VALID_CATEGORIES.has(category) ? category : null,
  };
}

async function callGemini(prompt) {
  const result = await geminiModel.generateContent(prompt);
  return result.response.text();
}

async function callGroq(prompt) {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
  });
  return completion.choices[0].message.content;
}

async function callOpenRouter(prompt) {
  const completion = await openrouter.chat.completions.create({
    model: 'meta-llama/llama-3.3-70b-instruct:free',
    messages: [{ role: 'user', content: prompt }],
  });
  return completion.choices[0].message.content;
}

const PROVIDERS = [
  { name: 'Gemini', call: callGemini },
  { name: 'Groq', call: callGroq },
  { name: 'OpenRouter', call: callOpenRouter },
];

async function processArticle(article, index, total) {
  const prompt = buildPrompt(article);
  const failedProviders = [];

  for (const provider of PROVIDERS) {
    try {
      const text = await provider.call(prompt);
      const { summary, importance, category } = parseModelResponse(text);
      const status = failedProviders.length
        ? `${failedProviders.join(' failed, ')} failed, processed via ${provider.name}`
        : `processed via ${provider.name}`;
      console.log(`Article ${index + 1}/${total}: ${status}`);
      // Fall back to the feed's category if the model returned an invalid one.
      // `classified` marks that the category came from the model, so cached
      // pre-classification entries (feed-based labels) get reprocessed once.
      return {
        ...article,
        summary,
        importance,
        category: category || article.category,
        classified: true,
      };
    } catch (err) {
      console.error(`Article ${index + 1}/${total}: ${provider.name} failed - ${err.message}`);
      failedProviders.push(provider.name);
    }
  }

  console.error(`Article ${index + 1}/${total}: all providers failed, using default score`);
  return { ...article, summary: '', importance: DEFAULT_SCORE };
}

async function main() {
  if (!process.env.GEMINI_API_KEY || !process.env.GROQ_API_KEY || !process.env.OPENROUTER_API_KEY) {
    throw new Error('GEMINI_API_KEY, GROQ_API_KEY and OPENROUTER_API_KEY must all be set in .env');
  }

  const rawArticles = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));

  // Reuse results from the previous run so only new articles hit the LLMs —
  // otherwise every 3-hour run reprocesses all ~145 articles and burns through
  // the free-tier quotas of all three providers.
  let cache = new Map();
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      const previous = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
      // Entries with an empty summary are earlier failures — leave them out of
      // the cache so they get retried.
      cache = new Map(
        previous
          .filter((a) => a.link && a.summary && a.classified)
          .map((a) => [a.link, a])
      );
    } catch {
      // corrupt/missing previous output — process everything from scratch
    }
  }

  const processed = [];
  let reused = 0;

  for (let i = 0; i < rawArticles.length; i++) {
    const article = rawArticles[i];
    const cached = cache.get(article.link);
    if (cached) {
      processed.push({
        ...article,
        summary: cached.summary,
        importance: cached.importance,
        category: cached.category || article.category,
        classified: true,
      });
      reused++;
      continue;
    }
    const result = await processArticle(article, i, rawArticles.length);
    processed.push(result);
    if (i < rawArticles.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  console.log(`Reused ${reused} cached articles, processed ${processed.length - reused} new ones`);

  processed.sort((a, b) => b.importance - a.importance);

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(processed, null, 2), 'utf-8');
  console.log(`Saved ${processed.length} processed articles to ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error('Script stopped due to an error:', err.message);
  process.exit(1);
});
