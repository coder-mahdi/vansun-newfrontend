import type { Metadata } from "next";

import { PrivacyPolicyContent } from "@/components/legal/PrivacyPolicyContent";
import { TermsConditionsContent } from "@/components/legal/TermsConditionsContent";

export const metadata: Metadata = {
  title: "Privacy & terms",
  description:
    "Privacy Policy and Terms and Conditions for Vansun Studio website and services.",
};

export default function TermsPage() {
  return (
    <div className="terms-and-conditions">
      <div className="terms-and-conditions__container">
        <h1 className="terms-and-conditions__heading">
          Privacy &amp; terms
        </h1>

        <section className="terms-and-conditions__section" aria-labelledby="privacy-policy-title">
          <h2 id="privacy-policy-title" className="terms-and-conditions__title">
            Privacy Policy
          </h2>
          <PrivacyPolicyContent />
        </section>

        <section
          className="terms-and-conditions__section"
          aria-labelledby="terms-conditions-title"
        >
          <h2 id="terms-conditions-title" className="terms-and-conditions__title">
            Terms and Conditions
          </h2>
          <TermsConditionsContent />
        </section>
      </div>
    </div>
  );
}
