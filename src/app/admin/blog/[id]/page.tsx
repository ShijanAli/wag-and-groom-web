import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdminBlogEditor from "@/views/admin/AdminBlogEditor";

export const metadata: Metadata = { title: "Edit post" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) notFound();
  return <AdminBlogEditor id={id} />;
}
