/** Accepts a bare 11-char id or common YouTube / youtu.be URLs. */
export function parseYoutubeId(input: string | undefined | null): string | null {
  if (!input) return null;
  const s = String(input).trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s);
    if (u.hostname === "youtu.be" || u.hostname.endsWith(".youtu.be")) {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id && id.length === 11 ? id : null;
    }
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
      const m = u.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
      if (m) return m[1];
      const sMatch = u.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
      if (sMatch) return sMatch[1];
    }
  } catch {
    /* invalid URL */
  }
  return null;
}
