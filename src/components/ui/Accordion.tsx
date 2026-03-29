"use client";

import type { ReactNode } from "react";

export type AccordionItem = { id: string; title: string; content: ReactNode };

type AccordionProps = {
  items: AccordionItem[];
  className?: string;
};

export function Accordion({ items, className }: AccordionProps) {
  return (
    <div className={className}>
      {items.map((item) => (
        <section key={item.id}>
          <h3>{item.title}</h3>
          <div>{item.content}</div>
        </section>
      ))}
    </div>
  );
}
