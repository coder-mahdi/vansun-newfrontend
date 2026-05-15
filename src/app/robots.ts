import type { MetadataRoute } from "next";

function publicSiteOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://vansunstudio.com"
  ).replace(/\/$/, "");
}

export default function robots(): MetadataRoute.Robots {
  const origin = publicSiteOrigin();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/staff/", "/consent-form/"],
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}
