"use client";

import { useState } from "react";
import {
  type PiercingImageKey,
  type PiercingSelectionDef,
  defsForImage,
  getPiercingPriceCadById,
  getPiercingSelectionDef,
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

type PiercingVisualPickerProps = {
  selectedIds: string[];
  onToggle: (id: string) => void;
  className?: string;
};

/** Circular order: active in center, neighbours left & right (imaginary ring). */
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

function ChipList({
  defs,
  selectedSet,
  onToggle,
}: {
  defs: PiercingSelectionDef[];
  selectedSet: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <ul className="piercing-visual-picker__list" role="list">
      {defs.map((def) => {
        const selected = selectedSet.has(def.id);
        const price = getPiercingServiceCad(def);
        return (
          <li key={def.id} className="piercing-visual-picker__list-item">
            <button
              type="button"
              className={cn(
                "piercing-visual-picker__chip",
                selected && "piercing-visual-picker__chip--selected"
              )}
              aria-pressed={selected}
              aria-label={`${def.label}, ${formatCad(price)}`}
              onClick={() => onToggle(def.id)}
            >
              <span className="piercing-visual-picker__chip-label">
                {def.label}
              </span>
              <span className="piercing-visual-picker__chip-price">
                {formatCad(price)}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function PiercingVisualPicker({
  selectedIds,
  onToggle,
  className,
}: PiercingVisualPickerProps) {
  const [activeCategory, setActiveCategory] = useState<PiercingImageKey>(
    piercingImageOrder[0]
  );
  const selectedSet = new Set(selectedIds);
  const activeDefs = defsForImage(activeCategory);
  const selectedServices = selectedIds.map((id) => {
    const def = getPiercingSelectionDef(id);
    return {
      id,
      label: def?.label ?? id,
      price: getPiercingPriceCadById(id),
    };
  });
  const servicesTotal = selectedIds.reduce(
    (sum, id) => sum + getPiercingPriceCadById(id),
    0
  );

  return (
    <div className={cn("piercing-visual-picker", className)}>
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
                  id={`piercing-tab-${key}`}
                  className={cn(
                    "piercing-visual-picker__tab",
                    selected && "piercing-visual-picker__tab--active"
                  )}
                  aria-selected={selected}
                  aria-controls="piercing-options-panel"
                  onClick={() => setActiveCategory(key)}
                >
                  {meta.categoryTabLabel}
                </button>
              );
            })}
          </div>
        </div>

        <div
          id="piercing-options-panel"
          role="tabpanel"
          className="piercing-visual-picker__tab-panel piercing-visual-picker__sidebar"
          aria-labelledby={`piercing-tab-${activeCategory}`}
        >
          <ChipList
            defs={activeDefs}
            selectedSet={selectedSet}
            onToggle={onToggle}
          />
          <div
            className="piercing-visual-picker__total"
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="piercing-visual-picker__total-label">Services</span>
            <ul className="piercing-visual-picker__total-lines" role="list">
              {selectedServices.map((service) => (
                <li
                  key={service.id}
                  className="piercing-visual-picker__total-line"
                >
                  <span>{service.label}</span>
                  <span>{formatCad(service.price)}</span>
                </li>
              ))}
            </ul>
            <div className="piercing-visual-picker__total-final">
              <span>Total service</span>
              <span className="piercing-visual-picker__total-value">
                {formatCad(servicesTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
