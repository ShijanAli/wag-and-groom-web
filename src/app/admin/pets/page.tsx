import type { Metadata } from "next";
import AdminPets from "@/views/admin/AdminPets";

export const metadata: Metadata = { title: "Pets" };

export default function Page() {
  return <AdminPets />;
}
