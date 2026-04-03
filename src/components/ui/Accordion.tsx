"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/helpers";

export type AccordionItem = { id: string; title: string; content: ReactNode };

type AccordionProps = {
  items: AccordionItem[];
  className?: string;
};

export function Accordion({ items, className }: AccordionProps) {
  return (
    <div className={cn("ui-accordion", className)}>
      {items.map((item) => (
        <section key={item.id}>
          <h3>{item.title}</h3>
          <div>{item.content}</div>
        </section>
      ))}
    </div>
  );
}
