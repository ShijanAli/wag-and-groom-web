"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { CalendarCheck, CalendarDays, CreditCard, Eye, Loader2, PawPrint, Pencil, Plus, RotateCcw, Syringe, Trash2, Wallet, X } from "lucide-react";
import { useConfirm } from "@/components/common/ConfirmDialog";
import { DataTable, DataTablePagination, RowActions } from "@/components/common/data-table";
import { EmptyState } from "@/components/common/EmptyState";
import { FormModal } from "@/components/common/form/FormModal";
import { Modal } from "@/components/common/Modal";
import { PanelHeader } from "@/components/common/PanelHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useCrudDelete, useCrudEditor } from "@/hooks/use-crud";
import { useListParams } from "@/hooks/use-list-params";
import { useTabParam } from "@/hooks/use-tab-param";
import { formatDateTime, formatMoney, toApiDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { MyAdoptionsTab, MyFavoritesTab } from "@/features/adoption/MyAdoptionTabs";
import { ProfileSettings } from "@/features/auth/ProfileSettings";
import { BookingModal } from "@/features/bookings/BookingModal";
import { BookingBadges, BookingDetail, BookingFacts } from "@/features/bookings/components";
import { canCustomerCancel, useCancelMyBooking, useMyBooking, useMyBookings, usePayOnline } from "@/features/bookings/api";
import { usePetTypeOptions } from "@/features/catalog/api";
import { METHOD_LABEL, useMyPayments } from "@/features/payments/api";
import { myPetHooks, petAge, type PetInput } from "@/features/pets/api";
import { PetFields, petSchema, toPetForm, toPetInput, type PetForm } from "@/features/pets/PetFields";
import { usePublicSettings } from "@/features/settings/api";
import type { Booking, Payment, Pet } from "@/types/models";

const TABS = ["bookings", "pets", "adoptions", "favorites", "payments", "profile"] as const;
const PAYABLE = (b: Booking) => ["pending", "confirmed"].includes(b.status) && ["unpaid", "partial"].includes(b.paymentStatus);

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useTabParam(TABS, "bookings");
  const [booking, setBooking] = useState<{ open: boolean; serviceId?: number }>({ open: false });
  const openBooking = (serviceId?: number) => setBooking({ open: true, serviceId });

  return (
    <div className="min-h-screen bg-muted/30">
      <PanelHeader
        home="/"
        links={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: "Adopt", href: "/adopt" },
          { label: "My dashboard", href: "/dashboard" },
        ]}
        profileHref="/dashboard?tab=profile"
        actions={
          <Button size="sm" className="mr-1 hidden rounded-full sm:inline-flex" onClick={() => openBooking()}>
            Book now
          </Button>
        }
      />
      <BookingModal open={booking.open} onOpenChange={(open) => setBooking((b) => ({ ...b, open }))} serviceId={booking.serviceId} />

      <main className="container mx-auto space-y-8 px-4 py-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-display text-3xl font-bold">Hi {user?.firstName} 👋</h1>
            <p className="text-muted-foreground">Your bookings, pets and payments in one place.</p>
          </div>
          <Button onClick={() => openBooking()} className="gap-2">
            <Plus className="h-4 w-4" /> New booking
          </Button>
        </div>

        <Stats />

        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          <TabsList className="h-auto flex-wrap">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="pets">My pets</TabsTrigger>
            <TabsTrigger value="adoptions">Adoptions</TabsTrigger>
            <TabsTrigger value="favorites">Favourites</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
          <TabsContent value="bookings">{tab === "bookings" && <BookingsTab onBook={openBooking} />}</TabsContent>
          <TabsContent value="pets">{tab === "pets" && <PetsTab />}</TabsContent>
          <TabsContent value="adoptions">{tab === "adoptions" && <MyAdoptionsTab />}</TabsContent>
          <TabsContent value="favorites">{tab === "favorites" && <MyFavoritesTab />}</TabsContent>
          <TabsContent value="payments">{tab === "payments" && <PaymentsTab />}</TabsContent>
          <TabsContent value="profile">{tab === "profile" && <ProfileSettings />}</TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

/* ───────────────────────── stats ───────────────────────── */

