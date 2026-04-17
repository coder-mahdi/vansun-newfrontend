/** Blog listing (index) stays plural. */
export const BLOG_LIST_PATH = "/blogs";

/** Short path: `/b/…` (was `/blog/…`). */
export function blogPostHref(slug: string): string {
  return `/b/${slug}`;
}
