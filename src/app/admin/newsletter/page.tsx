import type { Metadata } from "next";
import AdminNewsletter from "@/views/admin/AdminNewsletter";

export const metadata: Metadata = { title: "Newsletter" };

export default function Page() {
  return <AdminNewsletter />;
}
