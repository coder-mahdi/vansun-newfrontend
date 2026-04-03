"use client";

import { useId, useState } from "react";
import type { FAQ } from "@/data/faqs";
import { cn } from "@/lib/helpers";

type BookingFaqAccordionProps = {
  items: FAQ[];
  title?: string;
  className?: string;
};

export function BookingFaqAccordion({
  items,
  title = "FAQ",
  className,
}: BookingFaqAccordionProps) {
  const baseId = useId();
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId((cur) => (cur === id ? null : id));
  };

  if (items.length === 0) {
    return (
      <div className={cn("faq-container", "faq-empty", className)}>
        <p className="faq-empty-message">No questions listed yet.</p>
      </div>
    );
  }

  return (
    <div className={cn("faq-container", className)}>
      <h3 id="booking-faq-heading">{title}</h3>
      <div className="faq-list" role="list">
        {items.map((item) => {
          const isOpen = openId === item.id;
          const panelId = `${baseId}-panel-${item.id}`;
          const buttonId = `${baseId}-btn-${item.id}`;
          return (
            <div
              key={item.id}
              className={cn("faq-item", isOpen && "open")}
              role="listitem"
            >
              <button
                type="button"
                id={buttonId}
                className="faq-question"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
              >
                <span>{item.question}</span>
                <span className="faq-icon" aria-hidden>
                  ▼
                </span>
              </button>
              <div
                id={panelId}
                className="faq-answer"
                role="region"
                aria-labelledby={buttonId}
                hidden={!isOpen}
              >
                <div className="faq-answer-content" aria-hidden={!isOpen}>
                  {item.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
