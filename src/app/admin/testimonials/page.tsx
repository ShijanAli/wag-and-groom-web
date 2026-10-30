import type { Metadata } from "next";
import AdminTestimonials from "@/views/admin/AdminTestimonials";

export const metadata: Metadata = { title: "Testimonials" };

export default function Page() {
  return <AdminTestimonials />;
}
