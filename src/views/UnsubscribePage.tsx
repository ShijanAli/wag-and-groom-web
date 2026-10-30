"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, MailX, XCircle } from "lucide-react";
import { PublicShell } from "@/components/site/PublicShell";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api/errors";
import { useSubscribe, useUnsubscribe } from "@/features/content/api";

/** Landing page of the signed link in every newsletter email: unsubscribes on load, offers to re-subscribe. */
export default function UnsubscribePage({ email, token }: { email?: string; token?: string }) {
  const unsubscribe = useUnsubscribe();
  const resubscribe = useSubscribe();
  const fired = useRef(false);
  const valid = !!email && !!token;

  useEffect(() => {
    if (!valid || fired.current) return; // StrictMode runs effects twice in dev
    fired.current = true;
    unsubscribe.mutate({ email, token });
  }, [valid, email, token, unsubscribe]);

  let icon = <Loader2 className="h-12 w-12 animate-spin text-primary" />;
  let title = "Unsubscribing…";
  let body: React.ReactNode = null;

  if (!valid || unsubscribe.isError) {
    icon = <XCircle className="h-12 w-12 text-destructive" />;
    title = "This link didn't work";
    body = <p>{valid ? getErrorMessage(unsubscribe.error) : "The unsubscribe link is incomplete."} Use the link from your latest email, or contact us and we&apos;ll remove you.</p>;
  } else if (resubscribe.isSuccess) {
    icon = <CheckCircle2 className="h-12 w-12 text-success" />;
    title = "Welcome back!";
    body = <p>You&apos;re subscribed again with {email}.</p>;
  } else if (unsubscribe.isSuccess) {
    icon = <MailX className="h-12 w-12 text-muted-foreground" />;
    title = "You're unsubscribed";
    body = (
      <>
        <p>
          We won&apos;t send newsletters to <strong className="text-foreground">{email}</strong> any more. Booking and account emails still arrive as usual.
        </p>
        <Button variant="outline" className="mt-4 rounded-full" disabled={resubscribe.isPending} onClick={() => resubscribe.mutate(email!)}>
          Unsubscribed by mistake? Re-subscribe
        </Button>
      </>
    );
  }

  return (
    <PublicShell>
      <section className="container mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-4 px-4 py-20 text-center" role="status" aria-live="polite">
        {icon}
        <h1 className="font-display text-3xl font-bold">{title}</h1>
        <div className="space-y-2 text-muted-foreground">{body}</div>
        <Link href="/" className="mt-4 text-sm font-medium text-primary hover:underline">
          Back to the home page
        </Link>
      </section>
    </PublicShell>
  );
}
