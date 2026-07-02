const fs = require('fs');
const path = require('path');
const Parser = require('rss-parser');

const feeds = require('../config/feeds.json');

const parser = new Parser();

const DATA_DIR = path.join(__dirname, '..', 'data');
const OUTPUT_FILE = path.join(DATA_DIR, 'raw-articles.json');

async function fetchFeed(feed) {
  try {
    const parsed = await parser.parseURL(feed.url);
    return parsed.items.map((item) => ({
      title: item.title || '',
      link: item.link || '',
      pubDate: item.pubDate || item.isoDate || '',
      source: feed.name,
      category: feed.category,
      content: item.contentSnippet || item.content || item.summary || '',
    }));
  } catch (err) {
    console.error(`خطا در گرفتن فید "${feed.name}": ${err.message}`);
    return [];
  }
}

async function main() {
  const results = await Promise.all(feeds.map(fetchFeed));
  const articles = results.flat();

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(articles, null, 2), 'utf-8');
  console.log(`${articles.length} خبر از ${feeds.length} منبع ذخیره شد در ${OUTPUT_FILE}`);
}

main();
