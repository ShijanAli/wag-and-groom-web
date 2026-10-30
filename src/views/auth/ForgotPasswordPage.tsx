"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MailCheck, Send } from "lucide-react";
import { AuthLayout, AuthResult } from "@/components/auth/AuthLayout";
import { AppForm, useZodForm } from "@/components/common/form/AppForm";
import { TextField } from "@/components/common/form/fields";
import { SubmitButton } from "@/components/common/form/SubmitButton";
import { Button } from "@/components/ui/button";
import { useApiMutation } from "@/lib/api/hooks";
import { authApi } from "@/features/auth/api";
import { emailOnlySchema } from "@/features/auth/schemas";

export default function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const form = useZodForm(emailOnlySchema, { defaultValues: { email: "" } });
  const send = useApiMutation(({ email }: { email: string }) => authApi.forgotPassword(email), {
    successMessage: false,
    onSuccess: (_r, v) => setSentTo(v.email),
  });

  const back = (
    <Link href="/login" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
      <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
    </Link>
  );

  if (sentTo) {
    return (
      <AuthLayout title="Reset your password" footer={back}>
        <AuthResult
          icon={<MailCheck className="h-7 w-7" />}
          tone="success"
          title="Check your email"
          actions={
            <Button variant="outline" onClick={() => setSentTo(null)}>
              Use a different email
            </Button>
          }
        >
          If an account exists for <span className="font-medium text-foreground">{sentTo}</span>, you&apos;ll get a reset link shortly. It expires in 30
          minutes.
        </AuthResult>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot password?" subtitle="Enter your email and we'll send you a reset link." footer={back}>
      <AppForm form={form} onSubmit={(v) => send.mutateAsync(v)} className="space-y-4">
        <TextField name="email" label="Email" type="email" autoComplete="email" placeholder="you@example.com" autoFocus />
        <SubmitButton className="w-full" pendingText="Sending…" icon={<Send className="mr-2 h-4 w-4" />}>
          Send reset link
        </SubmitButton>
      </AppForm>
    </AuthLayout>
  );
}
