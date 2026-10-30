import type { Metadata } from "next";
import AdminUsers from "@/views/admin/AdminUsers";

export const metadata: Metadata = { title: "Users" };

export default function Page() {
  return <AdminUsers />;
}
