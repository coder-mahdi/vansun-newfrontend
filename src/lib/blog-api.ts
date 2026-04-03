/**
 * Blog posts and videos from `NEXT_PUBLIC_API_URL` (JSON).
 *
 * Expected shapes (adjust paths or mappers when your backend differs):
 *
 * **GET /blogs** — array or `{ posts: [...] }` or `{ data: [...] }`
 * Each item: `slug`, `title`, `excerpt` | `summary`, `publishedAt` | `published_at`,
 * `category` (`tattoo` | `piercing`), `keyword`, optional `coverImageUrl` | `cover_image_url`.
 *
 * **GET /blogs/{slug}** — object or `{ post: {...} }` with same fields plus `content` | `body` | `html`.
 *
 * **GET /blog-videos** — array or `{ videos: [...] }`; each: `id`, `title`, `excerpt` | `description`,
 * `keyword`, `youtubeId` | `youtube_id` | `youtubeUrl` | `youtube_url`.
 */
import {
  blogPostsBySlug,
  blogSummaries as mockBlogSummaries,
  mockBlogVideos,
} from "@/data/blogs";
import { apiGet } from "@/lib/api";
import { contentImageUrl } from "@/lib/content-assets";
import { parseYoutubeId } from "@/lib/youtube";
import type { BlogCategory, BlogPost, BlogSummary, BlogVideo } from "@/types/blog";

function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL?.trim() ?? "";
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
  const slug = String(o.slug ?? "").trim();
  const title = String(o.title ?? "").trim();
  if (!slug || !title) return null;
  const excerpt = String(o.excerpt ?? o.summary ?? "").trim() || title;
  const publishedAt = String(
    o.publishedAt ?? o.published_at ?? o.date ?? ""
  ).trim();
  const keyword = String(o.keyword ?? o.keywords ?? o.tag ?? "").trim() || "blog";
  const category = normalizeCategory(o.category ?? o.type);
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

function unwrapPostPayload(payload: unknown): unknown {
  if (!payload || typeof payload !== "object") return payload;
  const o = payload as Record<string, unknown>;
  if (o.post && typeof o.post === "object") return o.post;
  if (o.data && typeof o.data === "object") return o.data;
  return payload;
}

function normalizeBlogPostPayload(payload: unknown): BlogPost | null {
  const row = unwrapPostPayload(payload);
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
    o.youtubeId ?? o.youtube_id ?? o.youtubeUrl ?? o.youtube_url ?? o.embedUrl;
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
    const payload = await apiGet<unknown>("/blogs");
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
    const payload = await apiGet<unknown>(
      `/blogs/${encodeURIComponent(slug)}`
    );
    const post = normalizeBlogPostPayload(payload);
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
    const payload = await apiGet<unknown>("/blog-videos");
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
