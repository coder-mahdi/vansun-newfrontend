import { isLiveContentMode } from "@/lib/content-mode";

/** Public URL prefix for local dev assets (files live in `public/dev-cms/`). */
export const DEV_CMS_PUBLIC_PATH = "/dev-cms";

/**
 * URL for a file you placed in `public/dev-cms/` (e.g. `hero.jpg`).
 */
export function devCmsAsset(fileName: string): string {
  const clean = fileName.replace(/^\/+/, "");
  return `${DEV_CMS_PUBLIC_PATH}/${clean}`;
}

/**
 * Image URL: live CMS field when in live mode, otherwise local dev file.
 *
 * @param localFileName - file name inside `public/dev-cms/` (mock mode)
 * @param cmsUrl - absolute or path URL from CMS/API (live mode); if missing in live, falls back to dev path for safety
 */
export function contentImageUrl(
  localFileName: string,
  cmsUrl?: string | null
): string {
  if (isLiveContentMode() && cmsUrl) return cmsUrl;
  return devCmsAsset(localFileName);
}
