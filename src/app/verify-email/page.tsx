import type { Metadata } from "next";
import { Suspense } from "react";
import VerifyEmailPage from "@/views/auth/VerifyEmailPage";

export const metadata: Metadata = { title: "Verify email", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <Suspense>
      <VerifyEmailPage />
    </Suspense>
  );
}
