import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

/** When a lockfile exists above this repo, Next may infer the wrong root and skip `.env.local` here. */
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/** Allow `next/image` for API/CMS origins from env (gallery, blog covers, etc.). */
function remotePatternsFromEnv(): NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
> {
  const raw = [
    process.env.NEXT_PUBLIC_API_URL,
    process.env.NEXT_PUBLIC_CONTENT_API_URL,
    process.env.NEXT_PUBLIC_CONSENT_API_URL,
    process.env.NEXT_PUBLIC_CMS_API_URL,
    process.env.NEXT_PUBLIC_CMS_SITE_URL,
  ].filter(Boolean) as string[];
  const seen = new Set<string>();
  const patterns: NonNullable<
    NonNullable<NextConfig["images"]>["remotePatterns"]
  > = [];
  for (const u of raw) {
    try {
      const url = new URL(u);
      const key = `${url.protocol}//${url.host}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const protocol = url.protocol.replace(":", "") as "http" | "https";
      const entry: (typeof patterns)[number] = {
        protocol,
        hostname: url.hostname,
        pathname: "/**",
      };
      if (url.port) {
        entry.port = url.port;
      }
      patterns.push(entry);
    } catch {
      /* invalid base URL */
    }
  }
  return patterns;
}

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  async redirects() {
    return [
      {
        source: "/blogs/:slug",
        destination: "/b/:slug",
        permanent: true,
      },
      {
        source: "/blog/:slug",
        destination: "/b/:slug",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/**",
      },
      ...remotePatternsFromEnv(),
    ],
  },
};

export default nextConfig;
