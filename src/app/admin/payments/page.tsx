import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PAYMENTS_ENABLED } from "@/lib/features";
import AdminPayments from "@/views/admin/AdminPayments";

export const metadata: Metadata = { title: "Payments" };

export default function Page() {
  if (!PAYMENTS_ENABLED) notFound();
  return <AdminPayments />;
}
