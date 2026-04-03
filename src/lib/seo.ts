import type { DefaultSeoProps } from "next-seo/pages";

export const defaultSeo: DefaultSeoProps = {
  titleTemplate: "%s | Vansun",
  defaultTitle: "Vansun",
  description: "Vansun studio",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Vansun",
  },
};
