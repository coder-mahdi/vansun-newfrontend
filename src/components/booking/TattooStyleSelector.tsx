"use client";

import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/helpers";
import { tattooStyles } from "@/data/booking";

type TattooStyleSelectorProps = {
  name?: string;
  className?: string;
};

export function TattooStyleSelector({
  name = "style",
  className,
}: TattooStyleSelectorProps) {
  return (
    <Select className={cn("tattoo-style-selector", className)} name={name} defaultValue="">
      <option value="" disabled>
        Style
      </option>
      {tattooStyles.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </Select>
  );
}
