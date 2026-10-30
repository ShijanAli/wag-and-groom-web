"use client";

import { Loader2 } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Button, type ButtonProps } from "@/components/ui/button";

/** Submit button that disables + spins while the surrounding AppForm submits. */
export function SubmitButton({ children, pendingText, icon, disabled, ...props }: ButtonProps & { pendingText?: string; icon?: React.ReactNode }) {
  const { formState } = useFormContext();
  const pending = formState.isSubmitting;
  return (
    <Button type="submit" disabled={pending || disabled} {...props}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : icon}
      {pending && pendingText ? pendingText : children}
    </Button>
  );
}
