/**
 * WordPress `the_content` HTML often uses root-relative / protocol-relative URLs.
 * On the Next.js origin those break; rewrite to absolute CMS URLs.
 */

/** Public site origin, e.g. https://cms.example.com (no trailing slash). */
export function cmsPublicOrigin(): string {
  const site = process.env.NEXT_PUBLIC_CMS_SITE_URL?.trim();
  if (site) {
    try {
      return new URL(site).origin;
    } catch {
      /* fall through */
    }
  }
  const envs = [
    process.env.NEXT_PUBLIC_CMS_API_URL,
    process.env.NEXT_PUBLIC_CONTENT_API_URL,
    process.env.NEXT_PUBLIC_CONSENT_API_URL,
    process.env.NEXT_PUBLIC_API_URL,
  ];
  for (const raw of envs) {
    const t = raw?.trim();
    if (!t) continue;
    try {
      const u = new URL(t);
      return `${u.protocol}//${u.host}`;
    } catch {
      continue;
    }
  }
  return "";
}

function resolveUrlPart(part: string, origin: string): string {
  const t = part.trim();
  const si = t.lastIndexOf(" ");
  const urlPart = si === -1 ? t : t.slice(0, si).trim();
  const descriptor = si === -1 ? "" : t.slice(si);
  if (urlPart.startsWith("/")) {
    return `${origin}${urlPart}${descriptor}`;
  }
  if (urlPart.startsWith("//")) {
    return `https:${urlPart}${descriptor}`;
  }
  return t;
}

/**
 * Rewrite img/src, href, srcset, source[srcset] so /wp-content/… and //host/… work off-site.
 */
export function rewriteWpHtmlAssetUrls(html: string): string {
  const origin = cmsPublicOrigin();
  if (!origin || !html) return html;

  let out = html;

  // Root-relative uploads / includes
  out = out.replace(
    /(\s(?:src|href|poster))=(["'])(\/wp-(?:content|includes)\/[^"']*)\2/gi,
    (_, attr, q, path) => `${attr}=${q}${origin}${path}${q}`
  );

  // Protocol-relative (//example.com/...)
  out = out.replace(
    /(\s(?:src|href|poster))=(["'])\/\/([^"']+)\2/gi,
    (_, attr, q, rest) => `${attr}=${q}https://${rest}${q}`
  );

  // srcset="url 300w, url 600w"
  out = out.replace(/(\ssrcset=)(["'])([^"']+)\2/gi, (_, prefix, q, value) => {
    const rewritten = value
      .split(",")
      .map((chunk: string) => resolveUrlPart(chunk, origin))
      .join(", ");
    return `${prefix}${q}${rewritten}${q}`;
  });

  return out;
}

/** First image URL in post HTML (may be relative or protocol-relative). */
export function extractFirstImgSrcFromHtml(html: string): string | undefined {
  if (!html || typeof html !== "string") return undefined;
  const srcMatch = html.match(/<img[^>]*\bsrc=["']([^"']+)["']/i);
  if (srcMatch?.[1]) return srcMatch[1].trim();
  const dataMatch = html.match(/<img[^>]*\bdata-src=["']([^"']+)["']/i);
  return dataMatch?.[1]?.trim();
}
