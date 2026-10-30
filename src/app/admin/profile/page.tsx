import type { Metadata } from "next";
import AdminProfile from "@/views/admin/AdminProfile";

export const metadata: Metadata = { title: "Profile" };

export default function Page() {
  return <AdminProfile />;
}
