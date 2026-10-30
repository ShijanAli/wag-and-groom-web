"use client";

import { useState } from "react";
import { BookingModal } from "@/features/bookings/BookingModal";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

/** Header (with the "Book" button wired to the booking wizard) + footer around server-rendered public pages. */
export function PublicShell({ children }: { children: React.ReactNode }) {
  const [bookingOpen, setBookingOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <BookingModal open={bookingOpen} onOpenChange={setBookingOpen} />
      <SiteHeader onBook={() => setBookingOpen(true)} />
      <main className="pt-[72px]">{children}</main>
      <SiteFooter />
    </div>
  );
}
