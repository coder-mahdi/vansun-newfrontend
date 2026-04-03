"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/helpers";
import { TattooStyleSelector } from "./TattooStyleSelector";

export function TattooBookingForm({ className }: { className?: string }) {
  return (
    <form className={cn("tattoo-booking-form", className)}>
      <Input name="name" placeholder="Name" required />
      <Input name="email" type="email" placeholder="Email" required />
      <TattooStyleSelector />
      <Button type="submit">Request</Button>
    </form>
  );
}
