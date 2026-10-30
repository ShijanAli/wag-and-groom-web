"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { addDays, format, parse } from "date-fns";
import {
  ArrowLeft,
  CalendarCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  LogIn,
  PawPrint,
  Plus,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { AppForm, useZodForm } from "@/components/common/form/AppForm";
import { SubmitButton } from "@/components/common/form/SubmitButton";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/api/errors";
import { formatDuration, formatMoney, formatTime, toApiDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { servicesApi, usePetTypeOptions } from "@/features/catalog/api";
import { myPetHooks } from "@/features/pets/api";
import { PetFields, petSchema, toPetForm, toPetInput } from "@/features/pets/PetFields";
import { usePublicSettings } from "@/features/settings/api";
import type { Booking, Pet, Service, Slot } from "@/types/models";
import { bookingsApi, useAvailability, useCreateBooking, usePayOnline, type PromoPreview } from "./api";

type Step = "service" | "pet" | "time" | "review" | "done";
const STEPS: { key: Exclude<Step, "done">; label: string }[] = [
  { key: "service", label: "Service" },
  { key: "pet", label: "Pet" },
  { key: "time", label: "Date & time" },
  { key: "review", label: "Confirm" },
];

interface Draft {
  service?: Service;
  pet?: Pet;
  date?: string;
  slot?: Slot;
  staffId?: number;
  note: string;
  promo?: PromoPreview;
}

export interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-select a service (e.g. "Book" on a service card). */
  serviceId?: number;
}

/**
 * The booking wizard: service → pet → date & slot → confirm → pay.
 * Everything comes from the API — live availability, promo validation, SSLCommerz payment.
 */
export function BookingModal({ open, onOpenChange, serviceId }: BookingModalProps) {
  const { user, status } = useAuth();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        {status !== "authenticated" || !user ? <SignInPrompt loading={status === "loading"} /> : <Wizard serviceId={serviceId} onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function SignInPrompt({ loading }: { loading: boolean }) {
  const pathname = usePathname();
  return (
    <div className="space-y-5 p-8 text-center">
      <DialogHeader className="items-center space-y-3 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <CalendarCheck className="h-7 w-7 text-primary" />
        </span>
        <DialogTitle className="font-display text-2xl">Sign in to book</DialogTitle>
        <DialogDescription>Your bookings, pets and payments live in your account — it takes a minute to create one.</DialogDescription>
      </DialogHeader>
      {loading ? (
        <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href={`/login?from=${encodeURIComponent(pathname)}`}>
              <LogIn className="mr-2 h-4 w-4" /> Sign in
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/register">Create account</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

function Wizard({ serviceId, onClose }: { serviceId?: number; onClose: () => void }) {
  const [step, setStep] = useState<Step>("service");
  const [draft, setDraft] = useState<Draft>({ note: "" });
  const [booking, setBooking] = useState<Booking | null>(null);
  const patch = useCallback((p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p })), []);

  const services = useQuery({
    queryKey: ["services", "list", { status: "active", limit: 100, scope: "booking" }],
    queryFn: () => servicesApi.list({ status: "active", limit: 100, sortBy: "sortOrder", sortOrder: "asc" }),
    staleTime: 5 * 60_000,
  });

  // Pre-selected service → jump straight to choosing the pet
  useEffect(() => {
    if (!serviceId || draft.service || !services.data) return;
    const s = services.data.data.find((x) => x.id === serviceId);
    if (s) {
      patch({ service: s });
      setStep("pet");
    }
  }, [serviceId, services.data, draft.service, patch]);

  const index = STEPS.findIndex((s) => s.key === step);
  const back = () => setStep(STEPS[Math.max(0, index - 1)].key);

  return (
    <>
      <DialogHeader className="space-y-3 border-b px-6 py-4 text-left">
        <DialogTitle className="font-display text-xl">{step === "done" ? "Booking placed 🎉" : "Book an appointment"}</DialogTitle>
        <DialogDescription className="sr-only">Choose a service, your pet and a time</DialogDescription>
        {step !== "done" && (
          <ol className="flex items-center gap-1.5" aria-label="Progress">
            {STEPS.map((s, i) => (
              <li key={s.key} className="flex flex-1 flex-col gap-1">
                <span className={cn("h-1.5 rounded-full transition-colors", i <= index ? "bg-primary" : "bg-muted")} />
                <span className={cn("hidden text-[11px] font-medium sm:block", i === index ? "text-foreground" : "text-muted-foreground")}>{s.label}</span>
              </li>
            ))}
          </ol>
        )}
      </DialogHeader>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {step === "service" && (
          <StepService
            services={services.data?.data}
            loading={services.isPending}
            selected={draft.service}
            onSelect={(service) => {
              // a different service invalidates pet compatibility, slot and promo
              setDraft((d) => (d.service?.id === service.id ? d : { note: d.note, service }));
              setStep("pet");
            }}
          />
        )}
        {step === "pet" && draft.service && (
          <StepPet
            service={draft.service}
            selected={draft.pet}
            onSelect={(pet) => {
              patch({ pet });
              setStep("time");
            }}
          />
        )}
        {step === "time" && draft.service && (
          <StepTime
            service={draft.service}
            date={draft.date}
            slot={draft.slot}
            staffId={draft.staffId}
            onChange={patch}
            onNext={() => setStep("review")}
          />
        )}
        {step === "review" && (
          <StepReview
            draft={draft}
            onChange={patch}
            onBooked={(b) => {
              setBooking(b);
              setStep("done");
            }}
          />
        )}
        {step === "done" && booking && <StepDone booking={booking} onClose={onClose} />}
      </div>

      {index > 0 && step !== "done" && (
        <div className="border-t px-6 py-3">
          <Button variant="ghost" size="sm" onClick={back}>
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
          </Button>
        </div>
      )}
    </>
  );
}

/* ───────────────────────── step 1: service ───────────────────────── */

function StepService({ services, loading, selected, onSelect }: { services?: Service[]; loading: boolean; selected?: Service; onSelect: (s: Service) => void }) {
  if (loading) return <ListSkeleton />;
  if (!services?.length) return <p className="py-10 text-center text-sm text-muted-foreground">No services are open for booking right now.</p>;
  return (
    <div className="grid gap-2.5" role="radiogroup" aria-label="Service">
      {services.map((s) => (
        <ChoiceCard key={s.id} selected={selected?.id === s.id} onClick={() => onSelect(s)} label={s.name}>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Thumb src={s.image} icon={Sparkles} />
            <div className="min-w-0">
              <p className="truncate font-medium">{s.name}</p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" /> {formatDuration(s.durationMinutes)} · {s.petTypes.map((t) => t.name).join(", ")}
              </p>
            </div>
          </div>
          <Price service={s} />
        </ChoiceCard>
      ))}
    </div>
  );
}

/* ───────────────────────── step 2: pet ───────────────────────── */

function StepPet({ service, selected, onSelect }: { service: Service; selected?: Pet; onSelect: (p: Pet) => void }) {
  const pets = myPetHooks.useList({ limit: 50, sortBy: "name", sortOrder: "asc" });
  const [adding, setAdding] = useState(false);
  const allowed = new Set(service.petTypes.map((t) => t.id));
  const list = pets.data?.data ?? [];

  if (pets.isPending) return <ListSkeleton />;
  if (adding || list.length === 0)
    return <QuickAddPet service={service} canCancel={list.length > 0} onCancel={() => setAdding(false)} onCreated={onSelect} />;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Who is coming for <span className="font-medium text-foreground">{service.name}</span>?
      </p>
      <div className="grid gap-2.5 sm:grid-cols-2" role="radiogroup" aria-label="Pet">
        {list.map((p) => {
          const ok = allowed.has(p.petTypeId);
          const vaccineMissing = service.requiresVaccination && !p.isVaccinated;
          return (
            <ChoiceCard key={p.id} selected={selected?.id === p.id} disabled={!ok || vaccineMissing} onClick={() => onSelect(p)} label={p.name}>
              <div className="flex min-w-0 items-center gap-3">
                <Thumb src={p.photo} icon={PawPrint} round />
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {!ok ? `Not for ${p.petType.name}s` : vaccineMissing ? "Vaccination required" : [p.petType.name, p.breed].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
            </ChoiceCard>
          );
        })}
      </div>
      <Button variant="outline" className="w-full border-dashed" onClick={() => setAdding(true)}>
        <Plus className="mr-2 h-4 w-4" /> Add another pet
      </Button>
    </div>
  );
}

function QuickAddPet({ service, canCancel, onCancel, onCreated }: { service: Service; canCancel: boolean; onCancel: () => void; onCreated: (p: Pet) => void }) {
  const types = usePetTypeOptions();
  const allowed = new Set(service.petTypes.map((t) => t.id));
  const typeOptions = (types.data ?? []).filter((o) => allowed.has(o.value));
  const form = useZodForm(petSchema, { defaultValues: toPetForm(null, { petTypeId: typeOptions.length === 1 ? typeOptions[0].value : undefined }) });
  const create = myPetHooks.useCreate({ successMessage: (r) => `${r.data.name} added` });

  return (
    <AppForm form={form} onSubmit={async (v) => onCreated((await create.mutateAsync(toPetInput(v))).data)} className="space-y-4">
      <div>
        <p className="font-medium">Add your pet</p>
        <p className="text-sm text-muted-foreground">We&apos;ll save it to your account for next time.</p>
      </div>
      <PetFields typeOptions={typeOptions} compact />
      <div className="flex justify-end gap-2">
        {canCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <SubmitButton pendingText="Saving…">Save & continue</SubmitButton>
      </div>
    </AppForm>
  );
}

/* ───────────────────────── step 3: date & time ───────────────────────── */

const PERIODS = [
  { label: "Morning", test: (t: string) => t < "12:00" },
  { label: "Afternoon", test: (t: string) => t >= "12:00" && t < "17:00" },
  { label: "Evening", test: (t: string) => t >= "17:00" },
];

function StepTime({
  service,
  date,
  slot,
  staffId,
  onChange,
  onNext,
}: {
  service: Service;
  date?: string;
  slot?: Slot;
  staffId?: number;
  onChange: (p: Partial<Draft>) => void;
  onNext: () => void;
}) {
  const settings = usePublicSettings();
  const avail = useAvailability(service.id, date);
  const today = new Date();
  const maxDate = addDays(today, settings.data?.booking_advance_days ?? 30);

  // a refetch can remove the chosen slot (someone else booked it) → clear the selection
  useEffect(() => {
    if (slot && avail.data && !avail.data.slots.some((s) => s.startTime === slot.startTime)) onChange({ slot: undefined, staffId: undefined });
  }, [avail.data, slot, onChange]);

  return (
    <div className="grid gap-6 md:grid-cols-[auto_1fr]">
      <div className="mx-auto rounded-xl border">
        <Calendar
          mode="single"
          selected={date ? parse(date, "yyyy-MM-dd", new Date()) : undefined}
          onSelect={(d) => d && onChange({ date: toApiDate(d), slot: undefined, staffId: undefined })}
          fromDate={today}
          toDate={maxDate}
        />
      </div>

      <div className="min-w-0 space-y-4">
        {!date ? (
          <EmptyHint icon={CalendarDays} text="Pick a day to see free times." />
        ) : avail.isPending ? (
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 9 }, (_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : avail.isError ? (
          <EmptyHint icon={X} text={getErrorMessage(avail.error)} />
        ) : avail.data.closed ? (
          <EmptyHint icon={X} text={`We're closed that day${avail.data.reason ? ` — ${avail.data.reason}` : ""}. Please pick another date.`} />
        ) : avail.data.slots.length === 0 ? (
          <EmptyHint icon={Clock} text="Fully booked or nobody works that day. Try another date." />
        ) : (
          <>
            <p className="text-sm font-medium">{format(parse(date, "yyyy-MM-dd", new Date()), "EEEE, d MMMM")}</p>
            {PERIODS.map(({ label, test }) => {
              const slots = avail.data.slots.filter((s) => test(s.startTime));
              if (!slots.length) return null;
              return (
                <div key={label} className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="radiogroup" aria-label={`${label} times`}>
                    {slots.map((s) => {
                      const on = slot?.startTime === s.startTime;
                      return (
                        <button
                          key={s.startTime}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          onClick={() => onChange({ slot: s, staffId: undefined })}
                          className={cn(
                            "rounded-lg border px-2 py-2 text-sm font-medium transition-colors",
                            on ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/60 hover:bg-primary/5",
                          )}
                        >
                          {formatTime(s.startTime)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {slot && slot.staff.length > 1 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Who would you like?</p>
                <div className="flex flex-wrap gap-2">
                  <StaffChip active={!staffId} onClick={() => onChange({ staffId: undefined })}>
                    Any available
                  </StaffChip>
                  {slot.staff.map((m) => (
                    <StaffChip key={m.id} active={staffId === m.id} onClick={() => onChange({ staffId: m.id })}>
                      <UserAvatar user={m} className="h-5 w-5" /> {m.firstName}
                    </StaffChip>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <Button className="w-full" disabled={!slot} onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  );
}

/* ───────────────────────── step 4: confirm ───────────────────────── */

function StepReview({ draft, onChange, onBooked }: { draft: Draft; onChange: (p: Partial<Draft>) => void; onBooked: (b: Booking) => void }) {
  const { service, pet, date, slot, staffId, promo, note } = draft;
  const [code, setCode] = useState(promo?.code ?? "");
  const [checking, setChecking] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const create = useCreateBooking();
  const settings = usePublicSettings();

  const price = Number(service!.discountPrice ?? service!.price);
  const total = promo?.totalAmount ?? price;
  const staff = slot?.staff.find((s) => s.id === staffId);

  const applyPromo = async () => {
    const c = code.trim().toUpperCase();
    if (!c) return;
    setChecking(true);
    setPromoError(null);
    try {
      onChange({ promo: (await bookingsApi.validatePromo(c, service!.id)).data });
    } catch (err) {
      setPromoError(getErrorMessage(err));
      onChange({ promo: undefined });
    } finally {
      setChecking(false);
    }
  };

  const confirm = async () => {
    try {
      const res = await create.mutateAsync({
        serviceId: service!.id,
        petId: pet!.id,
        date: date!,
        startTime: slot!.startTime,
        staffId,
        promoCode: promo?.code,
        customerNote: note.trim() || undefined,
      });
      onBooked(res.data);
    } catch {
      /* toast shown by the mutation; slot may be gone → user goes back */
    }
  };

  const rows = useMemo(
    () => [
      { label: "Service", value: service!.name },
      { label: "Pet", value: `${pet!.name} (${pet!.petType.name})` },
      { label: "When", value: `${format(parse(date!, "yyyy-MM-dd", new Date()), "EEE, d MMM yyyy")} · ${formatTime(slot!.startTime)}–${formatTime(slot!.endTime)}` },
      { label: "With", value: staff ? `${staff.firstName} ${staff.lastName}` : "Any available staff" },
    ],
    [service, pet, date, slot, staff],
  );

  return (
    <div className="space-y-5">
      <dl className="divide-y rounded-xl border">
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between gap-4 px-4 py-3 text-sm">
            <dt className="text-muted-foreground">{r.label}</dt>
            <dd className="text-right font-medium">{r.value}</dd>
          </div>
        ))}
      </dl>

      <div className="space-y-2">
        <label htmlFor="booking-promo" className="text-sm font-medium">
          Promo code
        </label>
        {promo ? (
          <div className="flex items-center justify-between rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-sm">
            <span className="flex items-center gap-2 font-medium text-success">
              <Tag className="h-4 w-4" /> {promo.code} — {promo.title}
            </span>
            <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => (onChange({ promo: undefined }), setCode(""))} aria-label="Remove promo code">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input id="booking-promo" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === "Enter" && applyPromo()} placeholder="e.g. WINTER10" className="uppercase" />
            <Button type="button" variant="outline" onClick={applyPromo} disabled={!code.trim() || checking}>
              {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
            </Button>
          </div>
        )}
        {promoError && <p className="text-xs text-destructive">{promoError}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="booking-note" className="text-sm font-medium">
          Notes for the team <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <Textarea id="booking-note" rows={2} maxLength={1000} value={note} onChange={(e) => onChange({ note: e.target.value })} placeholder="Allergies, behaviour, anything we should know…" />
      </div>

      <div className="space-y-1.5 rounded-xl bg-muted/50 p-4 text-sm">
        <Line label="Service price" value={formatMoney(price)} />
        {promo && <Line label={`Discount (${promo.code})`} value={`−${formatMoney(promo.discountAmount)}`} className="text-success" />}
        <Line label="Total" value={formatMoney(total)} className="border-t pt-2 text-base font-bold" />
      </div>

      <Button className="h-11 w-full" onClick={confirm} disabled={create.isPending}>
        {create.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
        Confirm booking · {formatMoney(total)}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Pay within {settings.data?.booking_payment_timeout_minutes ?? 30} minutes to keep the slot. Free cancellation up to {settings.data?.booking_cancel_before_hours ?? 24}h before.
      </p>
    </div>
  );
}

/* ───────────────────────── done ───────────────────────── */

function StepDone({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const pay = usePayOnline();
  return (
    <div className="space-y-6 py-2 text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15">
        <CheckCircle2 className="h-8 w-8 text-success" />
      </span>
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Booking number</p>
        <p className="font-mono text-xl font-bold tracking-wide">{booking.bookingNo}</p>
        <p className="text-sm text-muted-foreground">
          {booking.service.name} for {booking.pet.name} · {format(parse(booking.bookingDate, "yyyy-MM-dd", new Date()), "EEE, d MMM")} at {formatTime(booking.startTime)}
        </p>
      </div>
      <div className="rounded-xl border bg-muted/40 p-4 text-sm">
        Your slot is held. Pay <span className="font-semibold">{formatMoney(booking.totalAmount)}</span> now to confirm it, or pay at the counter.
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button
          className="sm:min-w-44"
          disabled={pay.isPending}
          onClick={() => pay.mutate({ bookingId: booking.id })}
        >
          {pay.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
          Pay now
        </Button>
        <Button variant="outline" asChild onClick={onClose}>
          <Link href="/dashboard">Pay later · My bookings</Link>
        </Button>
      </div>
    </div>
  );
}

/* ───────────────────────── bits ───────────────────────── */

function ChoiceCard({
  selected,
  disabled,
  onClick,
  label,
  children,
}: {
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50",
        selected ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "hover:border-primary/50 hover:bg-muted/40",
      )}
    >
      {children}
    </button>
  );
}

function Thumb({ src, icon: Icon, round }: { src: string | null; icon: typeof Sparkles; round?: boolean }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element -- Cloudinary thumbnail
    <img src={src} alt="" className={cn("h-11 w-11 shrink-0 object-cover", round ? "rounded-full" : "rounded-lg")} />
  ) : (
    <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center bg-accent text-primary", round ? "rounded-full" : "rounded-lg")}>
      <Icon className="h-5 w-5" />
    </span>
  );
}

function Price({ service }: { service: Service }) {
  return service.discountPrice ? (
    <div className="shrink-0 text-right">
      <p className="font-bold text-primary">{formatMoney(service.discountPrice)}</p>
      <p className="text-xs text-muted-foreground line-through">{formatMoney(service.price)}</p>
    </div>
  ) : (
    <p className="shrink-0 font-bold">{formatMoney(service.price)}</p>
  );
}

function StaffChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm", active ? "border-primary bg-primary/10 font-medium text-primary" : "hover:border-primary/50")}
    >
      {children}
    </button>
  );
}

function Line({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn("flex justify-between", className)}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function EmptyHint({ icon: Icon, text }: { icon: typeof Clock; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
      <Icon className="h-5 w-5" />
      {text}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className="h-[70px] w-full rounded-xl" />
      ))}
    </div>
  );
}
