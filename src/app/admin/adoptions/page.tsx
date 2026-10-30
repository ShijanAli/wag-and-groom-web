import type { Metadata } from "next";
import AdminAdoptions from "@/views/admin/AdminAdoptions";

export const metadata: Metadata = { title: "Adoptions" };

export default function Page() {
  return <AdminAdoptions />;
}
