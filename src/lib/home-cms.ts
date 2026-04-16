/**
 * Home page content sources (live mode):
 *
 * 1. **Plugin REST (preferred):** `GET {base}/content/home-about` whenever a
 *    vansun v1 base is set. Same rule as blogs: no `CONTENT_MODE=live` required.
 *    Priority: `NEXT_PUBLIC_CONTENT_API_URL`, `NEXT_PUBLIC_CONSENT_API_URL`,
 *    `NEXT_PUBLIC_API_URL` (each the v1 root, e.g. `…/wp-json/vansun/v1`).
 *
 * 2. **Fallback:** WordPress page + ACF only when `CONTENT_MODE=live` and
 *    `NEXT_PUBLIC_CMS_API_URL` is set.
 *
 * Optional: `NEXT_PUBLIC_HOME_CONTENT_API_PATH` (default `/content/home-about`).
 * Optional: `NEXT_PUBLIC_HOME_CMS_PAGE_SLUG` for ACF fallback (default `hero-data`).
 *
 * If curl shows `hero.images` but the site does not: deploy env must define the same
 * vansun v1 `base` as local; this module uses `cache: "no-store"` for home-about fetch
 * and the home page is `force-dynamic` so Next does not serve an old static payload.
 */

import {
  homeAboutBody,
  homeAboutImageUrl,
  homeAboutTitle,
} from "@/data/home-about";
import {
  getMockHeroImages,
  MOCK_HERO_SUBTITLE,
  MOCK_HERO_TITLE,
} from "@/data/home-hero-mock";
import {
  getJewelryGallerySlides,
  jewelryGalleryIntro,
  jewelryGalleryTitle,
  type JewelryGallerySlide,
} from "@/data/home-jewelry-gallery";
import { homeServices } from "@/data/home-services";
import { getConsentApiBase } from "@/lib/consent-api";
import {
  fetchWpMedia,
  fetchWpPageBySlug,
  getCmsApiOrigin,
  type HeroAcfBlock,
  type WpMedia,
} from "@/lib/cms-wordpress";
import { isLiveContentMode } from "@/lib/content-mode";

export type HomeHeroPayload = {
  title?: string;
  subtitle?: string;
  images: WpMedia[];
};

export type HomePagePayload = {
  hero: HomeHeroPayload;
  serviceImages: {
    tattoo: { url: string; alt: string };
    piercing: { url: string; alt: string };
  };
  jewelry: {
    title: string;
    intro: string;
    slides: JewelryGallerySlide[];
  };
  about: {
    title: string;
    body: string;
    imageUrl: string;
  };
};

function homePageSlug(): string {
  return process.env.NEXT_PUBLIC_HOME_CMS_PAGE_SLUG?.trim() || "hero-data";
}

/** Same vansun v1 root as `/content/blogs` (see `blog-api`). */
function vansunContentApiBase(): string {
  const content = process.env.NEXT_PUBLIC_CONTENT_API_URL?.trim();
  if (content) return content.replace(/\/+$/, "");
  const consent = getConsentApiBase().trim();
  if (consent) return consent.replace(/\/+$/, "");
  return "";
}

function homeAboutApiPath(): string {
  const p = process.env.NEXT_PUBLIC_HOME_CONTENT_API_PATH?.trim();
  if (p && p.startsWith("/")) return p;
  return "/content/home-about";
}

function apiImageToWpMedia(
  row: unknown,
  fallbackAlt: string
): WpMedia | null {
  const o = asRecord(row);
  if (!o) return null;
  const url = stringField(
    o.url,
    o.src,
    o.source_url,
    o.image_url,
    o.imageUrl
  );
  if (!url) return null;
  const alt = stringField(o.alt, o.alt_text) || fallbackAlt;
  return { source_url: url, alt_text: alt };
}

