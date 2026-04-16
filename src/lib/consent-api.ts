/**
 * Piercing consent submission to WordPress REST (`vansun/v1`).
 *
 * Base URL (first match wins):
 * - `NEXT_PUBLIC_CONSENT_API_URL`, e.g. `https://cms.vansunstudio.com/wp-json/vansun/v1`
 * - `NEXT_PUBLIC_API_URL`, fallback for older setups
 *
 * **POST** path: `NEXT_PUBLIC_CONSENT_PIERCING_PATH` or default `/consents/piercing`
 * Body: {@link PiercingConsentSubmitBody} (reCAPTCHA token is not sent to WP; verify separately if needed)
 * Response: `{ success?: boolean, id?: number }` or WP REST error `{ code, message, data }`
 */
import type {
  ConsentSubmitResponse,
  PiercingConsentSubmitBody,
  TattooConsentSubmitBody,
} from "@/types/consent";

function trimSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/** WordPress plugin stores JSON; omit one-time reCAPTCHA from persisted payload. */
function bodyWithoutRecaptcha<
  T extends PiercingConsentSubmitBody | TattooConsentSubmitBody,
>(body: T): Omit<T, "recaptcha_token"> {
  const { recaptcha_token: _r, ...rest } = body;
  return rest;
}

function errorMessageFromResponse(data: unknown, status: number): string {
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    const msg = o.message;
    if (typeof msg === "string" && msg.trim()) return msg.trim();
  }
  return `Consent submission failed (${status})`;
}

export function getConsentApiBase(): string {
  const explicit = process.env.NEXT_PUBLIC_CONSENT_API_URL?.trim();
  if (explicit) return explicit;
  return process.env.NEXT_PUBLIC_API_URL?.trim() ?? "";
}

export function getPiercingConsentPath(): string {
  const p = process.env.NEXT_PUBLIC_CONSENT_PIERCING_PATH?.trim();
  return p && p.startsWith("/") ? p : "/consents/piercing";
}

export function getTattooConsentPath(): string {
  const p = process.env.NEXT_PUBLIC_CONSENT_TATTOO_PATH?.trim();
  return p && p.startsWith("/") ? p : "/consents/tattoo";
}

export async function submitPiercingConsent(
  body: PiercingConsentSubmitBody
): Promise<ConsentSubmitResponse> {
  const base = getConsentApiBase();
  if (!base) {
    throw new Error(
      "Consent API is not configured. Set NEXT_PUBLIC_CONSENT_API_URL (or NEXT_PUBLIC_API_URL) to your WordPress REST base, e.g. https://cms.example.com/wp-json/vansun/v1"
    );
  }
  const path = getPiercingConsentPath();
  const url = `${trimSlash(base)}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bodyWithoutRecaptcha(body)),
  });
  let data: ConsentSubmitResponse = {};
  try {
    data = (await res.json()) as ConsentSubmitResponse;
  } catch {
    /* non-JSON */
  }
  if (!res.ok) {
    throw new Error(errorMessageFromResponse(data, res.status));
  }
  return data;
}

/**
 * Tattoo consent submission (same base as piercing).
 *
 * **POST** path: `NEXT_PUBLIC_CONSENT_TATTOO_PATH` or default `/consents/tattoo`
 * Body: {@link TattooConsentSubmitBody}
 */
export async function submitTattooConsent(
  body: TattooConsentSubmitBody
): Promise<ConsentSubmitResponse> {
  const base = getConsentApiBase();
  if (!base) {
    throw new Error(
      "Consent API is not configured. Set NEXT_PUBLIC_CONSENT_API_URL (or NEXT_PUBLIC_API_URL) to your WordPress REST base, e.g. https://cms.example.com/wp-json/vansun/v1"
    );
  }
  const path = getTattooConsentPath();
  const url = `${trimSlash(base)}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bodyWithoutRecaptcha(body)),
  });
  let data: ConsentSubmitResponse = {};
  try {
    data = (await res.json()) as ConsentSubmitResponse;
  } catch {
    /* non-JSON */
  }
  if (!res.ok) {
    throw new Error(errorMessageFromResponse(data, res.status));
  }
  return data;
}
