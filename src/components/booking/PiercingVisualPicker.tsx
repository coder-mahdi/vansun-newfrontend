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
  /** Count per piercing id (omitted or zero = not selected). */
  quantities: Record<string, number>;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
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
  quantities,
  onIncrement,
}: {
  defs: PiercingSelectionDef[];
  quantities: Record<string, number>;
  onIncrement: (id: string) => void;
}) {
  return (
    <ul className="piercing-visual-picker__list" role="list">
      {defs.map((def) => {
        const qty = quantities[def.id] ?? 0;
        const selected = qty > 0;
        const unit = getPiercingServiceCad(def);
        return (
          <li key={def.id} className="piercing-visual-picker__list-item">
            <div className="piercing-visual-picker__chip-row">
              <button
                type="button"
                className={cn(
                  "piercing-visual-picker__chip",
                  selected && "piercing-visual-picker__chip--selected"
                )}
                aria-label={
                  qty === 0
                    ? `Add ${def.label}, ${formatCad(unit)} each`
                    : `${def.label}, ${qty} selected, ${formatCad(unit)} each`
                }
                onClick={() => {
                  if (qty === 0) onIncrement(def.id);
                }}
              >
                <span className="piercing-visual-picker__chip-label">
                  {def.label}
                  {qty > 0 ? (
                    <span className="piercing-visual-picker__chip-qty" aria-hidden>
                      ×{qty}
                    </span>
                  ) : null}
                </span>
                <span className="piercing-visual-picker__chip-price">
                  {formatCad(unit)}
                  {def.pricing === "lip" ? (
                    <span className="piercing-visual-picker__chip-unit-note">
                      {" "}
                      · each
                    </span>
                  ) : null}
                  {qty > 1 ? (
                    <span className="piercing-visual-picker__chip-subtotal">
                      {" "}
                      · {formatCad(unit * qty)}
                    </span>
                  ) : null}
                </span>
              </button>
              {selected ? (
                <button
                  type="button"
                  className="piercing-visual-picker__chip-add"
                  aria-label={`Add another ${def.label}`}
                  onClick={(ev) => {
                    ev.preventDefault();
                    onIncrement(def.id);
                  }}
                >
                  +
                </button>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function PiercingVisualPicker({
  quantities,
  onIncrement,
  onDecrement,
  className,
}: PiercingVisualPickerProps) {
  const [activeCategory, setActiveCategory] = useState<PiercingImageKey>(
    piercingImageOrder[0]
  );
  const activeDefs = defsForImage(activeCategory);

  const selectedEntries = Object.entries(quantities).filter(([, q]) => q > 0);
  const selectedServices = selectedEntries.map(([id, qty]) => {
    const def = getPiercingSelectionDef(id);
    const unit = getPiercingPriceCadById(id);
    return {
      id,
      label: def?.label ?? id,
      qty,
      unit,
      line: unit * qty,
    };
  });
  const servicesTotal = selectedServices.reduce((sum, s) => sum + s.line, 0);

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
            quantities={quantities}
            onIncrement={onIncrement}
          />
          <div
            className="piercing-visual-picker__total"
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="piercing-visual-picker__total-label">Your cart</span>
            {selectedServices.length === 0 ? (
              <p className="piercing-visual-picker__total-empty">
                Tap a placement to add it. Use + for a second on the same side.
              </p>
            ) : (
              <ul className="piercing-visual-picker__total-lines" role="list">
                {selectedServices.map((service) => (
                  <li
                    key={service.id}
                    className="piercing-visual-picker__total-line piercing-visual-picker__total-line--cart"
                  >
                    <span className="piercing-visual-picker__total-line-name">
                      {service.label}
                    </span>
                    <div className="piercing-visual-picker__qty-stepper">
                      <button
                        type="button"
                        className="piercing-visual-picker__qty-btn"
                        aria-label={`Remove one ${service.label}`}
                        onClick={() => onDecrement(service.id)}
                      >
                        −
                      </button>
                      <span
                        className="piercing-visual-picker__qty-value"
                        aria-live="polite"
                      >
                        {service.qty}
                      </span>
                      <button
                        type="button"
                        className="piercing-visual-picker__qty-btn"
                        aria-label={`Add one ${service.label}`}
                        onClick={() => onIncrement(service.id)}
                      >
                        +
                      </button>
                    </div>
                    <span className="piercing-visual-picker__total-line-price">
                      {formatCad(service.line)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
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
