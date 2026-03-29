"use client";

import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/helpers";
import { piercingPlacements } from "@/data/booking";

type PlacementSelectorProps = {
  name?: string;
  className?: string;
};

export function PlacementSelector({
  name = "placement",
  className,
}: PlacementSelectorProps) {
  return (
    <Select className={cn("placement-selector", className)} name={name} defaultValue="">
      <option value="" disabled>
        Placement
      </option>
      {piercingPlacements.map((p) => (
        <option key={p} value={p}>
          {p}
        </option>
      ))}
    </Select>
  );
}
