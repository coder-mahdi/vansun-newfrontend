"use client";

import { piercingPlacements } from "@/data/booking";
import { Select } from "@/components/ui/Select";

type PlacementSelectorProps = {
  name?: string;
  className?: string;
};

export function PlacementSelector({
  name = "placement",
  className,
}: PlacementSelectorProps) {
  return (
    <Select className={className} name={name} defaultValue="">
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
