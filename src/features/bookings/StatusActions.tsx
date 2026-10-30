"use client";

import { useState } from "react";
import { Ban, CheckCheck, CircleCheck, Loader2, MoreHorizontal, Play, UserX } from "lucide-react";
import { z } from "zod";
import { TextareaField } from "@/components/common/form/fields";
import { FormModal } from "@/components/common/form/FormModal";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Booking, BookingStatus } from "@/types/models";
import { STATUS_ACTION_LABEL, STATUS_TRANSITIONS, useUpdateBookingStatus } from "./api";

const ICONS: Partial<Record<BookingStatus, typeof Play>> = {
  confirmed: CircleCheck,
  in_progress: Play,
  completed: CheckCheck,
  cancelled: Ban,
  no_show: UserX,
};

/** Statuses that end a booking badly → ask for a short reason first. */
const NEEDS_NOTE: BookingStatus[] = ["cancelled", "no_show"];

const noteSchema = z.object({ note: z.string().trim().max(500) });

/**
 * Next-step button (Confirm → Start → Complete) plus a menu for the other allowed moves.
 * Follows the backend STATUS_TRANSITIONS, so it never offers a change the API would reject.
 */
export function StatusActions({ booking, size = "sm", className }: { booking: Pick<Booking, "id" | "status" | "bookingNo">; size?: "sm" | "default"; className?: string }) {
  const update = useUpdateBookingStatus();
  const [asking, setAsking] = useState<BookingStatus | null>(null);
  const next = STATUS_TRANSITIONS[booking.status];
  if (!next.length) return null;

  const primary = next.find((s) => !NEEDS_NOTE.includes(s));
  const others = next.filter((s) => s !== primary);
  const busy = update.isPending && update.variables?.id === booking.id;
  const PrimaryIcon = primary ? ICONS[primary]! : null;
  const run = (status: BookingStatus) => (NEEDS_NOTE.includes(status) ? setAsking(status) : update.mutate({ id: booking.id, status }));

  return (
    <div className={cn("flex items-center gap-1.5", className)} onClick={(e) => e.stopPropagation()}>
      {primary && (
        <Button size={size} onClick={() => run(primary)} disabled={busy}>
          {busy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : PrimaryIcon && <PrimaryIcon className="mr-1.5 h-4 w-4" />}
          {STATUS_ACTION_LABEL[primary]}
        </Button>
      )}
      {others.length > 0 && (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="outline" className={size === "sm" ? "h-9 w-9" : undefined} aria-label="More status actions" disabled={busy}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {others.map((s) => {
              const I = ICONS[s]!;
              return (
                <DropdownMenuItem key={s} onSelect={() => run(s)} className={NEEDS_NOTE.includes(s) ? "text-destructive focus:text-destructive" : undefined}>
                  <I className="mr-2 h-4 w-4" /> {STATUS_ACTION_LABEL[s]}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <FormModal
        open={!!asking}
        onOpenChange={(o) => !o && setAsking(null)}
        size="sm"
        title={asking === "cancelled" ? "Cancel booking" : "Mark as no-show"}
        description={`${booking.bookingNo} — the customer is notified by email.`}
        schema={noteSchema}
        defaultValues={{ note: "" }}
        submitText={asking === "cancelled" ? "Cancel booking" : "Mark no-show"}
        onSubmit={(v) => update.mutateAsync({ id: booking.id, status: asking!, note: v.note || undefined })}
      >
        <TextareaField name="note" label="Reason" rows={3} placeholder={asking === "cancelled" ? "e.g. Groomer unavailable" : "e.g. Customer didn't arrive"} />
      </FormModal>
    </div>
  );
}
