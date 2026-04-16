/**
 * Blog posts and videos from Vansun WordPress REST (`vansun/v1`).
 *
 * Blogs: GET `/content/blogs`, core `post` type, `topic` (tattoo|piercing), `tags` / `tag_slugs` for SEO.
 * Videos: GET `/content/videos`, returns `[]` when no API URL or no rows (no mock list).
 *
 * Optional: if `NEXT_PUBLIC_CMS_API_URL` is set, single post pages can resolve by real WP `slug`
 * via `GET /wp/v2/posts?slug=...&_embed=1` when the vansun list does not include a slug.
 *
 * When `image_url` / featured image are empty, covers are filled from WordPress:
 * `GET /wp/v2/posts/{id}?_embed=1` (featured media) then `GET /wp/v2/media?parent={id}&media_type=image`
 * (first attached image, e.g. uploads not inserted into body and not set as featured).
 *
 * Base URL priority:
 * - `NEXT_PUBLIC_CONTENT_API_URL`
 * - `NEXT_PUBLIC_CONSENT_API_URL`
 * - `NEXT_PUBLIC_API_URL`
 */
import {
  blogPostsBySlug,
  blogSummaries as mockBlogSummaries,
} from "@/data/blogs";
import { contentImageUrl } from "@/lib/content-assets";
import { parseYoutubeId } from "@/lib/youtube";
import {
  cmsPublicOrigin,
  extractFirstImgSrcFromHtml,
  rewriteWpHtmlAssetUrls,
} from "@/lib/wp-html";
import type { BlogCategory, BlogPost, BlogSummary, BlogVideo } from "@/types/blog";

function apiBase(): string {
  const content = process.env.NEXT_PUBLIC_CONTENT_API_URL?.trim();
  if (content) return content;
  const wp = process.env.NEXT_PUBLIC_CONSENT_API_URL?.trim();
  if (wp) return wp;
  return process.env.NEXT_PUBLIC_API_URL?.trim() ?? "";
}

/**
 * Base URL for core WordPress REST: `https://your-site/wp-json`.
 * `NEXT_PUBLIC_CMS_API_URL` can be that full base, or we derive it from
 * `NEXT_PUBLIC_CONSENT_API_URL` / `CONTENT` when they look like `…/wp-json/vansun/v1`.
 */
function wpJsonBase(): string {
  const explicit = process.env.NEXT_PUBLIC_CMS_API_URL?.trim();
  if (explicit) {
    const t = explicit.replace(/\/+$/, "");
    if (t.endsWith("/wp-json")) return t;
    return t.includes("/wp-json") ? t : `${t}/wp-json`;
  }
  for (const raw of [
    process.env.NEXT_PUBLIC_CONSENT_API_URL,
    process.env.NEXT_PUBLIC_CONTENT_API_URL,
    process.env.NEXT_PUBLIC_API_URL,
  ]) {
    const u = raw?.trim();
    if (!u) continue;
    try {
      const parsed = new URL(u);
      if (parsed.pathname.includes("/wp-json")) {
        return `${parsed.origin}/wp-json`;
      }
    } catch {
      continue;
    }
  }
  return "";
}

function trimSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/**
 * WordPress may return protocol-relative (`//…`) or root-relative (`/wp-content/…`) URLs.
 * `next/image` needs an absolute URL; relative paths are resolved with {@link cmsPublicOrigin}.
 */
function resolveCmsMediaUrl(
  url: string | undefined | null
): string | undefined {
  if (url == null || typeof url !== "string") return undefined;
  let s = url.trim();
  if (!s) return undefined;

  if (s.startsWith("//")) {
    s = `https:${s}`;
  } else if (s.startsWith("/")) {
    const origin = cmsPublicOrigin();
    if (!origin) return undefined;
    s = `${origin}${s}`;
  }

  try {
    const parsed = new URL(s);
    if (parsed.protocol === "http:") {
      const origin = cmsPublicOrigin();
      if (origin) {
        const o = new URL(origin);
        if (parsed.hostname === o.hostname) {
          parsed.protocol = "https:";
          s = parsed.href;
        }
      }
    }
  } catch {
    return undefined;
  }

  return s;
}

function buildQueryString(
  params?: Record<string, string | number | undefined>
): string {
  if (!params) return "";
  const e = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === "") continue;
    e.set(k, String(v));
  }
  const s = e.toString();
  return s ? `?${s}` : "";
}

