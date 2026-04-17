import type { DefaultSeoProps } from "next-seo/pages";

export const defaultSeo: DefaultSeoProps = {
  titleTemplate: "%s | Vansun Studio",
  defaultTitle: "Vansun Studio",
  description:
    "Vansun Studio: professional tattoo and piercing on Granville Street, Vancouver.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Vansun Studio",
  },
};
