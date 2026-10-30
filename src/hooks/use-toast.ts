"use client";

/**
 * Compatibility shim: the app uses ONE toast system (sonner).
 * Older views call `toast({ title, description, variant })`; this forwards them to sonner.
 * New code should `import { toast } from "sonner"` directly.
 */
import { toast as sonner } from "sonner";

interface LegacyToast {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "destructive";
}

export function toast({ title, description, variant }: LegacyToast) {
  const fn = variant === "destructive" ? sonner.error : sonner.success;
  return fn(title as string, { description });
}

export const useToast = () => ({ toast });
