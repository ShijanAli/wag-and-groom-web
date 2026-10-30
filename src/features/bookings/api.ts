"use client";

import { useQuery } from "@tanstack/react-query";
import type { Option } from "@/components/common/form/fields";
import { createKeys, useApiMutation } from "@/lib/api/hooks";
import { api } from "@/lib/api/request";
import type { Id, ListParams } from "@/lib/api/types";
import type { Availability, Booking, BookingStatus, Currency } from "@/types/models";

export interface CreateBookingInput {
  serviceId: number;
  petId: number;
  date: string;
  startTime: string;
  staffId?: number;
  promoCode?: string;
  customerNote?: string;
}

export interface PromoPreview {
  code: string;
  title: string;
  discountType: "percentage" | "fixed";
  discountValue: string;
  servicePrice: number;
  discountAmount: number;
  totalAmount: number;
}

export interface PaymentSession {
  paymentId: number;
  transactionId: string;
  reference: string;
  amount: number;
  currency: Currency;
  gatewayUrl: string;
}

/** One cache scope for every booking view (customer, staff, admin) so any change refreshes all of them. */
export const bookingKeys = createKeys("bookings");
const invalidate = [bookingKeys.all, ["payments"], ["my-payments"]];

export const bookingsApi = {
  // customer
  create: (body: CreateBookingInput) => api.post<Booking>("/bookings", body),
  mine: (params?: ListParams) => api.list<Booking>("/me/bookings", params),
  myOne: (idOrNo: Id) => api.get<Booking>(`/me/bookings/${idOrNo}`),
  cancelMine: (idOrNo: Id, reason?: string) => api.patch<Booking>(`/me/bookings/${idOrNo}/cancel`, { reason }),
  // staff
  assignedToMe: (params?: ListParams) => api.list<Booking>("/staff/me/bookings", params),
  // admin
  list: (params?: ListParams) => api.list<Booking>("/bookings", params),
  get: (id: Id) => api.get<Booking>(`/bookings/${id}`),
  updateStatus: (id: Id, status: BookingStatus, note?: string) => api.patch<Booking>(`/bookings/${id}/status`, { status, note }),
  assignStaff: (id: Id, staffId: number) => api.patch<Booking>(`/bookings/${id}/assign-staff`, { staffId }),
  // booking helpers
  availability: (serviceId: Id, date: string, staffId?: number) => api.get<Availability>(`/services/${serviceId}/availability`, { date, staffId }),
  validatePromo: (code: string, serviceId: number) => api.post<PromoPreview>("/promotions/validate", { code, serviceId }),
  initPayment: (bookingId: number, currency: Currency = "BDT") => api.post<PaymentSession>("/payments/init", { bookingId, currency }),
};

/* ───────────────────────── queries ───────────────────────── */

const listQuery = (scope: string, fn: (p?: ListParams) => ReturnType<typeof bookingsApi.list>) => (params: ListParams) =>
  useQuery({ queryKey: [...bookingKeys.list(params), scope], queryFn: () => fn(params), placeholderData: (prev) => prev });

export const useMyBookings = listQuery("mine", bookingsApi.mine);
export const useStaffBookings = listQuery("staff", bookingsApi.assignedToMe);
export const useAdminBookings = listQuery("admin", bookingsApi.list);

export const useMyBooking = (idOrNo: Id | null | undefined) =>
  useQuery({ queryKey: [...bookingKeys.detail(idOrNo ?? ""), "mine"], queryFn: () => bookingsApi.myOne(idOrNo!), enabled: !!idOrNo });

export const useBookingDetail = (id: Id | null | undefined) =>
  useQuery({ queryKey: [...bookingKeys.detail(id ?? ""), "admin"], queryFn: () => bookingsApi.get(id!), enabled: !!id });

/** Slots change as people book → always fresh, refetch every minute while visible. */
export const useAvailability = (serviceId: number | undefined, date: string | undefined) =>
  useQuery({
    queryKey: ["availability", serviceId, date],
    queryFn: () => bookingsApi.availability(serviceId!, date!),
    enabled: !!serviceId && !!date,
    staleTime: 0,
    refetchInterval: 60_000,
  });

/* ───────────────────────── mutations ───────────────────────── */

export const useCreateBooking = () => useApiMutation(bookingsApi.create, { invalidate: [...invalidate, ["availability"]], successMessage: false });

export const useCancelMyBooking = () =>
  useApiMutation(({ idOrNo, reason }: { idOrNo: Id; reason?: string }) => bookingsApi.cancelMine(idOrNo, reason), { invalidate });

export const useUpdateBookingStatus = () =>
  useApiMutation(({ id, status, note }: { id: Id; status: BookingStatus; note?: string }) => bookingsApi.updateStatus(id, status, note), {
    invalidate,
  });

export const useAssignStaff = () =>
  useApiMutation(({ id, staffId }: { id: Id; staffId: number }) => bookingsApi.assignStaff(id, staffId), { invalidate });

/** Starts an SSLCommerz session and sends the browser to the hosted payment page. */
export const usePayOnline = () =>
  useApiMutation(({ bookingId, currency }: { bookingId: number; currency?: Currency }) => bookingsApi.initPayment(bookingId, currency), {
    successMessage: "Redirecting to secure payment…",
    onSuccess: (res) => window.location.assign(res.data.gatewayUrl),
  });

/* ───────────────────────── rules (mirror backend STATUS_TRANSITIONS) ───────────────────────── */

export const STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["in_progress", "cancelled", "no_show"],
  in_progress: ["completed"],
  completed: [],
  cancelled: [],
  no_show: [],
};

export const CUSTOMER_CANCELLABLE: BookingStatus[] = ["pending", "confirmed"];

export const STATUS_ACTION_LABEL: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirm",
  in_progress: "Start",
  completed: "Complete",
  cancelled: "Cancel",
  no_show: "Mark no-show",
};

export const BOOKING_STATUS_OPTIONS: Option<BookingStatus>[] = (["pending", "confirmed", "in_progress", "completed", "cancelled", "no_show"] as const).map(
  (s) => ({ value: s, label: s === "no_show" ? "No-show" : s === "in_progress" ? "In progress" : s[0].toUpperCase() + s.slice(1) }),
);

export const PAYMENT_STATUS_OPTIONS = [
  { value: "unpaid", label: "Unpaid" },
  { value: "partial", label: "Partly paid" },
  { value: "paid", label: "Paid" },
  { value: "refunded", label: "Refunded" },
];

/** Booking start as a Date in the business timezone (Asia/Dhaka, UTC+6, no DST). */
export const bookingStart = (b: Pick<Booking, "bookingDate" | "startTime">) => new Date(`${b.bookingDate}T${b.startTime}:00+06:00`);

/** Can the customer still cancel (status + cancellation window)? */
export function canCustomerCancel(b: Booking, cancelBeforeHours: number) {
  if (!CUSTOMER_CANCELLABLE.includes(b.status)) return false;
  return bookingStart(b).getTime() - Date.now() >= cancelBeforeHours * 3_600_000;
}

/** Amount still to pay (BDT). */
export const dueAmount = (b: Pick<Booking, "totalAmount" | "payments">, paid?: number) => {
  const p = paid ?? (b.payments ?? []).filter((x) => x.type === "payment" && x.status === "success").reduce((s, x) => s + Number(x.baseAmount), 0);
  return Math.max(0, Math.round((Number(b.totalAmount) - p) * 100) / 100);
};
