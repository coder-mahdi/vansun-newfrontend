import { getPiercingSelectionDef } from "@/data/piercings-selection";
import type { JewelryStoreItem, JewelryUsageArea } from "@/lib/jewelry-store-api";

const AREA_LABELS: Record<JewelryUsageArea, string> = {
  "face-and-body": "Face & body",
  lips: "Lips",
  ear: "Ear",
};

/** Human-readable piercing fit for studio jewelry cards (booking catalog browse). */
export function jewelryFitLabel(item: JewelryStoreItem): string {
  if (item.piercing_type_ids.length > 0) {
    const labels = item.piercing_type_ids
      .map((id) => getPiercingSelectionDef(id)?.label ?? id)
      .filter(Boolean);
    const unique = [...new Set(labels)];
    if (unique.length > 0) return unique.join(", ");
  }
  if (item.usage_areas.length > 0) {
    return item.usage_areas.map((a) => AREA_LABELS[a]).join(", ");
  }
  return "General";
}
