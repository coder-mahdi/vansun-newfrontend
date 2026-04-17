/**
 * Optional Google Places **Place Details** reviews for the About page.
 *
 * Set server-side env (never `NEXT_PUBLIC_` for the key):
 * - `GOOGLE_PLACES_API_KEY`, API key with Places API enabled
 * - `GOOGLE_PLACE_ID`, Google Place ID for the business
 *
 * Returns up to 3 reviews sorted by highest rating first. If env is missing
 * or the request fails, returns an empty array (UI falls back to local testimonials).
 */

export type GooglePlaceReview = {
  authorName: string;
  rating: number;
  text: string;
  relativeTimeDescription: string;
};

type PlaceDetailsReview = {
  author_name?: string;
  rating?: number;
  text?: string;
  relative_time_description?: string;
};

type PlaceDetailsPayload = {
  status?: string;
  result?: { reviews?: PlaceDetailsReview[] };
};

export async function fetchGooglePlaceReviewsSorted(): Promise<
  GooglePlaceReview[]
> {
  const key = process.env.GOOGLE_PLACES_API_KEY?.trim();
  const placeId = process.env.GOOGLE_PLACE_ID?.trim();
  if (!key || !placeId) return [];

  try {
    const url = new URL(
      "https://maps.googleapis.com/maps/api/place/details/json"
    );
    url.searchParams.set("place_id", placeId);
    url.searchParams.set("fields", "reviews");
    url.searchParams.set("key", key);

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = (await res.json()) as PlaceDetailsPayload;
    if (data.status !== "OK" || !data.result?.reviews?.length) return [];

    const normalized: GooglePlaceReview[] = data.result.reviews
      .map((r) => ({
        authorName: String(r.author_name ?? "Google user").trim() || "Google user",
        rating: Math.min(
          5,
          Math.max(0, Number.isFinite(Number(r.rating)) ? Number(r.rating) : 0)
        ),
        text: String(r.text ?? "").trim(),
        relativeTimeDescription: String(
          r.relative_time_description ?? ""
        ).trim(),
      }))
      .filter((r) => r.text.length > 0);

    normalized.sort((a, b) => b.rating - a.rating);
    return normalized.slice(0, 3);
  } catch {
    return [];
  }
}
