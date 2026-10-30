import type { Metadata } from "next";
import AdminPromotions from "@/views/admin/AdminPromotions";

export const metadata: Metadata = { title: "Promotions" };

export default function Page() {
  return <AdminPromotions />;
}
