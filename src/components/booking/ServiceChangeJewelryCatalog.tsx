"use client";

import { useState } from "react";
import Image from "next/image";
import {
  DEFAULT_JEWELRY_TIER,
  JEWELRY_TIER_PRICE_CAD,
} from "@/data/jewelry-tier-pricing";
import { jewelryFitLabel } from "@/lib/jewelry-fit-label";
import { cn } from "@/lib/helpers";
import type { JewelryStoreItem, JewelryTier } from "@/lib/jewelry-store-api";

const JEWELRY_TIERS: JewelryTier[] = [
  "basic",
  "standard",
  "premium",
  "pro-premium",
];

function formatCad(value: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(value);
}

function jewelryTierLabel(tier: JewelryTier): string {
  if (tier === "pro-premium") return "Pro premium";
  return tier.slice(0, 1).toUpperCase() + tier.slice(1);
}

type ServiceChangeJewelryCatalogProps = {
  items: JewelryStoreItem[];
  brokenCodes: Set<string>;
  onBrokenCode: (code: string) => void;
  selectedCode: string | null;
  onSelectItem: (tier: JewelryTier, code: string) => void;
  onOpenGallery: (payload: {
    urls: string[];
    index: number;
    code?: string;
  }) => void;
};

export function ServiceChangeJewelryCatalog({
  items,
  brokenCodes,
  onBrokenCode,
  selectedCode,
  onSelectItem,
  onOpenGallery,
}: ServiceChangeJewelryCatalogProps) {
  const [activeTier, setActiveTier] = useState<JewelryTier>(DEFAULT_JEWELRY_TIER);

  const visible = items.filter((item) => !brokenCodes.has(item.code));
  const tierItems = visible.filter((item) => item.tier === activeTier);

  if (visible.length === 0) {
    return (
      <p className="booking-wizard__sub booking-wizard__jewelry-catalog-empty">
        No studio jewelry is available to browse right now.
      </p>
    );
  }

  return (
    <div className="booking-wizard__jewelry-catalog">
      <div className="booking-wizard__options booking-wizard__options--tiers">
        {JEWELRY_TIERS.map((tier) => (
          <button
            key={tier}
            type="button"
            className={cn(
              "booking-wizard__option",
              activeTier === tier && "booking-wizard__option--selected"
            )}
            aria-pressed={activeTier === tier}
            onClick={() => setActiveTier(tier)}
          >
            <span className="booking-wizard__option-title">{jewelryTierLabel(tier)}</span>
            <span className="booking-wizard__option-meta">
              {formatCad(JEWELRY_TIER_PRICE_CAD[tier])}
            </span>
          </button>
        ))}
      </div>

      {tierItems.length === 0 ? (
        <p className="booking-wizard__sub booking-wizard__jewelry-catalog-empty">
          No pieces in {jewelryTierLabel(activeTier)} right now. Try another tier.
        </p>
      ) : (
        <div className="booking-wizard__jewelry-grid booking-wizard__jewelry-grid--catalog">
          {tierItems.map((item) => (
            <div
              key={`${activeTier}-${item.code}`}
              className={cn(
                "booking-wizard__jewelry-card",
                selectedCode === item.code && "booking-wizard__jewelry-card--selected"
              )}
            >
              <button
                type="button"
                className="booking-wizard__jewelry-card-main"
                onClick={() => onSelectItem(item.tier, item.code)}
              >
                <div className="booking-wizard__jewelry-image-wrap">
                  <Image
                    src={item.image_url}
                    alt={`Jewelry ${item.code}`}
                    fill
                    className="booking-wizard__jewelry-image"
                    sizes="(max-width: 859px) 45vw, 28vw"
                    decoding="async"
                    onError={() => onBrokenCode(item.code)}
                  />
                </div>
                <div className="booking-wizard__jewelry-code">
                  <span className="booking-wizard__jewelry-code-label">Jewelry code</span>
                  <span className="booking-wizard__jewelry-code-value">{item.code}</span>
                </div>
                <p className="booking-wizard__jewelry-fit">
                  <span className="booking-wizard__jewelry-fit-label">Suitable for</span>
                  {jewelryFitLabel(item)}
                </p>
              </button>
              {item.gallery_urls.length > 0 ? (
                <div className="booking-wizard__jewelry-thumbs">
                  {item.gallery_urls.map((url, gi) => (
                    <button
                      key={`${item.code}-g-${gi}`}
                      type="button"
                      className="booking-wizard__jewelry-thumb"
                      aria-label={`Larger photo ${gi + 2} for ${item.code}`}
                      onClick={() =>
                        onOpenGallery({
                          urls: [item.image_url, ...item.gallery_urls],
                          index: gi + 1,
                          code: item.code,
                        })
                      }
                    >
                      <span className="booking-wizard__jewelry-thumb-pad">
                        <Image
                          src={url}
                          alt={`Jewelry ${item.code}, extra photo ${gi + 2}`}
                          fill
                          className="booking-wizard__jewelry-thumb-img"
                          sizes="44px"
                          decoding="async"
                        />
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
