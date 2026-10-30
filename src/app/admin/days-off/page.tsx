import type { Metadata } from "next";
import AdminDaysOff from "@/views/admin/AdminDaysOff";

export const metadata: Metadata = { title: "Holidays & days off" };

export default function Page() {
  return <AdminDaysOff />;
}
