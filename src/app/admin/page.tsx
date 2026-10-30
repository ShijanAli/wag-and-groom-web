import type { Metadata } from "next";
import AdminDashboard from "@/views/admin/AdminDashboard";

export const metadata: Metadata = { title: "Dashboard" };

export default function Page() {
  return <AdminDashboard />;
}
