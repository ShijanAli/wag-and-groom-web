import type { Metadata } from "next";
import AdminFaqs from "@/views/admin/AdminFaqs";

export const metadata: Metadata = { title: "FAQs" };

export default function Page() {
  return <AdminFaqs />;
}
