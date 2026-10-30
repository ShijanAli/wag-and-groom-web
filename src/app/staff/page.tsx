import type { Metadata } from "next";
import { Suspense } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import StaffDashboard from "@/views/staff/StaffDashboard";

export const metadata: Metadata = { title: "Staff panel", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <ProtectedRoute area="staff">
      <Suspense>
        <StaffDashboard />
      </Suspense>
    </ProtectedRoute>
  );
}
