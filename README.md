# AI + Crypto News

RSS خبرها را از منابع AI و کریپتو جمع می‌کند، با هوش مصنوعی خلاصه و امتیازدهی می‌کند،
و در یک فرانت‌اند Next.js با یک ربات سه‌بعدی Spline و بخش خبری فیلترشونده نمایش می‌دهد.

## ساختار پروژه

```
.
├── config/feeds.json          # لیست ۸ منبع RSS (AI / crypto)
├── src/fetchFeeds.js          # خواندن فیدها -> data/raw-articles.json
├── src/processArticles.js     # خلاصه + امتیاز با AI -> data/processed-articles.json
├── data/                      # خروجی دیتا (فرانت از processed-articles.json می‌خواند)
└── frontend/                  # اپ Next.js (App Router + Tailwind + shadcn)
```

## پیش‌نیازها

- Node.js 20 یا بالاتر
- کلید API حداقل یکی از سه ارائه‌دهنده: Gemini، Groq، OpenRouter

## راه‌اندازی

۱. نصب پکیج‌ها (هم ریشه، هم فرانت‌اند):

```bash
npm install
cd frontend && npm install && cd ..
```

۲. ساخت فایل `.env` از روی نمونه و گذاشتن کلیدها:

```bash
cp .env.example .env      # روی ویندوز: copy .env.example .env
```

## اجرای پایپلاین دیتا

```bash
npm run fetch      # فیدها را می‌گیرد -> data/raw-articles.json
npm run process    # خلاصه و امتیاز می‌دهد -> data/processed-articles.json
# یا هر دو با هم:
npm run pipeline
```

> اگر فقط می‌خواهی فرانت را ببینی، `data/processed-articles.json` از قبل توی ریپو هست
> و لازم نیست پایپلاین را اجرا کنی.

## اجرای فرانت‌اند

```bash
cd frontend
npm run dev        # http://localhost:3000
```

فرانت‌اند فایل `../data/processed-articles.json` را می‌خواند، پس این فایل باید موجود باشد.
