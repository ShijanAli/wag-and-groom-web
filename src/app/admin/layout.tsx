import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import AdminLayout from "@/layouts/AdminLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["admin", "manager"]}>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}
