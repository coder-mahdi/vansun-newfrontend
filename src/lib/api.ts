/**
 * App/backend JSON API. CMS-specific endpoints can use NEXT_PUBLIC_CMS_API_URL
 * or extend this module when wiring live content.
 */
const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}
