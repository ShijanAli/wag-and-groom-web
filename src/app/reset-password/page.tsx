import type { Metadata } from "next";
import { Suspense } from "react";
import ResetPasswordPage from "@/views/auth/ResetPasswordPage";

export const metadata: Metadata = { title: "Reset password", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <Suspense>
      <ResetPasswordPage />
    </Suspense>
  );
}