/** Plain text from API (`\r\n`) or HTML snippets from CMS. */
function normalizeAboutBody(raw: string): string {
  let s = raw.replace(/\r\n/g, "\n").trim();
  if (!s) return "";
  if (s.includes("<")) return wpPlainText(s);
  return s.replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * Maps `GET /vansun/v1/content/home-about` JSON to {@link HomePagePayload}.
 * Missing sections fall back to `mock` fields.
 */
function mapVansunHomeAboutApiPayload(
  data: unknown,
  mock: HomePagePayload
): HomePagePayload {
  const root = asRecord(data);
  if (!root) {
    return mock;
  }

  const heroObj = asRecord(root.hero);
  const heroImagesRaw =
    (heroObj &&
      (heroObj.images ??
        heroObj.hero_images ??
        heroObj.heroImages ??
        heroObj.gallery)) ??
    (Array.isArray(root.hero) ? root.hero : undefined);
  const heroImages: WpMedia[] = Array.isArray(heroImagesRaw)
    ? (heroImagesRaw
        .map((row, i) =>
          apiImageToWpMedia(
            row,
            `${mock.hero.title ?? "Hero"} image ${i + 1}`
          )
        )
        .filter(Boolean) as WpMedia[])
    : [];

  const hero: HomeHeroPayload = {
    title:
      stringField(heroObj?.title, heroObj?.heading) || mock.hero.title,
    subtitle:
      stringField(heroObj?.subtitle, heroObj?.sub_title) ||
      mock.hero.subtitle,
    images: heroImages.length > 0 ? heroImages : mock.hero.images,
  };

  const svc = asRecord(root.services);
  const tattooMedia = svc
    ? apiImageToWpMedia(svc.tattoo, mock.serviceImages.tattoo.alt)
    : null;
  const piercingMedia = svc
    ? apiImageToWpMedia(svc.piercing, mock.serviceImages.piercing.alt)
    : null;

  const serviceImages = {
    tattoo:
      tattooMedia?.source_url &&
      typeof tattooMedia.source_url === "string"
        ? {
            url: tattooMedia.source_url,
            alt:
              tattooMedia.alt_text?.trim() ||
              mock.serviceImages.tattoo.alt,
          }
        : mock.serviceImages.tattoo,
    piercing:
      piercingMedia?.source_url &&
      typeof piercingMedia.source_url === "string"
        ? {
            url: piercingMedia.source_url,
            alt:
              piercingMedia.alt_text?.trim() ||
              mock.serviceImages.piercing.alt,
          }
        : mock.serviceImages.piercing,
  };

  const jg =
    asRecord(root.jewelry_gallery) ?? asRecord(root.jewelryGallery);
  const jImages =
    jg && Array.isArray(jg.images) ? (jg.images as unknown[]) : [];
  const slides: JewelryGallerySlide[] = jImages
    .map((row, i) => {
      const m = apiImageToWpMedia(row, `Jewelry gallery image ${i + 1}`);
      if (!m?.source_url) return null;
      return {
        source_url: m.source_url,
        alt: m.alt_text?.trim() || `Jewelry gallery image ${i + 1}`,
      };
    })
    .filter(Boolean) as JewelryGallerySlide[];

  const hab = asRecord(root.home_about) ?? asRecord(root.homeAbout);
  let aboutTitle = mock.about.title;
  let aboutBody = mock.about.body;
  let imageUrl = mock.about.imageUrl;
  if (hab) {
    const t = stringField(hab.title, hab.heading);
    if (t) aboutTitle = t;
    const bodyRaw = stringField(hab.body, hab.text, hab.content);
    if (bodyRaw) aboutBody = normalizeAboutBody(bodyRaw);
    const aboutImg = apiImageToWpMedia(hab.image, aboutTitle);
    if (aboutImg?.source_url) imageUrl = aboutImg.source_url;
  }

  return {
    hero,
    serviceImages,
    jewelry: {
      title: jg
        ? stringField(jg.title, jg.section_title, jg.heading) ||
          mock.jewelry.title
        : mock.jewelry.title,
      intro: jg
        ? stringField(jg.intro, jg.intro_text, jg.description) ||
          mock.jewelry.intro
        : mock.jewelry.intro,
      slides: slides.length > 0 ? slides : mock.jewelry.slides,
    },
    about: {
      title: aboutTitle,
      body: aboutBody,
      imageUrl,
    },
  };
}

function asRecord(v: unknown): Record<string, unknown> | null {
  if (v && typeof v === "object" && !Array.isArray(v)) {
    return v as Record<string, unknown>;
  }
  return null;
}

function asMediaId(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v) && v > 0) return v;
  const o = asRecord(v);
  if (!o) return null;
  for (const k of ["ID", "id", "attachment_id"] as const) {
    const n = Number(o[k]);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

function asMediaIdArray(v: unknown): number[] {
  if (!Array.isArray(v)) return [];
  const ids: number[] = [];
  for (const item of v) {
    if (typeof item === "number" && item > 0) {
      ids.push(item);
      continue;
    }
    const id = asMediaId(item);
    if (id) ids.push(id);
  }
  return ids;
}

function stringField(...vals: unknown[]): string {
  for (const v of vals) {
    if (typeof v === "string") {
      const t = v.trim();
      if (t) return t;
    }
  }
  return "";
}

/** Turn WYSIWYG / line breaks into plain text with `\n` between blocks. */
function wpPlainText(htmlOrText: string): string {
  const s = htmlOrText.trim();
  if (!s) return "";
  return s
    .replace(/<\/p>\s*/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function loadMediaMap(ids: number[]): Promise<Map<number, WpMedia>> {
  const unique = [...new Set(ids.filter((n) => n > 0))];
  const map = new Map<number, WpMedia>();
  await Promise.all(
    unique.map(async (id) => {
      const m = await fetchWpMedia(id);
      if (m?.source_url) map.set(id, m);
    })
  );
  return map;
}

function pickServicesGroup(
  acf: Record<string, unknown>
): Record<string, unknown> | null {
  return (
    asRecord(acf.home_services) ??
    asRecord(acf.services) ??
    asRecord(acf.home_services_section)
  );
}

function pickJewelryGroup(
  acf: Record<string, unknown>
): Record<string, unknown> | null {
  return (
    asRecord(acf.home_jewelry_gallery) ??
    asRecord(acf.jewelry_gallery) ??
    asRecord(acf.home_jewelry) ??
    asRecord(acf.jewelry_home)
  );
}

function pickAboutGroup(
  acf: Record<string, unknown>
): Record<string, unknown> | null {
  return (
    asRecord(acf.home_about) ??
    asRecord(acf.about_home) ??
    asRecord(acf.about)
  );
}

function parseHeroBlock(acf: Record<string, unknown>): HeroAcfBlock | null {
  const h =
    asRecord(acf.hero) ?? asRecord(acf.home_hero) ?? asRecord(acf.hero_section);
  if (!h) return null;
  return h as unknown as HeroAcfBlock;
}

function heroImageIdsFromBlock(heroBlock: HeroAcfBlock): number[] {
  const raw = asRecord(heroBlock as unknown as Record<string, unknown>);
  return asMediaIdArray(
    heroBlock["hero-image"] ??
      heroBlock.hero_images ??
      heroBlock.images ??
      raw?.gallery ??
      raw?.hero_gallery
  );
}

export function buildMockHomePayload(): HomePagePayload {
  return {
    hero: {
      title: MOCK_HERO_TITLE,
      subtitle: MOCK_HERO_SUBTITLE,
      images: getMockHeroImages(),
    },
    serviceImages: {
      tattoo: {
        url: homeServices[0]!.imageUrl,
        alt: homeServices[0]!.imageAlt,
      },
      piercing: {
        url: homeServices[1]!.imageUrl,
        alt: homeServices[1]!.imageAlt,
      },
    },
    jewelry: {
      title: jewelryGalleryTitle,
      intro: jewelryGalleryIntro,
      slides: getJewelryGallerySlides(),
    },
    about: {
      title: homeAboutTitle,
      body: homeAboutBody,
      imageUrl: homeAboutImageUrl,
    },
  };
}

async function mergeCmsHome(
  acf: Record<string, unknown>,
  mock: HomePagePayload
): Promise<HomePagePayload> {
  const heroBlock = parseHeroBlock(acf);
  const heroImageIds = heroBlock ? heroImageIdsFromBlock(heroBlock) : [];

  const svc = pickServicesGroup(acf);
  let tattooId =
    svc != null
      ? asMediaId(
          svc.tattoo_image ?? svc.tattoo_service_image ?? svc.tattoo ?? svc.tattoo_image_id
        )
      : null;
  if (!tattooId) {
    tattooId = asMediaId(acf.tattoo_service_image ?? acf.tattoo_image);
  }

  let piercingId =
    svc != null
      ? asMediaId(
          svc.piercing_image ??
            svc.piercing_service_image ??
            svc.piercing ??
            svc.piercing_image_id
        )
      : null;
  if (!piercingId) {
    piercingId = asMediaId(acf.piercing_service_image ?? acf.piercing_image);
  }

  const jg = pickJewelryGroup(acf);
  const jewelryIds = jg
    ? asMediaIdArray(
        jg.gallery ??
          jg.images ??
          jg.jewelry_images ??
          jg.jewelry_gallery_images ??
          jg.slider_images ??
          jg.home_jewelry_images
      )
    : [];

  const ab = pickAboutGroup(acf);
  let aboutImageId = ab
    ? asMediaId(ab.image ?? ab.photo ?? ab.portrait ?? ab.about_image)
    : null;
  if (!aboutImageId) {
    aboutImageId = asMediaId(acf.about_image ?? acf.home_about_image);
  }

  const idSet: number[] = [];
  for (const id of heroImageIds) idSet.push(id);
  if (tattooId) idSet.push(tattooId);
  if (piercingId) idSet.push(piercingId);
  for (const id of jewelryIds) idSet.push(id);
  if (aboutImageId) idSet.push(aboutImageId);

  const map = await loadMediaMap(idSet);

  const heroImages = heroImageIds
    .map((id) => map.get(id))
    .filter((m): m is WpMedia => Boolean(m?.source_url));

  const hero: HomeHeroPayload = {
    title:
      stringField(heroBlock?.title, heroBlock?.heading) || mock.hero.title,
    subtitle:
      stringField(heroBlock?.subtitle, heroBlock?.sub_title) ||
      mock.hero.subtitle,
    images: heroImages.length > 0 ? heroImages : mock.hero.images,
  };

  const tattooMedia = tattooId ? map.get(tattooId) : undefined;
  const piercingMedia = piercingId ? map.get(piercingId) : undefined;

  const serviceImages = {
    tattoo:
      tattooMedia?.source_url && typeof tattooMedia.source_url === "string"
        ? {
            url: tattooMedia.source_url,
            alt:
              tattooMedia.alt_text?.trim() || mock.serviceImages.tattoo.alt,
          }
        : mock.serviceImages.tattoo,
    piercing:
      piercingMedia?.source_url &&
      typeof piercingMedia.source_url === "string"
        ? {
            url: piercingMedia.source_url,
            alt:
              piercingMedia.alt_text?.trim() ||
              mock.serviceImages.piercing.alt,
          }
        : mock.serviceImages.piercing,
  };

  const jewelrySlides: JewelryGallerySlide[] =
    jewelryIds.length > 0
      ? (jewelryIds
          .map((id, i) => {
            const m = map.get(id);
            if (!m?.source_url) return null;
            return {
              source_url: m.source_url,
              alt:
                m.alt_text?.trim() || `Jewelry gallery image ${i + 1}`,
            };
          })
          .filter(Boolean) as JewelryGallerySlide[])
      : mock.jewelry.slides;

  const jewelryTitle = jg
    ? stringField(jg.title, jg.section_title, jg.heading)
    : "";
  const jewelryIntro = jg
    ? stringField(jg.intro, jg.intro_text, jg.description)
    : "";

  const aboutTitle = ab
    ? stringField(ab.title, ab.heading, ab.about_title)
    : stringField(acf.about_title, acf.home_about_title);
  const aboutBodyRaw = ab
    ? stringField(ab.body, ab.text, ab.content, ab.description, ab.copy)
    : stringField(acf.about_body, acf.home_about_body);

  const aboutBody = aboutBodyRaw
    ? wpPlainText(aboutBodyRaw)
    : mock.about.body;

  const aboutImgMedia = aboutImageId ? map.get(aboutImageId) : undefined;
  const imageUrl =
    aboutImgMedia?.source_url &&
    typeof aboutImgMedia.source_url === "string"
      ? aboutImgMedia.source_url
      : mock.about.imageUrl;

  return {
    hero,
    serviceImages,
    jewelry: {
      title: jewelryTitle || mock.jewelry.title,
      intro: jewelryIntro || mock.jewelry.intro,
      slides:
        jewelrySlides.length > 0 ? jewelrySlides : mock.jewelry.slides,
    },
    about: {
      title: aboutTitle || mock.about.title,
      body: aboutBody,
      imageUrl,
    },
  };
}

export async function loadHomePageContent(): Promise<HomePagePayload> {
  const mock = buildMockHomePayload();

  const vansunBase = vansunContentApiBase();
  if (vansunBase) {
    try {
      const url = `${vansunBase}${homeAboutApiPath()}`;
      /* No Data Cache: curl and browser must see the same JSON-era payload (ISR was up to 5m stale). */
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as unknown;
        return mapVansunHomeAboutApiPayload(data, mock);
      }
    } catch {
      /* ACF or mock */
    }
  }

  if (isLiveContentMode() && getCmsApiOrigin()) {
    try {
      const page = await fetchWpPageBySlug<Record<string, unknown>>(
        homePageSlug()
      );
      const acf = page?.acf;
      if (acf && typeof acf === "object") {
        return await mergeCmsHome(acf as Record<string, unknown>, mock);
      }
    } catch {
      /* mock */
    }
  }

  return mock;
}
