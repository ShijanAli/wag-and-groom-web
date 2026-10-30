import type { Metadata } from "next";
import { Suspense } from "react";
import { GuestOnly } from "@/components/auth/ProtectedRoute";
import ForgotPasswordPage from "@/views/auth/ForgotPasswordPage";

export const metadata: Metadata = { title: "Forgot password", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <Suspense>
      <GuestOnly><ForgotPasswordPage /></GuestOnly>
    </Suspense>
  );
}
