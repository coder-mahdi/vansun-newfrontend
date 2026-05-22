"use client";

import { useState } from "react";
import {
  type PiercingImageKey,
  type PiercingSelectionDef,
  defsForImage,
  getPiercingServiceCad,
  piercingImageOrder,
  PIERCING_IMAGE_META,
} from "@/data/piercings-selection";
import { cn } from "@/lib/helpers";

function formatCad(n: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(n);
}

function carouselSlots(active: PiercingImageKey): {
  key: PiercingImageKey;
  slot: "left" | "center" | "right";
}[] {
  const ix = piercingImageOrder.indexOf(active);
  const n = piercingImageOrder.length;
  const left = piercingImageOrder[(ix - 1 + n) % n];
  const right = piercingImageOrder[(ix + 1) % n];
  return [
    { key: left, slot: "left" },
    { key: active, slot: "center" },
    { key: right, slot: "right" },
  ];
}

function slotForImageKey(
  active: PiercingImageKey,
  imageKey: PiercingImageKey
): "left" | "center" | "right" {
  for (const { key, slot } of carouselSlots(active)) {
    if (key === imageKey) return slot;
  }
  return "center";
}

function PriceRow({ def }: { def: PiercingSelectionDef }) {
  const unit = getPiercingServiceCad(def);
  return (
    <li className="piercing-price-list-explorer__row">
      <span className="piercing-price-list-explorer__name">{def.label}</span>
      <span className="piercing-price-list-explorer__price">
        {formatCad(unit)}
        {def.pricing === "lip" ? (
          <span className="piercing-price-list-explorer__unit-note"> · each</span>
        ) : null}
      </span>
    </li>
  );
}

export function PiercingPriceListExplorer({ className }: { className?: string }) {
  const [activeCategory, setActiveCategory] = useState<PiercingImageKey>(
    piercingImageOrder[0]!
  );
  const activeDefs = defsForImage(activeCategory);

  return (
    <div className={cn("piercing-visual-picker piercing-price-list-explorer", className)}>
      <div className="piercing-visual-picker__main">
        <div className="piercing-visual-picker__media">
          <div
            className="piercing-visual-picker__carousel"
            aria-label="Piercing reference images"
          >
            {piercingImageOrder.map((imageKey) => {
              const slot = slotForImageKey(activeCategory, imageKey);
              const meta = PIERCING_IMAGE_META[imageKey];
              return (
                <div
                  key={imageKey}
                  className={cn(
                    "piercing-visual-picker__thumb",
                    slot === "left" && "piercing-visual-picker__thumb--left",
                    slot === "center" && "piercing-visual-picker__thumb--center",
                    slot === "right" && "piercing-visual-picker__thumb--right"
                  )}
                >
                  <div className="piercing-visual-picker__frame">
                    <img
                      src={meta.src}
                      alt={meta.alt}
                      className="piercing-visual-picker__image"
                      decoding="async"
                    />
                  </div>
                  <p className="piercing-visual-picker__thumb-label">{meta.title}</p>
                </div>
              );
            })}
          </div>

          <div
            className="piercing-visual-picker__tabs"
            role="tablist"
            aria-label="Piercing categories"
          >
            {piercingImageOrder.map((key) => {
              const meta = PIERCING_IMAGE_META[key];
              const selected = activeCategory === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  id={`price-list-tab-${key}`}
                  className={cn(
                    "piercing-visual-picker__tab",
                    selected && "piercing-visual-picker__tab--active"
                  )}
                  aria-selected={selected}
                  aria-controls="piercing-price-list-panel"
                  onClick={() => setActiveCategory(key)}
                >
                  {meta.categoryTabLabel}
                </button>
              );
            })}
          </div>
        </div>

        <div
          id="piercing-price-list-panel"
          role="tabpanel"
          className="piercing-visual-picker__tab-panel piercing-visual-picker__sidebar piercing-price-list-explorer__panel"
          aria-labelledby={`price-list-tab-${activeCategory}`}
        >
          <p className="piercing-price-list-explorer__panel-title">
            Service fees ({PIERCING_IMAGE_META[activeCategory].title})
          </p>
          <ul className="piercing-price-list-explorer__list" role="list">
            {activeDefs.map((def) => (
              <PriceRow key={def.id} def={def} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
