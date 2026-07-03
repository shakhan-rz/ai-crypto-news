import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // The repo has a lockfile both at the parent (the news-fetching backend) and
  // here in frontend/. Pin the Turbopack root to the parent explicitly so Next
  // stops warning about the ambiguity — and so it can still resolve the shared
  // data/processed-articles.json that app/page.tsx imports from the parent.
  turbopack: {
    root: path.join(__dirname, ".."),
  },
};

export default nextConfig;
