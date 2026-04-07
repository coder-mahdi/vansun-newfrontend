/**
 * Content source: live CMS/API vs local mock (dev).
 *
 * Production: set NEXT_PUBLIC_CONTENT_MODE=live and wire real API/CMS URLs.
 * Local testing: omit or use mock; use files under `public/dev-cms/`.
 */
export type ContentMode = "mock" | "live";

export function getContentMode(): ContentMode {
  const raw = process.env.NEXT_PUBLIC_CONTENT_MODE?.toLowerCase();
  if (raw === "live") return "live";
  return "mock";
}

export function isMockContentMode(): boolean {
  return getContentMode() !== "live";
}

export function isLiveContentMode(): boolean {
  return getContentMode() === "live";
}
