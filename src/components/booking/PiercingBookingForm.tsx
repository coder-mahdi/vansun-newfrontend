"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/helpers";
import { PlacementSelector } from "./PlacementSelector";

export function PiercingBookingForm({ className }: { className?: string }) {
  return (
    <form className={cn("piercing-booking-form", className)}>
      <Input name="name" placeholder="Name" required />
      <Input name="email" type="email" placeholder="Email" required />
      <PlacementSelector />
      <Button type="submit">Request</Button>
    </form>
  );
}
