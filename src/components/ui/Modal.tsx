"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/helpers";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
};

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  if (!open) return null;
  return (
    <div className={cn("ui-modal", className)} role="dialog" aria-modal="true">
      {title ? <h2>{title}</h2> : null}
      {children}
      <button type="button" className="ui-button" onClick={onClose}>
        Close
      </button>
    </div>
  );
}
