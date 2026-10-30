import type { Metadata } from "next";
import AdminBookings from "@/views/admin/AdminBookings";

export const metadata: Metadata = { title: "Bookings" };

export default function Page() {
  return <AdminBookings />;
}
