"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
} as const;

export type ModalSize = keyof typeof SIZES;

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  size?: ModalSize;
  footer?: React.ReactNode;
  className?: string;
  /** Block closing by overlay click / Esc (e.g. while submitting). */
  dismissible?: boolean;
  /** Render children without the padded scroll body (FormModal supplies its own body + footer). */
  bare?: boolean;
  children?: React.ReactNode;
}

/** Shared body/footer classes so FormModal looks identical to Modal. */
export const modalBodyClass = "flex-1 overflow-y-auto px-6 py-5";
export const modalFooterClass = "flex flex-col-reverse gap-2 border-t px-6 py-4 sm:flex-row sm:justify-end";

/**
 * The single modal shell used everywhere (details, forms, pickers).
 * Header and footer stay fixed; the body scrolls on small screens.
 */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  size = "md",
  footer,
  className,
  dismissible = true,
  bare = false,
  children,
}: ModalProps) {
  const guard = (e: Event) => !dismissible && e.preventDefault();
  return (
    <Dialog open={open} onOpenChange={(o) => (dismissible || o) && onOpenChange(o)}>
      <DialogContent
        className={cn("flex max-h-[90vh] flex-col gap-0 p-0", SIZES[size], className)}
        onInteractOutside={guard}
        onEscapeKeyDown={guard}
      >
        <DialogHeader className="space-y-1 border-b px-6 py-4 text-left">
          <DialogTitle className="font-display text-xl">{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : (
            <DialogDescription className="sr-only">{typeof title === "string" ? title : "Dialog"}</DialogDescription>
          )}
        </DialogHeader>
        {bare ? children : <div className={modalBodyClass}>{children}</div>}
        {footer && <div className={modalFooterClass}>{footer}</div>}
      </DialogContent>
    </Dialog>
  );
}