function Stats() {
  const today = toApiDate(new Date());
  // limit 1 → only the totals in `meta` are needed
  const pets = myPetHooks.useList({ limit: 1 });
  const upcoming = useMyBookings({ limit: 1, from: today, status: "confirmed" });
  const pending = useMyBookings({ limit: 1, status: "pending" });
  const completed = useMyBookings({ limit: 1, status: "completed" });
  const items = [
    { label: "My pets", value: pets.data?.meta.total, icon: PawPrint, tone: "text-primary bg-primary/10" },
    { label: "Upcoming", value: upcoming.data?.meta.total, icon: CalendarDays, tone: "text-secondary bg-secondary/10" },
    { label: "Awaiting payment", value: pending.data?.meta.total, icon: Wallet, tone: "text-amber-600 bg-warning/15" },
    { label: "Completed", value: completed.data?.meta.total, icon: CalendarCheck, tone: "text-success bg-success/10" },
  ];
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((i) => (
        <Card key={i.label}>
          <CardContent className="flex items-center gap-4 p-5">
            <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", i.tone)}>
              <i.icon className="h-5 w-5" />
            </span>
            <div>
              {i.value === undefined ? <Skeleton className="mb-1 h-7 w-8" /> : <p className="text-2xl font-bold">{i.value}</p>}
              <p className="text-xs text-muted-foreground">{i.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ───────────────────────── bookings ───────────────────────── */

const PERIODS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
  { key: "all", label: "All" },
] as const;

function BookingsTab({ onBook }: { onBook: (serviceId?: number) => void }) {
  const list = useListParams({ defaults: { limit: 5, period: "upcoming" } });
  const today = toApiDate(new Date());
  const period = (list.params.period as string) ?? "upcoming";
  const { period: _p, ...rest } = list.params;
  const query = useMyBookings({
    ...rest,
    ...(period === "upcoming" && { from: today, sortBy: "bookingDate", sortOrder: "asc" }),
    ...(period === "past" && { to: today, sortBy: "bookingDate", sortOrder: "desc" }),
    ...(period === "all" && { sortBy: "createdAt", sortOrder: "desc" }),
  });
  const [detailNo, setDetailNo] = useState<string | null>(null);
  const settings = usePublicSettings();
  const cancel = useCancelMyBooking();
  const pay = usePayOnline();
  const { confirm } = useConfirm();
  const cutoff = settings.data?.booking_cancel_before_hours ?? 24;
  const rows = query.data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex gap-2" role="tablist" aria-label="Period">
        {PERIODS.map((p) => (
          <Button key={p.key} size="sm" variant={period === p.key ? "default" : "outline"} className="rounded-full" role="tab" aria-selected={period === p.key} onClick={() => list.setParams({ period: p.key })}>
            {p.label}
          </Button>
        ))}
      </div>

      {query.isPending ? (
        Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)
      ) : rows.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={period === "upcoming" ? "No upcoming bookings" : "No bookings here"}
          description="Book grooming, walks or a spa day in under a minute."
          action={<Button onClick={() => onBook()}>Book now</Button>}
          className="bg-card"
        />
      ) : (
        <div className={cn("space-y-3 transition-opacity", query.isFetching && "opacity-60")}>
          {rows.map((b) => (
            <Card key={b.id}>
              <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{b.service.name}</h3>
                    <BookingBadges booking={b} />
                  </div>
                  <BookingFacts booking={b} />
                  <p className="font-mono text-xs text-muted-foreground">{b.bookingNo}</p>
                </div>
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  {PAYABLE(b) && (
                    <Button size="sm" disabled={pay.isPending} onClick={() => pay.mutate({ bookingId: b.id })}>
                      {pay.isPending && pay.variables?.bookingId === b.id ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <CreditCard className="mr-1.5 h-4 w-4" />}
                      Pay now
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setDetailNo(b.bookingNo)}>
                    <Eye className="mr-1.5 h-4 w-4" /> Details
                  </Button>
                  {canCustomerCancel(b, cutoff) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() =>
                        confirm({
                          title: "Cancel this booking?",
                          description: `${b.service.name} for ${b.pet.name} will be cancelled and the slot released. Online payments are refunded by our team.`,
                          confirmText: "Cancel booking",
                          cancelText: "Keep it",
                          tone: "danger",
                          onConfirm: () => cancel.mutateAsync({ idOrNo: b.bookingNo }),
                        })
                      }
                    >
                      <X className="mr-1.5 h-4 w-4" /> Cancel
                    </Button>
                  )}
                  {["completed", "cancelled", "no_show"].includes(b.status) && (
                    <Button size="sm" variant="ghost" onClick={() => onBook(b.serviceId)}>
                      <RotateCcw className="mr-1.5 h-4 w-4" /> Book again
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {query.data && query.data.meta.totalPages > 1 && (
            <div className="overflow-hidden rounded-xl border bg-card">
              <DataTablePagination meta={query.data.meta} onChange={list.setParams} />
            </div>
          )}
        </div>
      )}

      <MyBookingModal bookingNo={detailNo} onClose={() => setDetailNo(null)} />
    </div>
  );
}

function MyBookingModal({ bookingNo, onClose }: { bookingNo: string | null; onClose: () => void }) {
  const detail = useMyBooking(bookingNo);
  return (
    <Modal open={!!bookingNo} onOpenChange={(o) => !o && onClose()} title="Booking details" size="lg">
      {detail.data ? <BookingDetail booking={detail.data} /> : <Skeleton className="h-80 w-full" />}
    </Modal>
  );
}

/* ───────────────────────── pets ───────────────────────── */

function PetsTab() {
  const pets = myPetHooks.useList({ limit: 50, sortBy: "name", sortOrder: "asc" });
  const types = usePetTypeOptions();
  const editor = useCrudEditor<Pet, PetForm, PetInput>({
    hooks: myPetHooks,
    entity: "pet",
    toForm: (p) => toPetForm(p),
    toInput: (v) => toPetInput(v),
  });
  const remove = useCrudDelete(myPetHooks, "pet", (p: Pet) => p.name);
  const list = pets.data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => editor.open()} className="gap-2">
          <Plus className="h-4 w-4" /> Add pet
        </Button>
      </div>
      {pets.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState icon={PawPrint} title="No pets yet" description="Add your pet once and book faster every time." className="bg-card" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex gap-4 p-5">
                {p.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element -- Cloudinary avatar
                  <img src={p.photo} alt="" className="h-16 w-16 shrink-0 rounded-2xl object-cover" />
                ) : (
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary">
                    <PawPrint className="h-7 w-7" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="truncate font-display text-lg font-semibold">{p.name}</h3>
                    <RowActions
                      actions={[
                        { label: "Edit", icon: Pencil, onClick: () => editor.open(p) },
                        { label: "Delete", icon: Trash2, danger: true, onClick: () => remove(p) },
                      ]}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">{[p.petType.name, p.breed].filter(Boolean).join(" · ")}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                    {petAge(p.dateOfBirth) && <span className="rounded-md bg-muted px-2 py-0.5">{petAge(p.dateOfBirth)}</span>}
                    {p.size && <span className="rounded-md bg-muted px-2 py-0.5 capitalize">{p.size}</span>}
                    {p.weightKg && <span className="rounded-md bg-muted px-2 py-0.5">{Number(p.weightKg)} kg</span>}
                    {p.isVaccinated && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-success/10 px-2 py-0.5 text-success">
                        <Syringe className="h-3 w-3" /> Vaccinated
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <FormModal schema={petSchema} size="lg" {...editor.modalProps}>
        <PetFields typeOptions={types.data ?? []} />
      </FormModal>
    </div>
  );
}

/* ───────────────────────── payments ───────────────────────── */

function PaymentsTab() {
  const list = useListParams({ defaults: { sortBy: "createdAt", sortOrder: "desc" } });
  const query = useMyPayments(list.params);
  const columns = useMemo<ColumnDef<Payment>[]>(
    () => [
      { id: "createdAt", header: "Date", enableSorting: true, cell: ({ row }) => formatDateTime(row.original.paidAt ?? row.original.createdAt) },
      {
        id: "booking",
        header: "For",
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.booking?.bookingNo ?? (row.original.adoption ? "Adoption fee" : "—")}</span>,
      },
      { id: "method", header: "Method", cell: ({ row }) => (row.original.type === "refund" ? "Refund" : METHOD_LABEL[row.original.method]) },
      {
        id: "amount",
        header: "Amount",
        enableSorting: true,
        cell: ({ row }) => (
          <span className={cn("font-semibold", row.original.type === "refund" && "text-success")}>
            {row.original.type === "refund" ? "+" : ""}
            {formatMoney(row.original.amount, row.original.currency)}
          </span>
        ),
      },
      { id: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      { id: "tx", header: "Transaction", cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.transactionId}</span> },
    ],
    [],
  );
  return <DataTable columns={columns} query={query} list={list} emptyTitle="No payments yet" emptyDescription="Payments for your bookings will show up here." />;
}
