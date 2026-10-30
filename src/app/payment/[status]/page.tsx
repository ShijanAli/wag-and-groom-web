import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PaymentResultPage, { type PaymentOutcome } from "@/views/PaymentResultPage";

const OUTCOMES: PaymentOutcome[] = ["success", "failed", "cancelled"];

export const metadata: Metadata = { title: "Payment", robots: { index: false, follow: false } };
export const generateStaticParams = () => OUTCOMES.map((status) => ({ status }));
export const dynamicParams = false;

export default async function Page({ params }: { params: Promise<{ status: string }> }) {
  const { status } = await params;
  if (!OUTCOMES.includes(status as PaymentOutcome)) notFound();
  return (
    <Suspense>
      <PaymentResultPage outcome={status as PaymentOutcome} />
    </Suspense>
  );
}
