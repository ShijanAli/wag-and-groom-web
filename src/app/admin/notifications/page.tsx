import type { Metadata } from "next";
import AdminNotifications from "@/views/admin/AdminNotifications";

export const metadata: Metadata = { title: "Notifications" };

export default function Page() {
  return <AdminNotifications />;
}
