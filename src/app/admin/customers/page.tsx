import type { Metadata } from "next";
import AdminCustomers from "@/views/admin/AdminCustomers";

export const metadata: Metadata = { title: "Customers" };

export default function Page() {
  return <AdminCustomers />;
}
