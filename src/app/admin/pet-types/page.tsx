import type { Metadata } from "next";
import AdminPetTypes from "@/views/admin/AdminPetTypes";

export const metadata: Metadata = { title: "Pet types" };

export default function Page() {
  return <AdminPetTypes />;
}
