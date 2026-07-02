const fs = require('fs');
const path = require('path');
const Parser = require('rss-parser');

const feeds = require('../config/feeds.json');

const parser = new Parser({
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  },
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: true }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: true }],
    ],
  },
});

// RSS feeds expose images in inconsistent places: <enclosure>, <media:content>,
// <media:thumbnail>, or just an <img> inside the HTML content. Try each in turn.
function extractImage(item) {
  if (item.enclosure && item.enclosure.url && /^https?:\/\//.test(item.enclosure.url)) {
    if (!item.enclosure.type || item.enclosure.type.startsWith('image')) {
      return item.enclosure.url;
    }
  }

  const media = []
    .concat(item.mediaContent || [])
    .concat(item.mediaThumbnail || []);
  for (const m of media) {
    const url = m && m.$ && m.$.url;
    if (url && /^https?:\/\//.test(url)) return url;
  }

  const html = item['content:encoded'] || item.content || '';
  const imgMatch = /<img[^>]+src=["']([^"']+)["']/i.exec(html);
  if (imgMatch && /^https?:\/\//.test(imgMatch[1])) return imgMatch[1];

  return '';
}

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
      image: extractImage(item),
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
