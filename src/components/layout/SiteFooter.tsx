import Link from "next/link";
import { cn } from "@/lib/helpers";
import { FooterConsent } from "./FooterConsent";
import { FooterSocialIcons } from "./FooterSocialIcons";

const contactEmail =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@vansun.studio";

const studioAddress =
  "1007 Granville St, Vancouver, BC V6Z 1M1";

export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("site-footer shrink-0", className)}>
      <div className="site-footer__shell">
        <p className="site-footer__brand">Vansun Studio</p>

        <div className="site-footer__middle">
          <div className="site-footer__col site-footer__col--left">
            <nav className="site-footer__nav" aria-label="Footer links">
              <Link className="site-footer__text-link" href="/blogs">
                Blogs
              </Link>
              <Link className="site-footer__text-link" href="/terms">
                Terms and Conditions
              </Link>
            </nav>
            <address className="site-footer__address">{studioAddress}</address>
          </div>

          <div className="site-footer__col site-footer__col--center">
            <FooterSocialIcons />
          </div>

          <div className="site-footer__col site-footer__col--right">
            <ul className="site-footer__actions">
              <li className="site-footer__actions-item">
                <FooterConsent />
              </li>
              <li className="site-footer__actions-item">
                <a
                  className="site-footer__btn site-footer__btn--block"
                  href={`mailto:${contactEmail}`}
                >
                  Send email
                </a>
              </li>
            </ul>
          </div>
        </div>

        <hr className="site-footer__rule" />

        <p className="site-footer__copyright">
          © 2026 Van Sun Studio. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
