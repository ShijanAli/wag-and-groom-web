import type { Metadata } from "next";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import AdminLayout from "@/layouts/AdminLayout";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | Admin" }, robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute area="admin">
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}
