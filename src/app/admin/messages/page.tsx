import type { Metadata } from "next";
import AdminInbox from "@/views/admin/AdminInbox";

export const metadata: Metadata = { title: "Messages" };

export default function Page() {
  return <AdminInbox />;
}
