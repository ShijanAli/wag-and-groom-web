"use client";

import { useState } from "react";
import Link from "next/link";
import { LogIn, MailWarning } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ResendVerificationButton } from "@/components/auth/ResendVerification";
import { AppForm, useZodForm } from "@/components/common/form/AppForm";
import { PasswordField, TextField } from "@/components/common/form/fields";
import { SubmitButton } from "@/components/common/form/SubmitButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import { applyFieldErrors, getErrorMessage, getStatus } from "@/lib/api/errors";
import { SITE } from "@/lib/site";
import { loginSchema } from "@/features/auth/schemas";

export default function LoginPage() {
  const { login } = useAuth();
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const form = useZodForm(loginSchema, { defaultValues: { email: "", password: "" } });

  const onSubmit = async (values: { email: string; password: string }) => {
    setUnverifiedEmail(null);
    try {
      const user = await login(values.email, values.password);
      toast.success(`Welcome back, ${user.firstName}!`);
      // the redirect itself is done by <GuestOnly> (see postLoginPath)
    } catch (err) {
      const message = getErrorMessage(err);
      if (getStatus(err) === 403 && /verify/i.test(message)) return setUnverifiedEmail(values.email);
      if (!applyFieldErrors(err, form.setError)) toast.error(message);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle={`Sign in to your ${SITE.name} account`}
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </>
      }
    >
      {unverifiedEmail && (
        <Alert className="border-warning/40 bg-warning/10">
          <MailWarning className="h-4 w-4" />
          <AlertTitle>Verify your email first</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>
              We sent a verification link to <span className="font-medium text-foreground">{unverifiedEmail}</span>. Open it, then sign in again.
            </p>
            <ResendVerificationButton email={unverifiedEmail} size="sm" className="bg-card" />
          </AlertDescription>
        </Alert>
      )}

      <AppForm form={form} onSubmit={onSubmit} className="space-y-4">
        <TextField name="email" label="Email" type="email" autoComplete="email" placeholder="you@example.com" autoFocus />
        <div className="space-y-2">
          <PasswordField name="password" label="Password" autoComplete="current-password" placeholder="••••••••" />
          <div className="text-right">
            <Link href="/forgot-password" className="text-xs font-medium text-muted-foreground hover:text-primary">
              Forgot password?
            </Link>
          </div>
        </div>
        <SubmitButton className="w-full" pendingText="Signing in…" icon={<LogIn className="mr-2 h-4 w-4" />}>
          Sign in
        </SubmitButton>
      </AppForm>
    </AuthLayout>
  );
}
