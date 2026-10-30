import type { Metadata } from "next";
import AdminBlog from "@/views/admin/AdminBlog";

export const metadata: Metadata = { title: "Blog" };

export default function Page() {
  return <AdminBlog />;
}
