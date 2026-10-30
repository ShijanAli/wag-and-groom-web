import type { Metadata } from "next";
import AdminAdoptionPets from "@/views/admin/AdminAdoptionPets";

export const metadata: Metadata = { title: "Pets for adoption" };

export default function Page() {
  return <AdminAdoptionPets />;
}
