"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createKeys, createResourceHooks, useApiMutation } from "@/lib/api/hooks";
import { api, createResource } from "@/lib/api/request";
import type { Id, ListParams } from "@/lib/api/types";
import type { PublicReview, RatingSummary, Review, ReviewStatus } from "@/types/models";

export interface ReviewInput {
  rating: number;
  title?: string | null;
  comment?: string | null;
  images?: string[];
}

/* admin moderation queue: GET /reviews · GET /reviews/:id · DELETE /reviews/:id */
const adminResource = createResource<Review, never, never>("/reviews");
export const reviewHooks = createResourceHooks("reviews", adminResource);

/* the customer's own reviews */
const myResource = createResource<Review, ReviewInput & { bookingId: number }, Partial<ReviewInput>>("/me/reviews");
export const myReviewHooks = createResourceHooks("my-reviews", {
  ...myResource,
  create: (body) => api.post<Review>("/reviews", body), // POST lives on /reviews
});

const invalidateAll = [reviewHooks.keys.all, myReviewHooks.keys.all, ["services"]];
/** approved reviews + replies are shown on the service pages */
const revalidate = ["services"] as const;

export const useModerateReview = () =>
  useApiMutation(({ id, status }: { id: Id; status: Exclude<ReviewStatus, "pending"> }) => api.patch<Review>(`/reviews/${id}/status`, { status }), {
    invalidate: invalidateAll,
    revalidate,
    successMessage: (_, v) => (v.status === "approved" ? "Review approved — it's live on the website" : "Review rejected"),
  });

export const useReplyReview = () =>
  useApiMutation(({ id, reply }: { id: Id; reply: string | null }) => api.patch<Review>(`/reviews/${id}/reply`, { reply }), {
    invalidate: invalidateAll,
    revalidate,
    successMessage: (_, v) => (v.reply ? "Reply published" : "Reply removed"),
  });

/* public, per service */
const publicKeys = createKeys("service-reviews");

export const useServiceReviews = (idOrSlug: Id, params: ListParams) =>
  useQuery({
    queryKey: publicKeys.list({ idOrSlug, ...params }),
    queryFn: () => api.list<PublicReview>(`/services/${idOrSlug}/reviews`, params),
    placeholderData: keepPreviousData,
  });

/** `initial` = the server-rendered (ISR, possibly a few minutes old) summary; refreshed in the background on mount. */
export const useRatingSummary = (idOrSlug: Id, initial?: RatingSummary | null) =>
  useQuery({
    queryKey: [...publicKeys.all, "summary", String(idOrSlug)],
    queryFn: () => api.get<RatingSummary>(`/services/${idOrSlug}/rating-summary`),
    ...(initial && { initialData: initial, initialDataUpdatedAt: 0 }),
  });

export const REVIEW_STATUS_OPTIONS: { label: string; value: ReviewStatus }[] = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

export const RATING_OPTIONS = [5, 4, 3, 2, 1].map((n) => ({ label: `${n} ★`, value: String(n) }));
