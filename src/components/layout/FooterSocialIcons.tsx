import { facebookUrl, instagramUrl } from "@/data/social";

function IconInstagram({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path d="M13.5 22v-8.35h2.8l.53-3.25H13.5V8.58c0-.89.24-1.5 1.53-1.5h1.63V4.11A21.9 21.9 0 0 0 14.23 4c-2.35 0-3.96 1.43-3.96 4.06v2.34H7.5v3.25h2.77V22h3.23Z" />
    </svg>
  );
}

export function FooterSocialIcons() {
  return (
    <div className="site-footer__social">
      <a
        className="site-footer__social-link"
        href={instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
      >
        <IconInstagram className="site-footer__social-icon" />
      </a>
      <a
        className="site-footer__social-link"
        href={facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
      >
        <IconFacebook className="site-footer__social-icon" />
      </a>
    </div>
  );
}
