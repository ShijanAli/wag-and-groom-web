import type { Metadata } from "next";
import AdminReviews from "@/views/admin/AdminReviews";

export const metadata: Metadata = { title: "Reviews" };

export default function Page() {
  return <AdminReviews />;
}
