import type { Metadata } from "next";
import { Suspense } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import CustomerDashboard from "@/views/dashboard/CustomerDashboard";

export const metadata: Metadata = { title: "My dashboard", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <ProtectedRoute area="customer">
      <Suspense>
        <CustomerDashboard />
      </Suspense>
    </ProtectedRoute>
  );
}
