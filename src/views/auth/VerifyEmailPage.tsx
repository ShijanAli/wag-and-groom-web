"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { AuthLayout, AuthResult } from "@/components/auth/AuthLayout";
import { ResendVerificationButton } from "@/components/auth/ResendVerification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/api/errors";
import { authApi } from "@/features/auth/api";

type State = { kind: "loading" } | { kind: "success"; message: string } | { kind: "error"; message: string };

export default function VerifyEmailPage() {
  const token = useSearchParams().get("token");
  const [state, setState] = useState<State>(() => (token ? { kind: "loading" } : { kind: "error", message: "This verification link is incomplete." }));
  const [email, setEmail] = useState("");
  // Tokens are single-use: guard against React StrictMode's double effect run.
  const sent = useRef(false);

  useEffect(() => {
    if (!token || sent.current) return;
    sent.current = true;
    authApi
      .verifyEmail(token)
      .then((res) => setState({ kind: "success", message: res.message }))
      .catch((err) => setState({ kind: "error", message: getErrorMessage(err) }));
  }, [token]);

  return (
    <AuthLayout title="Email verification">
      {state.kind === "loading" && (
        <AuthResult icon={<Loader2 className="h-7 w-7 animate-spin" />} title="Verifying your email…" />
      )}

      {state.kind === "success" && (
        <AuthResult
          icon={<CheckCircle2 className="h-7 w-7" />}
          tone="success"
          title="You're verified!"
          actions={
            <Button asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          }
        >
          {state.message}
        </AuthResult>
      )}

      {state.kind === "error" && (
        <AuthResult
          icon={<XCircle className="h-7 w-7" />}
          tone="danger"
          title="Link not valid"
          actions={
            <>
              <Input type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" />
              <ResendVerificationButton email={email.trim()} />
              <Button variant="ghost" asChild>
                <Link href="/login">Back to sign in</Link>
              </Button>
            </>
          }
        >
          {state.message} Enter your email to get a fresh link.
        </AuthResult>
      )}
    </AuthLayout>
  );
}
