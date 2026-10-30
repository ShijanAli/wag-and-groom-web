"use client";

import { useEffect, useMemo } from "react";
import { useFormState } from "react-hook-form";
import { CalendarClock, CreditCard, Globe, Lock, Mail, Save, Undo2 } from "lucide-react";
import { z } from "zod";
import { AppForm, useZodForm } from "@/components/common/form/AppForm";
import { FieldRow, SelectField, TextField } from "@/components/common/form/fields";
import { SubmitButton } from "@/components/common/form/SubmitButton";
import { FullPageLoader } from "@/components/common/FullPageLoader";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { timeAgo } from "@/lib/format";
import { PERMISSIONS as P } from "@/lib/permissions";
import { useSettings, useUpdateSettings } from "@/features/system/api";
import type { Setting } from "@/types/models";

/* Mirrors the backend SETTING_DEFINITIONS (validated again server-side). */
const url = z.union([z.literal(""), z.string().trim().url("Enter a full link, e.g. https://facebook.com/petplex")]);
const int = (min: number, max: number) => z.number({ invalid_type_error: "Enter a number" }).int("Whole numbers only").min(min, `Min ${min}`).max(max, `Max ${max}`);

const schema = z.object({
  site_name: z.string().trim().min(1, "Required").max(100),
  contact_email: z.string().trim().email("Enter a valid email"),
  contact_phone: z.string().trim().max(30),
  contact_address: z.string().trim().max(255),
  facebook: url,
  instagram: url,
  youtube: url,
  tiktok: url,
  booking_slot_interval_minutes: z.number(),
  booking_cancel_before_hours: int(0, 720),
  booking_advance_days: int(1, 365),
  booking_payment_timeout_minutes: int(0, 1440),
  usd_exchange_rate: z.number({ invalid_type_error: "Enter a number" }).positive("Must be greater than 0").max(10_000),
  admin_notification_email: z.string().trim().email("Enter a valid email"),
});
type Form = z.output<typeof schema>;
type Values = Record<string, unknown>;

const SOCIALS = ["facebook", "instagram", "youtube", "tiktok"] as const;
const SLOT_OPTIONS = [10, 15, 20, 30, 60].map((m) => ({ value: m, label: `Every ${m} minutes` }));

function toForm(values: Values): z.input<typeof schema> {
  const social = (values.social_links ?? {}) as Record<string, string>;
  return {
    site_name: String(values.site_name ?? ""),
    contact_email: String(values.contact_email ?? ""),
    contact_phone: String(values.contact_phone ?? ""),
    contact_address: String(values.contact_address ?? ""),
    ...Object.fromEntries(SOCIALS.map((k) => [k, social[k] ?? ""])),
    booking_slot_interval_minutes: Number(values.booking_slot_interval_minutes ?? 30),
    booking_cancel_before_hours: Number(values.booking_cancel_before_hours ?? 24),
    booking_advance_days: Number(values.booking_advance_days ?? 30),
    booking_payment_timeout_minutes: Number(values.booking_payment_timeout_minutes ?? 30),
    usd_exchange_rate: Number(values.usd_exchange_rate ?? 0),
    admin_notification_email: String(values.admin_notification_email ?? ""),
  } as z.input<typeof schema>;
}

/** Form → the API's key/value shape, only for keys that actually changed. */
function changedValues(v: Form, current: Values): Values {
  const { facebook, instagram, youtube, tiktok, ...flat } = v;
  const social = Object.fromEntries(Object.entries({ facebook, instagram, youtube, tiktok }).filter(([, u]) => u));
  const next: Values = { ...flat, social_links: social };
  return Object.fromEntries(Object.entries(next).filter(([k, val]) => JSON.stringify(val) !== JSON.stringify(current[k] ?? (k === "social_links" ? {} : undefined))));
}

export default function AdminSettings() {
  const { can } = useAuth();
  const settings = useSettings();
  const values = useMemo(() => Object.fromEntries((settings.data ?? []).map((s) => [s.key, s.value])), [settings.data]);
  const byKey = useMemo(() => new Map((settings.data ?? []).map((s) => [s.key, s])), [settings.data]);
  if (settings.isPending) return <FullPageLoader label="Loading settings…" />;
  return <SettingsForm values={values} byKey={byKey} readOnly={!can(P.SETTING.UPDATE)} />;
}

