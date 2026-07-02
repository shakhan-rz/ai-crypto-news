import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI + Crypto News",
  description: "The most important AI and crypto news, ranked by importance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
