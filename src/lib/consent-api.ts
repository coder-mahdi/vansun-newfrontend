/**
 * Piercing consent submission to `NEXT_PUBLIC_API_URL`.
 *
 * **POST** path: `NEXT_PUBLIC_CONSENT_PIERCING_PATH` or default `/consents/piercing`
 * Body: {@link PiercingConsentSubmitBody}
 * Response: `{ success?: boolean, message?: string }` (adjust when backend is fixed)
 */
import type {
  ConsentSubmitResponse,
  PiercingConsentSubmitBody,
  TattooConsentSubmitBody,
} from "@/types/consent";

function trimSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

export function getConsentApiBase(): string {
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
      "Consent API is not configured. Set NEXT_PUBLIC_API_URL in your environment."
    );
  }
  const path = getPiercingConsentPath();
  const url = `${trimSlash(base)}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let data: ConsentSubmitResponse = {};
  try {
    data = (await res.json()) as ConsentSubmitResponse;
  } catch {
    /* non-JSON */
  }
  if (!res.ok) {
    throw new Error(
      data.message || `Consent submission failed (${res.status})`
    );
  }
  return data;
}

/**
 * Tattoo consent submission to `NEXT_PUBLIC_API_URL`.
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
      "Consent API is not configured. Set NEXT_PUBLIC_API_URL in your environment."
    );
  }
  const path = getTattooConsentPath();
  const url = `${trimSlash(base)}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let data: ConsentSubmitResponse = {};
  try {
    data = (await res.json()) as ConsentSubmitResponse;
  } catch {
    /* non-JSON */
  }
  if (!res.ok) {
    throw new Error(
      data.message || `Consent submission failed (${res.status})`
    );
  }
  return data;
}
