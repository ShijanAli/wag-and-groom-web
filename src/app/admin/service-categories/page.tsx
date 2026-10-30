import type { Metadata } from "next";
import AdminCategories from "@/views/admin/AdminCategories";

export const metadata: Metadata = { title: "Service categories" };

export default function Page() {
  return <AdminCategories />;
}
