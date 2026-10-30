"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck, UserPlus } from "lucide-react";
import type { z } from "zod";
import { AuthLayout, AuthResult } from "@/components/auth/AuthLayout";
import { ResendVerificationButton } from "@/components/auth/ResendVerification";
import { AppForm, useZodForm } from "@/components/common/form/AppForm";
import { FieldRow, PasswordField, TextField } from "@/components/common/form/fields";
import { SubmitButton } from "@/components/common/form/SubmitButton";
import { Button } from "@/components/ui/button";
import { useApiMutation } from "@/lib/api/hooks";
import { SITE } from "@/lib/site";
import { authApi } from "@/features/auth/api";
import { registerSchema } from "@/features/auth/schemas";

type Values = z.output<typeof registerSchema>;

export default function RegisterPage() {
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const form = useZodForm(registerSchema, {
    defaultValues: { firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "" },
  });
  const register = useApiMutation(({ confirmPassword: _c, phone, ...body }: Values) => authApi.register({ ...body, phone: phone || undefined }), {
    successMessage: false,
    onSuccess: (_res, vars) => setRegisteredEmail(vars.email),
  });

  if (registeredEmail) {
    return (
      <AuthLayout title="Almost there!">
        <AuthResult
          icon={<MailCheck className="h-7 w-7" />}
          tone="success"
          title="Check your inbox"
          actions={
            <>
              <Button asChild>
                <Link href="/login">Go to sign in</Link>
              </Button>
              <ResendVerificationButton email={registeredEmail} />
            </>
          }
        >
          We sent a verification link to <span className="font-medium text-foreground">{registeredEmail}</span>. Click it to activate your account,
          then sign in.
        </AuthResult>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle={`Book services and adopt pets with ${SITE.name}`}
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <AppForm form={form} onSubmit={(v) => register.mutateAsync(v)} className="space-y-4">
        <FieldRow>
          <TextField name="firstName" label="First name" autoComplete="given-name" placeholder="Jane" required />
          <TextField name="lastName" label="Last name" autoComplete="family-name" placeholder="Doe" required />
        </FieldRow>
        <TextField name="email" label="Email" type="email" autoComplete="email" placeholder="you@example.com" required />
        <TextField name="phone" label="Phone" type="tel" autoComplete="tel" placeholder="+8801XXXXXXXXX" description="Optional — for booking reminders." />
        <FieldRow>
          <PasswordField name="password" label="Password" autoComplete="new-password" placeholder="••••••••" required />
          <PasswordField name="confirmPassword" label="Confirm password" autoComplete="new-password" placeholder="••••••••" required />
        </FieldRow>
        <p className="text-xs text-muted-foreground">8+ characters with an uppercase letter, a lowercase letter and a number.</p>
        <SubmitButton className="w-full" pendingText="Creating account…" icon={<UserPlus className="mr-2 h-4 w-4" />}>
          Create account
        </SubmitButton>
      </AppForm>
    </AuthLayout>
  );
}