async function contentGet<T>(
  path: string,
  params?: Record<string, string | number | undefined>
): Promise<T> {
  const base = apiBase();
  const res = await fetch(`${trimSlash(base)}${path}${buildQueryString(params)}`, {
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

/** CMS may send a string URL or a small object (`url`, `source_url`, …). */
function urlFromUnknown(v: unknown): string | undefined {
  if (v == null) return undefined;
  if (typeof v === "string") {
    const t = v.trim();
    return t || undefined;
  }
  if (typeof v === "object") {
    const r = v as Record<string, unknown>;
    for (const k of ["url", "source_url", "src", "href"] as const) {
      const s = r[k];
      if (typeof s === "string" && s.trim()) return s.trim();
    }
  }
  return undefined;
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

function parseKeywordList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeBlogSummaryRow(row: unknown): BlogSummary | null {
  if (!row || typeof row !== "object") return null;
  const o = row as Record<string, unknown>;
  const title = String(o.title ?? "").trim();
  const slugFromApi = String(o.slug ?? "").trim();
  const idRaw = String(o.id ?? "").trim();
  const slug =
    slugFromApi ||
    (title ? slugify(title) : "") ||
    (idRaw ? `post-${idRaw}` : "");
  if (!slug || !title) return null;

  const excerptSource = String(
    o.excerpt ?? o.summary ?? o.content ?? o.body ?? o.html ?? ""
  ).trim();
  const excerpt = stripHtml(excerptSource).slice(0, 220) || title;
  const publishedAt = String(
    o.publishedAt ?? o.published_at ?? o.date ?? ""
  ).trim();

  const tagsFromTagsField = parseKeywordList(o.tags);
  const tagsFromKeywordsField = parseKeywordList(o.keywords);
  const tags =
    tagsFromTagsField.length > 0 ? tagsFromTagsField : tagsFromKeywordsField;
  const keywordFromApi = String(o.keyword ?? "").trim();
  const keyword =
    tags.length > 0 ? tags.join(", ") : keywordFromApi || "blog";

  const topic = String(o.topic ?? "").trim().toLowerCase();
  const category: BlogCategory =
    topic === "piercing" || topic === "tattoo"
      ? topic
      : categoryFromKeyword(keyword);

  const coverStr =
    urlFromUnknown(o.coverImageUrl) ??
    urlFromUnknown(o.cover_image_url) ??
    urlFromUnknown(o.coverUrl) ??
    urlFromUnknown(o.image_url) ??
    urlFromUnknown(o.image) ??
    urlFromUnknown(o.featured_image) ??
    urlFromUnknown(o.thumbnail_url);
  const localFallback = String(o.coverFile ?? o.cover_file ?? "").trim();
  let coverImageUrl = coverStr
    ? resolveCmsMediaUrl(coverStr)
    : localFallback
      ? contentImageUrl(localFallback, null)
      : undefined;

  if (!coverImageUrl) {
    const html = String(o.content ?? "").trim();
    if (html) {
      const fromBody = extractFirstImgSrcFromHtml(html);
      if (fromBody) coverImageUrl = resolveCmsMediaUrl(fromBody);
    }
  }

  return {
    slug,
    title,
    excerpt,
    publishedAt: publishedAt || "1970-01-01",
    category,
    keyword,
    tags: tags.length > 0 ? tags : undefined,
    coverImageUrl,
  };
}

function normalizeBlogPostPayload(row: unknown): BlogPost | null {
  const base = normalizeBlogSummaryRow(row);
  if (!base) return null;
  if (!row || typeof row !== "object") return null;
  const o = row as Record<string, unknown>;
  const raw = String(o.content ?? o.body ?? o.html ?? "").trim();
  if (!raw) return null;
  let content = rewriteWpHtmlAssetUrls(raw);
  let coverImageUrl = base.coverImageUrl;
  if (!coverImageUrl) {
    const fromBody = extractFirstImgSrcFromHtml(raw);
    if (fromBody) coverImageUrl = resolveCmsMediaUrl(fromBody);
  }
  return { ...base, coverImageUrl: coverImageUrl ?? base.coverImageUrl, content };
}

/** WordPress REST: post list item or single. */
type WpRestPost = {
  id?: number;
  slug?: string;
  title?: { rendered?: string };
  content?: { rendered?: string };
  excerpt?: { rendered?: string };
  date?: string;
  date_gmt?: string;
  _embedded?: {
    "wp:featuredmedia"?: { source_url?: string }[];
    "wp:term"?: Array<
      Array<{ taxonomy?: string; slug?: string; name?: string }>
    >;
  };
};

type WpMediaRest = {
  source_url?: string;
  media_type?: string;
  mime_type?: string;
};

/**
 * First image attached to the post (`parent` in media library). Used when there is no
 * featured image and no `<img>` in post HTML (common when editors upload media but do
 * not set “Featured image”).
 */
async function fetchWpFirstAttachmentImageByPostId(
  postId: number
): Promise<string | undefined> {
  const base = wpJsonBase();
  if (!base || !Number.isFinite(postId)) return undefined;
  const url = `${base}/wp/v2/media?parent=${postId}&per_page=10&media_type=image`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return undefined;
  const items = (await res.json()) as WpMediaRest[];
  if (!Array.isArray(items)) return undefined;
  for (const item of items) {
    if (item.media_type && item.media_type !== "image") continue;
    if (item.mime_type && !String(item.mime_type).startsWith("image/")) continue;
    const src = typeof item.source_url === "string" ? item.source_url.trim() : "";
    if (src) return src;
  }
  return undefined;
}

/**
 * Cover from WP: featured image (`_embed`) or first image attachment on the post.
 */
async function fetchWpCoverFromRestByPostId(
  postId: number
): Promise<string | undefined> {
  const base = wpJsonBase();
  if (!base || !Number.isFinite(postId)) return undefined;
  const postUrl = `${base}/wp/v2/posts/${postId}?_embed=1`;
  const res = await fetch(postUrl, { next: { revalidate: 300 } });
  if (!res.ok) return undefined;
  const data = (await res.json()) as WpRestPost;
  const m = data._embedded?.["wp:featuredmedia"]?.[0];
  const featured = typeof m?.source_url === "string" ? m.source_url.trim() : "";
  if (featured) return featured;
  return fetchWpFirstAttachmentImageByPostId(postId);
}

async function fetchBlogPostFromWpRest(slug: string): Promise<BlogPost | null> {
  const base = wpJsonBase();
  if (!base) return null;

  const url = `${base}/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed=1`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return null;
  const posts = (await res.json()) as WpRestPost[];
  const post = posts[0];
  if (!post?.title?.rendered) return null;

  const title = stripHtml(post.title.rendered);
  const rawContent = String(post.content?.rendered ?? "").trim();
  if (!rawContent) return null;
  const content = rewriteWpHtmlAssetUrls(rawContent);

  const excerptHtml = stripHtml(
    String(post.excerpt?.rendered ?? "").trim() || rawContent.slice(0, 400)
  );
  const publishedAt = String(post.date_gmt ?? post.date ?? "").trim() || "1970-01-01";

  const terms = post._embedded?.["wp:term"]?.flat() ?? [];
  const topicTerm = terms.find((t) => t.taxonomy === "vansun_topic");
  const topicSlug = String(topicTerm?.slug ?? "").toLowerCase();
  const category: BlogCategory =
    topicSlug === "piercing" ? "piercing" : "tattoo";

  const tagNames = terms
    .filter((t) => t.taxonomy === "post_tag")
    .map((t) => String(t.name ?? "").trim())
    .filter(Boolean);
  const keyword =
    tagNames.length > 0 ? tagNames.join(", ") : "blog";

  const coverMedia = post._embedded?.["wp:featuredmedia"]?.[0];
  let coverImageUrl = resolveCmsMediaUrl(
    typeof coverMedia?.source_url === "string" ? coverMedia.source_url : ""
  );
  if (!coverImageUrl) {
    const fromBody = extractFirstImgSrcFromHtml(rawContent);
    if (fromBody) coverImageUrl = resolveCmsMediaUrl(fromBody);
  }
  if (!coverImageUrl) {
    const pid = typeof post.id === "number" ? post.id : Number(post.id);
    if (Number.isFinite(pid)) {
      const att = await fetchWpFirstAttachmentImageByPostId(pid);
      if (att) coverImageUrl = resolveCmsMediaUrl(att);
    }
  }

  return {
    slug: String(post.slug ?? slug).trim(),
    title,
    excerpt: excerptHtml.slice(0, 220) || title,
    publishedAt,
    category,
    keyword,
    tags: tagNames.length > 0 ? tagNames : undefined,
    coverImageUrl,
    content,
  };
}

function normalizeVideoRow(row: unknown): BlogVideo | null {
  if (!row || typeof row !== "object") return null;
  const o = row as Record<string, unknown>;
  const title = String(o.title ?? "").trim();
  if (!title) return null;
  const keyword = String(o.keyword ?? o.tag ?? "").trim() || "video";
  const excerpt =
    String(o.excerpt ?? o.description ?? "").trim() || title;
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
      ? categoryFromKeyword(keyword)
      : normalizeCategory(categoryRaw);
  const publishedAt = String(
    o.publishedAt ?? o.published_at ?? o.date ?? ""
  ).trim();
  return {
    id,
    title,
    excerpt,
    keyword,
    youtubeId: ytId,
    category,
    ...(publishedAt ? { publishedAt } : {}),
  };
}

function rowMatchesSlug(row: unknown, slug: string): boolean {
  const summary = normalizeBlogSummaryRow(row);
  if (summary?.slug === slug) return true;
  if (!row || typeof row !== "object") return false;
  const o = row as Record<string, unknown>;
  const apiSlug = String(o.slug ?? "").trim();
  if (apiSlug && apiSlug === slug) return true;
  const id = String(o.id ?? "").trim();
  if (id && slug === `post-${id}`) return true;
  return false;
}

export async function fetchBlogSummaries(
  topic?: BlogCategory
): Promise<BlogSummary[]> {
  const base = apiBase();
  if (!base) return [...mockBlogSummaries];

  try {
    const params: Record<string, string | number | undefined> = {
      per_page: 50,
    };
    if (topic === "tattoo" || topic === "piercing") {
      params.topic = topic;
    }
    const payload = await contentGet<unknown>("/content/blogs", params);
    const rows = asArray(payload);
    const enriched = await Promise.all(
      rows.map(async (row) => {
        const s = normalizeBlogSummaryRow(row);
        if (!s) return null;
        if (s.coverImageUrl) return s;
        if (typeof row === "object") {
          const id = Number((row as Record<string, unknown>).id);
          if (Number.isFinite(id)) {
            const wpSrc = await fetchWpCoverFromRestByPostId(id);
            const resolved = wpSrc ? resolveCmsMediaUrl(wpSrc) : undefined;
            if (resolved) return { ...s, coverImageUrl: resolved };
          }
        }
        return s;
      })
    );
    const out = enriched.filter(Boolean) as BlogSummary[];
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
    const payload = await contentGet<unknown>("/content/blogs", {
      per_page: 100,
    });
    const rows = asArray(payload);
    const match = rows.find((row) => rowMatchesSlug(row, slug));
    let post = normalizeBlogPostPayload(match);
    if (post && !post.coverImageUrl && match && typeof match === "object") {
      const id = Number((match as Record<string, unknown>).id);
      if (Number.isFinite(id)) {
        const wpSrc = await fetchWpCoverFromRestByPostId(id);
        const resolved = wpSrc ? resolveCmsMediaUrl(wpSrc) : undefined;
        if (resolved) post = { ...post, coverImageUrl: resolved };
      }
    }
    if (post) return post;
  } catch {
    /* fallback */
  }

  const fromWp = await fetchBlogPostFromWpRest(slug);
  if (fromWp) return fromWp;

  return blogPostsBySlug[slug] ?? null;
}

export async function fetchBlogVideos(): Promise<BlogVideo[]> {
  const base = apiBase();
  if (!base) return [];

  try {
    const payload = await contentGet<unknown>("/content/videos", {
      per_page: 50,
    });
    const rows = asArray(payload);
    const out = rows
      .map(normalizeVideoRow)
      .filter(Boolean) as BlogVideo[];
    return out;
  } catch {
    return [];
  }
}

/** Newest `publishedAt` first; first clip for “latest video” embeds. */
export function pickLatestBlogVideo(
  videos: BlogVideo[]
): BlogVideo | undefined {
  if (videos.length === 0) return undefined;
  return [...videos].sort((a, b) => {
    const da = a.publishedAt ?? "";
    const db = b.publishedAt ?? "";
    return db.localeCompare(da);
  })[0];
}
