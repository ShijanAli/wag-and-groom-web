import type { Metadata } from "next";
import AdminBlogEditor from "@/views/admin/AdminBlogEditor";

export const metadata: Metadata = { title: "New post" };

export default function Page() {
  return <AdminBlogEditor />;
}
