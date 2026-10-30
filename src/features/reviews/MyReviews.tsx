"use client";

import { useMemo } from "react";
import Link from "next/link";
import { MessageSquareText, Pencil, Star, Trash2 } from "lucide-react";
import { z } from "zod";
import { EmptyState } from "@/components/common/EmptyState";
import { TextareaField, TextField } from "@/components/common/form/fields";
import { FormModal } from "@/components/common/form/FormModal";
import { MultiImageUploadField } from "@/components/common/MultiImageUpload";
import { RatingField } from "@/components/common/Rating";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCrudDelete } from "@/hooks/use-crud";
import { useDisclosure } from "@/hooks/use-disclosure";
import { formatDate } from "@/lib/format";
import type { Booking, Review } from "@/types/models";
import { myReviewHooks, type ReviewInput } from "./api";
import { ReviewBody } from "./components";

const schema = z.object({
  rating: z.number({ required_error: "Tap a star to rate", invalid_type_error: "Tap a star to rate" }).int().min(1).max(5),
  title: z.string().trim().max(150),
  comment: z.string().trim().max(3000),
  images: z.array(z.string().url()).max(5, "Up to 5 photos"),
});
type Form = z.output<typeof schema>;

const toInput = (v: Form): ReviewInput => ({ rating: v.rating, title: v.title || null, comment: v.comment || null, images: v.images });

/** Approved reviews are locked (the backend rejects edits) — delete and re-write instead. */
export const canEditReview = (r: Review) => r.status !== "approved";

/** Every review of mine keyed by booking id → "Write a review" vs "Your review ★4" on booking cards. */
export function useMyReviewsByBooking() {
  const { data } = myReviewHooks.useList({ limit: 100 });
  return useMemo(() => new Map((data?.data ?? []).map((r) => [r.bookingId, r])), [data]);
}

export type ReviewTarget = { booking: Pick<Booking, "id" | "bookingNo" | "service">; review?: undefined } | { review: Review; booking?: undefined };

/** Write (for a completed booking) or edit (pending / rejected) a review. */
export function ReviewFormModal({ target, open, onOpenChange }: { target: ReviewTarget | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const create = myReviewHooks.useCreate({ successMessage: "Thanks! Your review will appear once our team approves it." });
  const update = myReviewHooks.useUpdate({ successMessage: "Review updated — it's back in the moderation queue." });
  const review = target?.review;
  const serviceName = review?.service.name ?? target?.booking?.service.name;

  return (
    <FormModal
      schema={schema}
      open={open}
      onOpenChange={onOpenChange}
      title={review ? "Edit your review" : "How was your visit?"}
      description={serviceName && `${serviceName} · ${review?.booking.bookingNo ?? target?.booking?.bookingNo}`}
      submitText={review ? "Save review" : "Submit review"}
      defaultValues={{
        rating: review?.rating as number,
        title: review?.title ?? "",
        comment: review?.comment ?? "",
        images: review?.images.map((i) => i.image) ?? [],
      }}
      onSubmit={(v) => (review ? update.mutateAsync({ id: review.id, data: toInput(v) }) : create.mutateAsync({ bookingId: target!.booking!.id, ...toInput(v) }))}
    >
      <RatingField name="rating" label="Your rating" required />
      <TextField name="title" label="Headline" placeholder="e.g. Bella came home so fluffy!" maxLength={150} />
      <TextareaField name="comment" label="Tell others about it" rows={4} maxLength={3000} placeholder="What went well? Anything we could do better?" />
      <MultiImageUploadField name="images" label="Photos" folder="reviews" max={5} description="Optional — up to 5 photos." />
    </FormModal>
  );
}

/** Dashboard tab: my reviews with moderation status, edit/delete. */
export function MyReviewsTab() {
  const query = myReviewHooks.useList({ limit: 50, sortBy: "createdAt", sortOrder: "desc" });
  const editor = useDisclosure<ReviewTarget>();
  const remove = useCrudDelete(myReviewHooks, "review", (r: Review) => `your review of ${r.service.name}`);
  const rows = query.data?.data ?? [];

  if (query.isPending) return <Skeleton className="h-40 w-full rounded-xl" />;
  if (!rows.length)
    return (
      <EmptyState
        icon={MessageSquareText}
        title="No reviews yet"
        description="After a completed visit, use “Write a review” on the booking — it helps other pet parents choose."
        action={
          <Button variant="outline" asChild>
            <Link href="/dashboard?tab=bookings&period=past">See past bookings</Link>
          </Button>
        }
        className="bg-card"
      />
    );

  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <Card key={r.id}>
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:justify-between">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/services/${r.service.slug}`} className="font-semibold hover:text-primary">
                  {r.service.name}
                </Link>
                <StatusBadge status={r.status} label={r.status === "pending" ? "Awaiting approval" : r.status === "approved" ? "Published" : "Not published"} />
              </div>
              <p className="text-xs text-muted-foreground">
                {r.booking.bookingNo} · visit on {formatDate(r.booking.bookingDate)} · written {formatDate(r.createdAt)}
              </p>
              <ReviewBody review={r} />
              {r.status === "rejected" && <p className="text-xs text-muted-foreground">This review wasn&apos;t published. You can edit it and send it again.</p>}
            </div>
            <div className="flex shrink-0 gap-2 sm:flex-col">
              {canEditReview(r) && (
                <Button size="sm" variant="outline" onClick={() => editor.open({ review: r })}>
                  <Pencil className="mr-1.5 h-4 w-4" /> Edit
                </Button>
              )}
              <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => remove(r)}>
                <Trash2 className="mr-1.5 h-4 w-4" /> Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      <ReviewFormModal target={editor.item} open={editor.isOpen} onOpenChange={editor.setOpen} />
    </div>
  );
}

/** Booking-card button: "Write a review" / "Your review ★4". */
export function BookingReviewButton({ booking, review, onWrite, onEdit }: { booking: Booking; review?: Review; onWrite: () => void; onEdit: (r: Review) => void }) {
  if (booking.status !== "completed") return null;
  if (!review)
    return (
      <Button size="sm" variant="secondary" onClick={onWrite}>
        <Star className="mr-1.5 h-4 w-4" /> Write a review
      </Button>
    );
  return (
    <Button size="sm" variant="ghost" onClick={() => canEditReview(review) && onEdit(review)} disabled={!canEditReview(review)} title={canEditReview(review) ? "Edit your review" : "Published reviews can't be edited"}>
      <Star className="mr-1.5 h-4 w-4 fill-warning text-warning" /> Your review · {review.rating}★
    </Button>
  );
}
