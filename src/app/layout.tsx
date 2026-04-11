import type { Metadata } from "next";
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
    default: "Vansun",
    template: "%s | Vansun",
  },
  description: "Vansun studio",
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
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full min-h-dvh flex flex-col font-sans">
        <SiteHeader />
        <main className="relative z-0 flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
