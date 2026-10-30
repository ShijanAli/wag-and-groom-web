"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { AppForm, useZodForm } from "@/components/common/form/AppForm";
import { FieldRow, TextareaField, TextField } from "@/components/common/form/fields";
import { SubmitButton } from "@/components/common/form/SubmitButton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { fullName } from "@/lib/auth";
import { contactHooks } from "./api";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(/^$|^\+?[0-9\s-]{7,20}$/, "Enter a valid phone number"),
  subject: z.string().trim().min(3, "A few words, please").max(200),
  message: z.string().trim().min(10, "Tell us a little more (10+ characters)").max(5000),
});

/** Website contact form → POST /contact (lands in Admin → Messages). Pre-fills name/email for signed-in users. */
export function ContactForm() {
  const { user } = useAuth();
  const [sent, setSent] = useState(false);
  const create = contactHooks.useCreate({ successMessage: false, invalidate: [] });
  const empty = { name: user ? fullName(user) : "", email: user?.email ?? "", phone: user?.phone ?? "", subject: "", message: "" };
  const form = useZodForm(schema, { defaultValues: empty });

  return (
    <div className="rounded-3xl border border-border bg-card p-8 shadow-xl shadow-foreground/5">
      {sent ? (
        <div className="flex min-h-[380px] flex-col items-center justify-center gap-3 text-center" role="status">
          <CheckCircle2 className="h-14 w-14 text-success" />
          <h3 className="font-display text-2xl font-semibold">Message sent!</h3>
          <p className="max-w-sm text-muted-foreground">Thanks for reaching out — we usually reply within one business day.</p>
          <Button variant="outline" className="mt-2 rounded-full" onClick={() => (form.reset({ ...empty, subject: "", message: "" }), setSent(false))}>
            Send another message
          </Button>
        </div>
      ) : (
        <>
          <h3 className="font-display text-2xl font-semibold">Send us a message</h3>
          <p className="mb-6 mt-1 text-sm text-muted-foreground">We usually reply within one business day.</p>
          <AppForm form={form} className="space-y-4" onSubmit={async (v) => (await create.mutateAsync({ ...v, phone: v.phone || undefined }), setSent(true))}>
            <FieldRow>
              <TextField name="name" label="Your name" autoComplete="name" required />
              <TextField name="email" label="Email" type="email" autoComplete="email" required />
            </FieldRow>
            <FieldRow>
              <TextField name="phone" label="Phone" type="tel" autoComplete="tel" placeholder="Optional" />
              <TextField name="subject" label="Subject" placeholder="e.g. Grooming for a senior dog" required />
            </FieldRow>
            <TextareaField name="message" label="Message" rows={5} placeholder="Tell us about your pet and what you need…" required />
            <SubmitButton size="lg" className="h-14 w-full gap-2 rounded-xl text-base" pendingText="Sending…">
              Send message <ArrowRight className="h-4 w-4" />
            </SubmitButton>
          </AppForm>
        </>
      )}
    </div>
  );
}
