import type { Metadata } from "next";
import AdminServices from "@/views/admin/AdminServices";

export const metadata: Metadata = { title: "Services" };

export default function Page() {
  return <AdminServices />;
}
