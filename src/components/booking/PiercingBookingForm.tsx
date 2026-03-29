"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PlacementSelector } from "./PlacementSelector";

export function PiercingBookingForm({ className }: { className?: string }) {
  return (
    <form className={className}>
      <Input name="name" placeholder="Name" required />
      <Input name="email" type="email" placeholder="Email" required />
      <PlacementSelector />
      <Button type="submit">Request</Button>
    </form>
  );
}
