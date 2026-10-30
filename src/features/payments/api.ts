"use client";

import { useQuery } from "@tanstack/react-query";
import { useApiMutation } from "@/lib/api/hooks";
import { api } from "@/lib/api/request";
import type { Id, ListParams } from "@/lib/api/types";
import { bookingKeys } from "@/features/bookings/api";
import type { Payment, PaymentMethod } from "@/types/models";

export interface CashPaymentInput {
  bookingId?: number;
  adoptionId?: number;
  amount?: number;
  method: Exclude<PaymentMethod, "sslcommerz">;
  note?: string;
}

export const paymentsApi = {
  list: (params?: ListParams) => api.list<Payment>("/payments", params),
  mine: (params?: ListParams) => api.list<Payment>("/me/payments", params),
  recordCash: (body: CashPaymentInput) => api.post<Payment>("/payments/cash", body),
  refund: (id: Id, body: { amount?: number; reason: string }) => api.post<Payment>(`/payments/${id}/refund`, body),
};

export const usePayments = (params: ListParams) =>
  useQuery({ queryKey: ["payments", "list", params], queryFn: () => paymentsApi.list(params), placeholderData: (prev) => prev });

export const useMyPayments = (params: ListParams) =>
  useQuery({ queryKey: ["my-payments", "list", params], queryFn: () => paymentsApi.mine(params), placeholderData: (prev) => prev });

const invalidate = [["payments"], ["my-payments"], bookingKeys.all, ["adoptions"], ["adoption-applications"]];
export const useRecordPayment = () => useApiMutation(paymentsApi.recordCash, { invalidate });
export const useRefund = () =>
  useApiMutation(({ id, ...body }: { id: Id; amount?: number; reason: string }) => paymentsApi.refund(id, body), { invalidate });

/** Money left to refund on a payment (amount − successful refunds), in the payment currency. */
export const refundable = (p: Payment) =>
  Math.max(0, Number(p.amount) - (p.refunds ?? []).filter((r) => r.status === "success").reduce((s, r) => s + Number(r.amount), 0));

export const METHOD_LABEL: Record<PaymentMethod, string> = {
  cash: "Cash",
  card: "Card",
  mobile_banking: "bKash / Nagad",
  sslcommerz: "Online (SSLCommerz)",
};

export const METHOD_OPTIONS = (Object.keys(METHOD_LABEL) as PaymentMethod[]).map((v) => ({ value: v, label: METHOD_LABEL[v] }));
