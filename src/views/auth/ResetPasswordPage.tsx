"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, KeyRound, XCircle } from "lucide-react";
import { AuthLayout, AuthResult } from "@/components/auth/AuthLayout";
import { AppForm, useZodForm } from "@/components/common/form/AppForm";
import { PasswordField } from "@/components/common/form/fields";
import { SubmitButton } from "@/components/common/form/SubmitButton";
import { Button } from "@/components/ui/button";
import { useApiMutation } from "@/lib/api/hooks";
import { authApi } from "@/features/auth/api";
import { resetPasswordSchema } from "@/features/auth/schemas";

export default function ResetPasswordPage() {
  const token = useSearchParams().get("token");
  const [done, setDone] = useState(false);
  const form = useZodForm(resetPasswordSchema, { defaultValues: { password: "", confirmPassword: "" } });
  const reset = useApiMutation(({ password }: { password: string }) => authApi.resetPassword({ token: token ?? "", password }), {
    successMessage: false,
    onSuccess: () => setDone(true),
  });

  if (!token) {
    return (
      <AuthLayout title="Reset password">
        <AuthResult
          icon={<XCircle className="h-7 w-7" />}
          tone="danger"
          title="Link not valid"
          actions={
            <Button asChild>
              <Link href="/forgot-password">Request a new link</Link>
            </Button>
          }
        >
          This reset link is incomplete or has expired.
        </AuthResult>
      </AuthLayout>
    );
  }

  if (done) {
    return (
      <AuthLayout title="Reset password">
        <AuthResult
          icon={<CheckCircle2 className="h-7 w-7" />}
          tone="success"
          title="Password updated"
          actions={
            <Button asChild>
              <Link href="/login">Sign in with your new password</Link>
            </Button>
          }
        >
          For your security, you&apos;ve been signed out of all other devices.
        </AuthResult>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="8+ characters with an uppercase letter, a lowercase letter and a number."
      footer={
        <Link href="/forgot-password" className="font-medium text-primary hover:underline">
          Request a new link
        </Link>
      }
    >
      <AppForm form={form} onSubmit={(v) => reset.mutateAsync(v)} className="space-y-4">
        <PasswordField name="password" label="New password" autoComplete="new-password" placeholder="••••••••" autoFocus />
        <PasswordField name="confirmPassword" label="Confirm new password" autoComplete="new-password" placeholder="••••••••" />
        <SubmitButton className="w-full" pendingText="Saving…" icon={<KeyRound className="mr-2 h-4 w-4" />}>
          Update password
        </SubmitButton>
      </AppForm>
    </AuthLayout>
  );
}