function SettingsForm({ values, byKey, readOnly }: { values: Values; byKey: Map<string, Setting>; readOnly: boolean }) {
  const update = useUpdateSettings();
  const form = useZodForm(schema, { defaultValues: toForm(values) });
  // after a save the query refetches → new baseline
  useEffect(() => form.reset(toForm(values)), [values, form]);

  const hint = (key: string) => byKey.get(key)?.description ?? undefined;
  const lastUpdate = [...byKey.values()].reduce((a, s) => (s.updatedAt > a ? s.updatedAt : a), "");

  return (
    <AppForm
      form={form}
      onSubmit={async (v) => {
        const changed = changedValues(v, values);
        if (Object.keys(changed).length) await update.mutateAsync(changed);
      }}
    >
      <PageHeader title="Settings" description={`Business details and rules used across the website, booking and payments.${lastUpdate ? ` Last changed ${timeAgo(lastUpdate)}.` : ""}`} />
      {readOnly && <p className="mb-4 rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">You can view settings but not change them.</p>}

      <fieldset disabled={readOnly} className="grid gap-6 xl:grid-cols-2">
        <Section icon={Globe} title="Business & contact" description="Shown on the website header, footer, contact section and in emails.">
          <TextField name="site_name" label="Business name" description={hint("site_name")} required />
          <FieldRow>
            <TextField name="contact_email" label="Public email" type="email" required />
            <TextField name="contact_phone" label="Public phone" type="tel" placeholder="+8801XXXXXXXXX" />
          </FieldRow>
          <TextField name="contact_address" label="Address" description="Also used for the Google Maps link." />
        </Section>

        <Section icon={Globe} title="Social media" description="Leave empty to hide. Shown in the footer and in search results.">
          <FieldRow>
            {SOCIALS.map((k) => (
              <TextField key={k} name={k} label={k[0].toUpperCase() + k.slice(1)} type="url" placeholder={`https://${k}.com/…`} />
            ))}
          </FieldRow>
        </Section>

        <Section icon={CalendarClock} title="Booking rules" description="Applied by the booking wizard and the API.">
          <SelectField name="booking_slot_interval_minutes" label="Start times" options={SLOT_OPTIONS} numeric description={hint("booking_slot_interval_minutes")} />
          <FieldRow>
            <TextField name="booking_advance_days" label="Book up to (days ahead)" type="number" min={1} max={365} description={hint("booking_advance_days")} />
            <TextField name="booking_cancel_before_hours" label="Free cancellation (hours before)" type="number" min={0} max={720} description={hint("booking_cancel_before_hours")} />
          </FieldRow>
          <TextField name="booking_payment_timeout_minutes" label="Unpaid booking timeout (minutes)" type="number" min={0} max={1440} description={hint("booking_payment_timeout_minutes")} />
        </Section>

        <div className="space-y-6">
          <Section icon={CreditCard} title="Payments">
            <TextField name="usd_exchange_rate" label="USD exchange rate" type="number" step="0.01" min={0} leading="৳" description={hint("usd_exchange_rate")} />
            <dl className="grid gap-3 rounded-xl bg-muted/50 p-4 text-sm sm:grid-cols-2">
              {(["base_currency", "supported_currencies"] as const).map((k) => (
                <div key={k}>
                  <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Lock className="h-3 w-3" aria-hidden /> {k === "base_currency" ? "Base currency" : "Accepted currencies"}
                  </dt>
                  <dd className="font-medium">{Array.isArray(values[k]) ? (values[k] as string[]).join(", ") : String(values[k] ?? "—")}</dd>
                </div>
              ))}
              <p className="text-xs text-muted-foreground sm:col-span-2">Fixed by the system — prices are stored in BDT.</p>
            </dl>
          </Section>
          <Section icon={Mail} title="Notifications">
            <TextField name="admin_notification_email" label="Team inbox email" type="email" description={hint("admin_notification_email")} required />
          </Section>
        </div>
      </fieldset>

      {!readOnly && <SaveBar onReset={() => form.reset(toForm(values))} />}
    </AppForm>
  );
}

function Section({ icon: Icon, title, description, children }: { icon: typeof Globe; title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4 text-primary" aria-hidden /> {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

/** Appears only when something changed — saving sends just the changed keys. */
function SaveBar({ onReset }: { onReset: () => void }) {
  const { isDirty } = useFormState();
  if (!isDirty) return null;
  return (
    <div className="sticky bottom-4 z-10 mt-6 flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-background/95 px-4 py-3 shadow-lg backdrop-blur">
      <span className="text-sm">You have unsaved changes</span>
      <div className="flex gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onReset}>
          <Undo2 className="mr-1.5 h-4 w-4" /> Discard
        </Button>
        <SubmitButton size="sm" icon={<Save className="mr-1.5 h-4 w-4" />} pendingText="Saving…">
          Save settings
        </SubmitButton>
      </div>
    </div>
  );
}
