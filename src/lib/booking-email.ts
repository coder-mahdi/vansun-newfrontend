/**
 * Client-side checks before booking submit (disposable inboxes, obvious typos).
 * Server should still validate; this improves UX and cuts obvious spam.
 */

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.org",
  "sharklasers.com",
  "yopmail.com",
  "yopmail.fr",
  "tempmail.com",
  "temp-mail.org",
  "10minutemail.com",
  "10minutemail.net",
  "throwaway.email",
  "trashmail.com",
  "getnada.com",
  "maildrop.cc",
  "dispostable.com",
  "fakeinbox.com",
  "mailnesia.com",
  "mintemail.com",
  "emailondeck.com",
  "spam4.me",
  "grr.la",
  "mailcatch.com",
  "tmpmail.org",
  "tmpmail.net",
  "burnermail.io",
  "moakt.com",
  "tempr.email",
  "discard.email",
  "discardmail.com",
  "mailnull.com",
  "mohmal.com",
  "emailfake.com",
  "crazymailing.com",
]);

/**
 * @returns `null` if OK, otherwise a short message for the user.
 */
export function getBookingEmailValidationError(raw: string): string | null {
  const email = raw.trim().toLowerCase();
  if (!email) return "Email is required.";
  if (email.length > 254) return "That email looks too long.";
  if ((email.match(/@/g) ?? []).length !== 1) {
    return "Enter a valid email address.";
  }
  const [local, domain] = email.split("@", 2);
  if (!local || !domain || !domain.includes(".")) {
    return "Enter a valid email address.";
  }
  if (local.length > 64) return "Enter a valid email address.";
  if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) {
    return "Enter a valid email address.";
  }
  if (!/^[a-z0-9._%+-]+$/.test(local)) {
    return "Enter a valid email address.";
  }
  const domainParts = domain.split(".");
  if (domainParts.length < 2) return "Enter a valid email address.";
  const tld = domainParts[domainParts.length - 1] ?? "";
  if (!/^[a-z]{2,24}$/.test(tld)) {
    return "Enter a valid email address.";
  }
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return "Please use a real inbox (disposable email addresses are not accepted).";
  }
  return null;
}
