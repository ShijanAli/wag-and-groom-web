import type { Metadata } from "next";
import AdminActivityLog from "@/views/admin/AdminActivityLog";

export const metadata: Metadata = { title: "Activity log" };

export default function Page() {
  return <AdminActivityLog />;
}
