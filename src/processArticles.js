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
  return `Read the news article below and return ONLY a valid JSON object with exactly these two keys, with no extra text or explanation:
{"summary": "a 2-3 sentence summary of the article in English", "importance": an integer between 1 and 10}

Score importance based on how significant and noteworthy this news is for an AI and crypto community (10 = highly important, 1 = not important).

Title: ${article.title}
Content: ${article.content}`;
}

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
  return { summary, importance };
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
      const { summary, importance } = parseModelResponse(text);
      const status = failedProviders.length
        ? `${failedProviders.join(' failed, ')} failed, processed via ${provider.name}`
        : `processed via ${provider.name}`;
      console.log(`Article ${index + 1}/${total}: ${status}`);
      return { ...article, summary, importance };
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
  const processed = [];

  for (let i = 0; i < rawArticles.length; i++) {
    const result = await processArticle(rawArticles[i], i, rawArticles.length);
    processed.push(result);
    if (i < rawArticles.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  processed.sort((a, b) => b.importance - a.importance);

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(processed, null, 2), 'utf-8');
  console.log(`Saved ${processed.length} processed articles to ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error('Script stopped due to an error:', err.message);
  process.exit(1);
});
