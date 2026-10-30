import type { Metadata } from "next";
import { Suspense } from "react";
import { GuestOnly } from "@/components/auth/ProtectedRoute";
import LoginPage from "@/views/auth/LoginPage";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <Suspense>
      <GuestOnly><LoginPage /></GuestOnly>
    </Suspense>
  );
}
