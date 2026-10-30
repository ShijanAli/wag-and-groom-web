import type { Metadata } from "next";
import AdminGallery from "@/views/admin/AdminGallery";

export const metadata: Metadata = { title: "Gallery" };

export default function Page() {
  return <AdminGallery />;
}
