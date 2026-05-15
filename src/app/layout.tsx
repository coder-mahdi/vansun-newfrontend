import type { Metadata } from "next";
import Script from "next/script";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import {
  brandAppleTouchIconPath,
  brandFaviconIcoPath,
  brandFaviconSvgPath,
  brandWebManifestPath,
} from "@/lib/brand-assets";
import "@/styles/globals.scss";

export const metadata: Metadata = {
  title: {
    default: "Vansun Studio",
    template: "%s | Vansun Studio",
  },
  description:
    "Vansun Studio: professional tattoo and piercing on Granville Street, Vancouver.",
  manifest: brandWebManifestPath,
  icons: {
    icon: [
      { url: brandFaviconIcoPath, sizes: "48x48", type: "image/x-icon" },
      { url: brandFaviconSvgPath, type: "image/svg+xml" },
    ],
    apple: brandAppleTouchIconPath,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "VanSun Studio",
    address: {
      streetAddress: "Granville St",
      addressLocality: "Vancouver",
    },
  };

  return (
    <html lang="en" className="h-full antialiased">
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-CRMWDTR335"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-CRMWDTR335');
  `}
      </Script>
      <body className="min-h-full min-h-dvh flex flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <SiteHeader />
        <main className="relative z-0 flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
