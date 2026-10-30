"use client";

import { useState } from "react";
import { MessageSquareText } from "lucide-react";
import { DataTablePagination } from "@/components/common/data-table";
import { EmptyState } from "@/components/common/EmptyState";
import { RatingBreakdown } from "@/components/common/Rating";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import type { ListParams } from "@/lib/api/types";
import type { RatingSummary } from "@/types/models";
import { useRatingSummary, useServiceReviews } from "./api";
import { ReviewBody } from "./components";

const SORTS = {
  newest: { sortBy: "createdAt", sortOrder: "desc" },
  highest: { sortBy: "rating", sortOrder: "desc" },
  lowest: { sortBy: "rating", sortOrder: "asc" },
} as const;

/** Rating summary + filterable, paginated approved reviews for one service (client-side, local state). */
export function ServiceReviews({ serviceSlug, summary: initialSummary }: { serviceSlug: string; summary: RatingSummary | null }) {
  const { data: summary } = useRatingSummary(serviceSlug, initialSummary);
  const [params, setParams] = useState<ListParams & { sort: keyof typeof SORTS }>({ page: 1, limit: 5, sort: "newest" });
  const { sort, ...rest } = params;
  const query = useServiceReviews(serviceSlug, { ...rest, ...SORTS[sort] });
  const set = (patch: Partial<typeof params>) => setParams((p) => ({ ...p, page: 1, ...patch }));

  if (!summary?.totalReviews)
    return <EmptyState icon={MessageSquareText} title="No reviews yet" description="Booked this service? Share your experience from your dashboard once the visit is completed." />;

  return (
    <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
      <div className="space-y-4 self-start rounded-3xl border bg-card p-6 lg:sticky lg:top-28">
        <RatingBreakdown
          average={summary.averageRating}
          total={summary.totalReviews}
          breakdown={summary.breakdown}
          active={params.rating as number | undefined}
          onSelect={(rating) => set({ rating })}
        />
        <p className="text-xs text-muted-foreground">Only customers with a completed booking can leave a review.</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {query.data ? `${query.data.meta.total} review${query.data.meta.total === 1 ? "" : "s"}` : "Loading…"}
            {params.rating ? ` · ${params.rating} stars` : ""}
          </p>
          <Select value={sort} onValueChange={(v) => set({ sort: v as keyof typeof SORTS })}>
            <SelectTrigger className="h-9 w-40" aria-label="Sort reviews">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="highest">Highest rated</SelectItem>
              <SelectItem value="lowest">Lowest rated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {query.isLoading ? (
          Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-36 rounded-3xl" />)
        ) : (
          <ul className={query.isPlaceholderData ? "space-y-4 opacity-60 transition-opacity" : "space-y-4"}>
            {query.data?.data.map((r) => (
              <li key={r.id} className="rounded-3xl border bg-card p-6">
                <div className="mb-3 flex items-center gap-3">
                  <UserAvatar user={{ firstName: r.user.firstName, lastName: "", profilePhoto: r.user.profilePhoto }} className="h-10 w-10" />
                  <div>
                    <p className="font-semibold">{r.user.firstName}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(r.createdAt)} · Verified booking</p>
                  </div>
                </div>
                <ReviewBody review={r} />
              </li>
            ))}
          </ul>
        )}
        {query.data && query.data.meta.totalPages > 1 && <DataTablePagination meta={query.data.meta} onChange={(p) => setParams((s) => ({ ...s, ...p }))} />}
      </div>
    </div>
  );
}
