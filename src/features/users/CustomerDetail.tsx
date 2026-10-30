"use client";

import Link from "next/link";
import { CalendarDays, ClipboardList, PawPrint } from "lucide-react";
import { DetailList } from "@/components/common/DetailList";
import { EmptyState } from "@/components/common/EmptyState";
import { Modal } from "@/components/common/Modal";
import { StatusBadge } from "@/components/common/StatusBadge";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { fullName } from "@/lib/auth";
import { formatDate, formatDateTime, formatMoney, formatTime } from "@/lib/format";
import { PERMISSIONS as P } from "@/lib/permissions";
import { useApplications } from "@/features/adoption/api";
import { useAdminBookings } from "@/features/bookings/api";
import { adminPetHooks, petAge } from "@/features/pets/api";
import type { User } from "@/types/models";
import { userHooks } from "./api";

type Who = Pick<User, "id"> & Partial<User>;

/**
 * 360° view of a customer: profile, pets, bookings and adoption applications.
 * Each tab loads only when opened and only if the viewer may see it.
 */
export function CustomerDetailModal({ customer, open, onOpenChange }: { customer: Who | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const { can } = useAuth();
  // a full row (customers / users tables) renders instantly; a bare reference (pet owner) waits for GET /users/:id
  const isFullUser = !!customer && "status" in customer && "createdAt" in customer;
  const full = userHooks.useOne(open ? customer?.id : null, { initialData: isFullUser ? (customer as User) : undefined });
  const u = full.data;
  if (!customer) return null;

  return (
    <Modal open={open} onOpenChange={onOpenChange} size="xl" title={u ? fullName(u) : "Customer"} description={u?.email}>
      {!u ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <Tabs defaultValue="profile">
          <TabsList className="mb-4 h-auto flex-wrap">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            {can(P.PET.VIEW) && <TabsTrigger value="pets">Pets</TabsTrigger>}
            {can(P.BOOKING.VIEW) && <TabsTrigger value="bookings">Bookings</TabsTrigger>}
            {can(P.ADOPTION_APPLICATION.VIEW) && <TabsTrigger value="adoption">Adoption</TabsTrigger>}
          </TabsList>
          <TabsContent value="profile">
            <div className="mb-5 flex items-center gap-4">
              <UserAvatar user={u} className="h-14 w-14 text-base" />
              <div>
                <p className="font-semibold">{fullName(u)}</p>
                <p className="text-sm text-muted-foreground">{u.role?.name ?? "Customer"}</p>
              </div>
              <StatusBadge status={u.status} className="ml-auto" />
            </div>
            <DetailList
              items={[
                { label: "Email", value: u.email },
                { label: "Email verified", value: u.emailVerifiedAt ? formatDateTime(u.emailVerifiedAt) : "Not yet" },
                { label: "Phone", value: u.phone },
                { label: "Joined", value: formatDateTime(u.createdAt) },
                { label: "Last sign-in", value: u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "Never" },
                { label: "Address", value: u.address, full: true },
                { label: "Bio", value: u.bio, full: true },
              ]}
            />
          </TabsContent>
          <TabsContent value="pets">
            <PetsTab userId={u.id} />
          </TabsContent>
          <TabsContent value="bookings">
            <BookingsTab userId={u.id} />
          </TabsContent>
          <TabsContent value="adoption">
            <ApplicationsTab userId={u.id} />
          </TabsContent>
        </Tabs>
      )}
    </Modal>
  );
}

function PetsTab({ userId }: { userId: number }) {
  const q = adminPetHooks.useList({ userId, limit: 50, sortBy: "name", sortOrder: "asc" });
  if (q.isPending) return <Skeleton className="h-32 w-full" />;
  if (!q.data?.data.length) return <EmptyState icon={PawPrint} title="No pets added" className="py-8" />;
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {q.data.data.map((p) => (
        <li key={p.id} className="flex gap-3 rounded-xl border p-3">
          {p.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.photo} alt="" className="h-12 w-12 rounded-lg object-cover" />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-primary">
              <PawPrint className="h-5 w-5" />
            </span>
          )}
          <div className="min-w-0 text-sm">
            <p className="font-semibold">{p.name}</p>
            <p className="text-muted-foreground">{[p.petType.name, p.breed, petAge(p.dateOfBirth)].filter(Boolean).join(" · ")}</p>
            <p className="text-xs text-muted-foreground">{p.isVaccinated ? "Vaccinated" : "Not vaccinated"}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function BookingsTab({ userId }: { userId: number }) {
  const q = useAdminBookings({ userId, limit: 10, sortBy: "bookingDate", sortOrder: "desc" });
  if (q.isPending) return <Skeleton className="h-32 w-full" />;
  const rows = q.data?.data ?? [];
  if (!rows.length) return <EmptyState icon={CalendarDays} title="No bookings yet" className="py-8" />;
  const spent = rows.filter((b) => b.paymentStatus === "paid").reduce((n, b) => n + Number(b.totalAmount), 0);
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {q.data!.meta.total} booking{q.data!.meta.total === 1 ? "" : "s"}
        {spent > 0 && ` · ${formatMoney(spent)} paid in the latest ${rows.length}`}
      </p>
      <ul className="divide-y rounded-xl border">
        {rows.map((b) => (
          <li key={b.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
            <span className="min-w-0 flex-1">
              <span className="block font-medium">
                {b.service.name} · {b.pet.name}
              </span>
              <span className="block text-xs text-muted-foreground">
                {formatDate(b.bookingDate)} {formatTime(b.startTime)} · <span className="font-mono">{b.bookingNo}</span>
              </span>
            </span>
            <span className="tabular-nums">{formatMoney(b.totalAmount)}</span>
            <StatusBadge status={b.status} />
          </li>
        ))}
      </ul>
      {q.data!.meta.total > rows.length && (
        <Link href={`/admin/bookings?userId=${userId}`} className="inline-block text-sm font-medium text-primary hover:underline">
          See all bookings
        </Link>
      )}
    </div>
  );
}

function ApplicationsTab({ userId }: { userId: number }) {
  const q = useApplications({ userId, limit: 10, sortBy: "createdAt", sortOrder: "desc" });
  if (q.isPending) return <Skeleton className="h-32 w-full" />;
  const rows = q.data?.data ?? [];
  if (!rows.length) return <EmptyState icon={ClipboardList} title="No adoption applications" className="py-8" />;
  return (
    <ul className="divide-y rounded-xl border">
      {rows.map((a) => (
        <li key={a.id} className="flex items-center gap-3 px-4 py-3 text-sm">
          <span className="min-w-0 flex-1">
            <span className="block font-medium">{a.adoptionPet.name}</span>
            <span className="block text-xs text-muted-foreground">
              <span className="font-mono">{a.applicationNo}</span> · {formatDate(a.createdAt)}
            </span>
          </span>
          <StatusBadge status={a.status} />
        </li>
      ))}
    </ul>
  );
}
