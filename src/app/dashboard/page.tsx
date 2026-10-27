import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import CustomerDashboard from "@/views/dashboard/CustomerDashboard";

export default function Page() {
  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <CustomerDashboard />
    </ProtectedRoute>
  );
}
