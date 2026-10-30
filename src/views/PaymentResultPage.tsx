"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, CreditCard, Loader2, XCircle, CircleSlash } from "lucide-react";
import { AuthLayout, AuthResult } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { formatMoney } from "@/lib/format";
import { useMyBooking, usePayOnline } from "@/features/bookings/api";
import { useMyApplications } from "@/features/adoption/api";
import { bookingWhen } from "@/features/bookings/components";

export type PaymentOutcome = "success" | "failed" | "cancelled";

const COPY: Record<PaymentOutcome, { title: string; text: string; tone: "success" | "danger" | "primary" }> = {
  success: { title: "Payment successful", text: "Thank you! Your payment is confirmed and a receipt has been emailed to you.", tone: "success" },
  failed: { title: "Payment failed", text: "The payment didn't go through and you weren't charged. You can try again — your slot is still held for a short while.", tone: "danger" },
  cancelled: { title: "Payment cancelled", text: "You left the payment page. Your booking is saved; pay any time before the hold expires.", tone: "primary" },
};

/**
 * Landing page after SSLCommerz. The backend verifies the payment server-side
 * and then redirects here with `?tranId=…&bookingNo=…` — this page only displays the result.
 */
export default function PaymentResultPage({ outcome }: { outcome: PaymentOutcome }) {
  const params = useSearchParams();
  const bookingNo = params.get("bookingNo");
  const tranId = params.get("tranId");
  const { status } = useAuth();
  const applicationNo = params.get("applicationNo");
  const booking = useMyBooking(status === "authenticated" ? bookingNo : null);
  // adoption fee payments come back with ?applicationNo=…
  const apps = useMyApplications({ searchTerm: applicationNo ?? undefined, limit: 1 }, status === "authenticated" && !!applicationNo);
  const app = apps.data?.data[0];
  const pay = usePayOnline();
  const copy = COPY[outcome];
  const Icon = outcome === "success" ? CheckCircle2 : outcome === "failed" ? XCircle : CircleSlash;
  const canRetryBooking = outcome !== "success" && booking.data && ["pending", "confirmed"].includes(booking.data.status) && booking.data.paymentStatus !== "paid";
  const adoption = app?.adoption;
  const canRetryAdoption = outcome !== "success" && adoption?.status === "in_progress" && Number(adoption.feePaid) < Number(adoption.feeAmount);
  const canRetry = canRetryBooking || canRetryAdoption;

  return (
    <AuthLayout title="Payment status">
      <AuthResult
        icon={<Icon className="h-7 w-7" />}
        tone={copy.tone}
        title={copy.title}
        actions={
          <>
            {canRetry && (
              <Button onClick={() => pay.mutate(canRetryBooking ? { bookingId: booking.data!.id } : { adoptionId: adoption!.id })} disabled={pay.isPending}>
                {pay.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                Try again
              </Button>
            )}
            <Button variant={canRetry ? "outline" : "default"} asChild>
              <Link href={applicationNo ? "/dashboard?tab=adoptions" : "/dashboard"}>{applicationNo ? "Go to my adoptions" : "Go to my bookings"}</Link>
            </Button>
          </>
        }
      >
        <p>{copy.text}</p>
        {applicationNo && app && (
          <div className="mt-4 space-y-1 rounded-xl border bg-muted/40 p-4 text-left">
            <p className="font-mono text-sm font-semibold text-foreground">{applicationNo}</p>
            <p className="text-foreground">Adoption fee · {app.adoptionPet.name}</p>
            {adoption && <p>Paid {formatMoney(adoption.feePaid)} of {formatMoney(adoption.feeAmount)}</p>}
            {tranId && <p className="pt-1 font-mono text-xs">Transaction {tranId}</p>}
          </div>
        )}
        {bookingNo && (
          <div className="mt-4 space-y-1 rounded-xl border bg-muted/40 p-4 text-left">
            <p className="font-mono text-sm font-semibold text-foreground">{bookingNo}</p>
            {status === "loading" || booking.isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : booking.data ? (
              <>
                <p className="text-foreground">{booking.data.service.name} · {booking.data.pet.name}</p>
                <p>{bookingWhen(booking.data)}</p>
                <p>Total {formatMoney(booking.data.totalAmount)}</p>
              </>
            ) : null}
            {tranId && <p className="pt-1 font-mono text-xs">Transaction {tranId}</p>}
          </div>
        )}
      </AuthResult>
    </AuthLayout>
  );
}
