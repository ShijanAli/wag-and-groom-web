import type { Metadata } from "next";
import AdminStaff from "@/views/admin/AdminStaff";

export const metadata: Metadata = { title: "Staff" };

export default function Page() {
  return <AdminStaff />;
}
