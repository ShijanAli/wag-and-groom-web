"use client";

import { useQuery } from "@tanstack/react-query";
import { createResourceHooks } from "@/lib/api/hooks";
import { formatMoney } from "@/lib/format";
import { api, createResource } from "@/lib/api/request";
import type { Id, ListParams } from "@/lib/api/types";
import type { ActiveStatus, DiscountType, Promotion, PromotionScope, PromotionUsage } from "@/types/models";

export interface PromotionInput {
  title: string;
  code: string;
  description?: string | null;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number | null;
  minOrderAmount?: number | null;
  appliesTo: PromotionScope;
  serviceIds: number[];
  categoryIds: number[];
  usageLimit?: number | null;
  perUserLimit: number;
  startsAt: string;
  endsAt: string;
  bannerImage?: string | null;
  status: ActiveStatus;
}

export const promotionsApi = {
  ...createResource<Promotion, PromotionInput>("/promotions"),
  usages: (id: Id, params?: ListParams) => api.list<PromotionUsage>(`/promotions/${id}/usages`, params),
};

export const promotionHooks = createResourceHooks("promotions", promotionsApi);

export const usePromotionUsages = (id: Id | null, params: ListParams) =>
  useQuery({
    queryKey: [...promotionHooks.keys.detail(id ?? ""), "usages", params],
    queryFn: () => promotionsApi.usages(id as Id, params),
    enabled: id !== null,
  });

/** Running / Scheduled / Expired, from the dates (status = the on/off switch). */
export function promotionPhase(p: Pick<Promotion, "startsAt" | "endsAt" | "status" | "usageLimit" | "usedCount">) {
  const now = Date.now();
  if (p.usageLimit !== null && p.usedCount >= p.usageLimit) return { label: "Used up", tone: "neutral" as const };
  if (new Date(p.endsAt).getTime() < now) return { label: "Expired", tone: "neutral" as const };
  if (new Date(p.startsAt).getTime() > now) return { label: "Scheduled", tone: "info" as const };
  return p.status === "active" ? { label: "Running", tone: "success" as const } : { label: "Paused", tone: "warning" as const };
}

export const DISCOUNT_TYPE_OPTIONS = [
  { label: "Percentage", value: "percentage", hint: "e.g. 10% off" },
  { label: "Fixed amount", value: "fixed", hint: "e.g. $200 off" },
];

export const SCOPE_OPTIONS = [
  { label: "All services", value: "all" },
  { label: "Specific services", value: "specific_services" },
  { label: "Specific categories", value: "specific_categories" },
];

/** "10% off · max $300" / "$200 off" */
export function discountLabel(p: Pick<Promotion, "discountType" | "discountValue" | "maxDiscountAmount">) {
  return p.discountType === "percentage"
    ? `${Number(p.discountValue)}% off${p.maxDiscountAmount ? ` · max ${formatMoney(p.maxDiscountAmount)}` : ""}`
    : `${formatMoney(p.discountValue)} off`;
}

