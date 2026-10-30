import type { Metadata } from "next";
import { Suspense } from "react";
import { GuestOnly } from "@/components/auth/ProtectedRoute";
import RegisterPage from "@/views/auth/RegisterPage";

export const metadata: Metadata = { title: "Create account", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <Suspense>
      <GuestOnly><RegisterPage /></GuestOnly>
    </Suspense>
  );
}
