import type { Metadata } from "next";
import AdminApplications from "@/views/admin/AdminApplications";

export const metadata: Metadata = { title: "Adoption applications" };

export default function Page() {
  return <AdminApplications />;
}
