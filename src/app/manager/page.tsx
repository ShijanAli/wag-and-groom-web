import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ManagerDashboard from "@/views/manager/ManagerDashboard";

export default function Page() {
  return (
    <ProtectedRoute allowedRoles={["manager", "admin"]}>
      <ManagerDashboard />
    </ProtectedRoute>
  );
}
