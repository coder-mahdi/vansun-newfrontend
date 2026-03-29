"use client";

import { tattooStyles } from "@/data/booking";
import { Select } from "@/components/ui/Select";

type TattooStyleSelectorProps = {
  name?: string;
  className?: string;
};

export function TattooStyleSelector({
  name = "style",
  className,
}: TattooStyleSelectorProps) {
  return (
    <Select className={className} name={name} defaultValue="">
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
