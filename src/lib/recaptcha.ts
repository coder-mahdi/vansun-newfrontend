/**
 * reCAPTCHA v3 (no checkbox): tokens via `executeRecaptcha(action)` in client components
 * under `RecaptchaV3Provider`. Register a **v3** site key in Google Admin (not v2-only keys).
 *
 * - development: Google’s public test key (pair secret on server if you verify).
 * - live: set NEXT_PUBLIC_RECAPTCHA_SITE_KEY or rely on default live key below.
 *
 * Client env:
 * - NEXT_PUBLIC_RECAPTCHA_ENV=development | live
 * - NEXT_PUBLIC_RECAPTCHA_SITE_KEY — live site key (optional if using built-in default)
 * - NEXT_PUBLIC_RECAPTCHA_SITE_KEY_DEV — optional override in development
 *
 * Server: verify token + optional score with RECAPTCHA_SECRET_KEY (same siteverify endpoint).
 */

const GOOGLE_RECAPTCHA_V2_TEST_SITE_KEY =
  "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

/** Default live checkbox site key (public; safe in client bundle). Override via env if needed. */
const DEFAULT_LIVE_SITE_KEY = "6LcmxassAAAAADBUQ67usE8u4ulN5RecK6eC36nK";

export type RecaptchaPublicEnv = "development" | "live";

function normalizeRecaptchaEnv(
  raw: string | undefined
): RecaptchaPublicEnv {
  const v = raw?.trim().toLowerCase();
  if (v === "live" || v === "production") return "live";
  return "development";
}

export function getRecaptchaPublicEnv(): RecaptchaPublicEnv {
  const explicit = process.env.NEXT_PUBLIC_RECAPTCHA_ENV?.trim();
  if (explicit) return normalizeRecaptchaEnv(explicit);
  // Local `next dev`: development (test key). Production build: live keys unless overridden above.
  if (process.env.NODE_ENV === "production") return "live";
  return "development";
}

export function getRecaptchaSiteKey(): string {
  if (getRecaptchaPublicEnv() === "live") {
    const fromEnv = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim();
    return fromEnv || DEFAULT_LIVE_SITE_KEY;
  }
  const devOverride = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY_DEV?.trim();
  return devOverride || GOOGLE_RECAPTCHA_V2_TEST_SITE_KEY;
}

/** Resolved at module load for client bundles (NEXT_PUBLIC_* inlined). */
export const RECAPTCHA_SITE_KEY = getRecaptchaSiteKey();
