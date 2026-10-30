"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useApiMutation } from "@/lib/api/hooks";
import { authApi } from "@/features/auth/api";

const COOLDOWN_SECONDS = 60;

/** "Resend verification email" with a 60s cooldown so users can't spam the mail provider. */
export function ResendVerificationButton({ email, ...props }: { email: string } & ButtonProps) {
  const [left, setLeft] = useState(0);
  const resend = useApiMutation(() => authApi.resendVerification(email), {
    successMessage: "If the account needs verification, a new email is on its way.",
    onSuccess: () => setLeft(COOLDOWN_SECONDS),
  });

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  return (
    <Button type="button" variant="outline" disabled={!email || resend.isPending || left > 0} onClick={() => resend.mutate()} {...props}>
      {resend.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
      {left > 0 ? `Resend in ${left}s` : "Resend verification email"}
    </Button>
  );
}
