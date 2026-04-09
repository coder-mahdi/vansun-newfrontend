/**
 * Blog posts and videos from Vansun WordPress REST (`vansun/v1`).
 *
 * Plugin routes:
 * - GET `/content/blogs`
 * - GET `/content/videos`
 *
 * Base URL priority:
 * - `NEXT_PUBLIC_CONTENT_API_URL` (if set)
 * - `NEXT_PUBLIC_CONSENT_API_URL` (same WP namespace)
 * - `NEXT_PUBLIC_API_URL` (legacy fallback)
 */
import {
  blogPostsBySlug,
  blogSummaries as mockBlogSummaries,
  mockBlogVideos,
} from "@/data/blogs";
import { contentImageUrl } from "@/lib/content-assets";
import { parseYoutubeId } from "@/lib/youtube";
import type { BlogCategory, BlogPost, BlogSummary, BlogVideo } from "@/types/blog";

function apiBase(): string {
  const content = process.env.NEXT_PUBLIC_CONTENT_API_URL?.trim();
  if (content) return content;
  const wp = process.env.NEXT_PUBLIC_CONSENT_API_URL?.trim();
  if (wp) return wp;
  return process.env.NEXT_PUBLIC_API_URL?.trim() ?? "";
}

function trimSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

async function contentGet<T>(path: string): Promise<T> {
  const base = apiBase();
  const res = await fetch(`${trimSlash(base)}${path}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function categoryFromKeyword(keyword: string): BlogCategory {
  const s = keyword.toLowerCase();
  if (s.includes("pierc")) return "piercing";
  return "tattoo";
}

function asArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    const o = payload as Record<string, unknown>;
    if (Array.isArray(o.posts)) return o.posts;
    if (Array.isArray(o.data)) return o.data;
    if (Array.isArray(o.videos)) return o.videos;
    if (Array.isArray(o.items)) return o.items;
  }
  return [];
}

function normalizeCategory(raw: unknown): BlogCategory {
  const s = String(raw ?? "")
    .toLowerCase()
    .trim();
  if (s === "piercing" || s === "piercings") return "piercing";
  return "tattoo";
}

function normalizeBlogSummaryRow(row: unknown): BlogSummary | null {
  if (!row || typeof row !== "object") return null;
  const o = row as Record<string, unknown>;
  const title = String(o.title ?? "").trim();
  const slugRaw = String(o.slug ?? "").trim();
  const idRaw = String(o.id ?? "").trim();
  const slug =
    slugRaw || (title ? slugify(title) : "") || (idRaw ? `post-${idRaw}` : "");
  if (!slug || !title) return null;
  const excerptSource = String(
    o.excerpt ?? o.summary ?? o.content ?? o.body ?? o.html ?? ""
  ).trim();
  const excerpt = stripHtml(excerptSource).slice(0, 220) || title;
  const publishedAt = String(
    o.publishedAt ?? o.published_at ?? o.date ?? ""
  ).trim();
  const keyword = String(o.keyword ?? o.keywords ?? o.tag ?? "").trim() || "blog";
  const categoryRaw = o.category ?? o.type;
  const category =
    categoryRaw === undefined || categoryRaw === null
      ? categoryFromKeyword(keyword)
      : normalizeCategory(categoryRaw);
  const coverRaw =
    (o.coverImageUrl ?? o.cover_image_url ?? o.coverUrl ?? o.image) ?? null;
  const coverStr =
    typeof coverRaw === "string" && coverRaw.trim()
      ? coverRaw.trim()
      : undefined;
  const localFallback = String(o.coverFile ?? o.cover_file ?? "").trim();
  const coverImageUrl = coverStr
    ? coverStr
    : localFallback
      ? contentImageUrl(localFallback, null)
      : undefined;

  return {
    slug,
    title,
    excerpt,
    publishedAt: publishedAt || "1970-01-01",
    category,
    keyword,
    coverImageUrl,
  };
}

function normalizeBlogPostPayload(row: unknown): BlogPost | null {
  const base = normalizeBlogSummaryRow(row);
  if (!base) return null;
  if (!row || typeof row !== "object") return null;
  const o = row as Record<string, unknown>;
  const content = String(o.content ?? o.body ?? o.html ?? "").trim();
  if (!content) return null;
  return { ...base, content };
}

function normalizeVideoRow(row: unknown): BlogVideo | null {
  if (!row || typeof row !== "object") return null;
  const o = row as Record<string, unknown>;
  const title = String(o.title ?? "").trim();
  if (!title) return null;
  const excerpt = String(o.excerpt ?? o.description ?? "").trim() || title;
  const keyword = String(o.keyword ?? o.tag ?? "").trim() || "video";
  const rawYt =
    o.youtubeId ??
    o.youtube_id ??
    o.youtubeUrl ??
    o.youtube_url ??
    o.embedUrl ??
    o.embed_url;
  const ytId = parseYoutubeId(
    typeof rawYt === "string" ? rawYt : String(rawYt ?? "")
  );
  if (!ytId) return null;
  const id =
    String(o.id ?? o.uuid ?? "").trim() ||
    `${ytId}-${title.slice(0, 48).replace(/\s+/g, "-")}`;
  const categoryRaw = o.category ?? o.type;
  const category =
    categoryRaw === undefined || categoryRaw === null
      ? undefined
      : normalizeCategory(categoryRaw);
  return { id, title, excerpt, keyword, youtubeId: ytId, category };
}

export async function fetchBlogSummaries(): Promise<BlogSummary[]> {
  const base = apiBase();
  if (!base) return [...mockBlogSummaries];

  try {
    const payload = await contentGet<unknown>("/content/blogs");
    const rows = asArray(payload);
    const out = rows
      .map(normalizeBlogSummaryRow)
      .filter(Boolean) as BlogSummary[];
    if (out.length > 0) {
      return out.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    }
  } catch {
    /* use mock */
  }
  return [...mockBlogSummaries];
}

export async function fetchBlogPost(slug: string): Promise<BlogPost | null> {
  const base = apiBase();
  if (!base) {
    return blogPostsBySlug[slug] ?? null;
  }

  try {
    const payload = await contentGet<unknown>("/content/blogs");
    const rows = asArray(payload);
    const match = rows.find((row) => {
      const summary = normalizeBlogSummaryRow(row);
      return summary?.slug === slug;
    });
    const post = normalizeBlogPostPayload(match);
    if (post) return post;
  } catch {
    /* fallback */
  }

  return blogPostsBySlug[slug] ?? null;
}

export async function fetchBlogVideos(): Promise<BlogVideo[]> {
  const base = apiBase();
  if (!base) return [...mockBlogVideos];

  try {
    const payload = await contentGet<unknown>("/content/videos");
    const rows = asArray(payload);
    const out = rows
      .map(normalizeVideoRow)
      .filter(Boolean) as BlogVideo[];
    if (out.length > 0) return out;
  } catch {
    /* mock */
  }
  return [...mockBlogVideos];
}
