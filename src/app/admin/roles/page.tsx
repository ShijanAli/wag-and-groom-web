import type { Metadata } from "next";
import AdminRoles from "@/views/admin/AdminRoles";

export const metadata: Metadata = { title: "Roles & permissions" };

export default function Page() {
  return <AdminRoles />;
}
