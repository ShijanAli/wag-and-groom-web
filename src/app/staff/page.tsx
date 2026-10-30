import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import StaffDashboard from "@/views/staff/StaffDashboard";

export default function Page() {
  return (
    <ProtectedRoute area="staff">
      <StaffDashboard />
    </ProtectedRoute>
  );
}
