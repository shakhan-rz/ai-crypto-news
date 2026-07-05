import type { Metadata } from "next";
import { Geist_Mono, Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

// Body font — clean and highly readable.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Heading font — geometric, techy, fits the AI/crypto vibe.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ai-crypto-news-ten.vercel.app"),
  title: {
    default: "AI + Crypto News",
    template: "%s | AI + Crypto News",
  },
  description:
    "Signal over noise. The most important AI and crypto news, ranked by importance and summarized for you.",
  keywords: ["AI news", "crypto news", "artificial intelligence", "bitcoin", "blockchain"],
  openGraph: {
    type: "website",
    siteName: "AI + Crypto News",
    title: "AI + Crypto News",
    description:
      "Signal over noise. The most important AI and crypto news, ranked by importance and summarized for you.",
  },
  twitter: {
    card: "summary",
    title: "AI + Crypto News",
    description:
      "The most important AI and crypto news, ranked by importance.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Warm up the connections to the CDNs that host the 3D robot so the
            browser can start fetching it in parallel with the rest of the page. */}
        <link rel="preconnect" href="https://prod.spline.design" crossOrigin="" />
        <link rel="preconnect" href="https://unpkg.com" crossOrigin="" />
        {/* Kick off the heavy scene download during initial HTML parse, before
            React hydrates and lazy-loads the Spline runtime. */}
        <link
          rel="preload"
          as="fetch"
          href="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
          crossOrigin=""
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
