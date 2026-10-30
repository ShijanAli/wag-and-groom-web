import type { Metadata } from "next";
import UnsubscribePage from "@/views/UnsubscribePage";

export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false, follow: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ email?: string; token?: string }> }) {
  const { email, token } = await searchParams;
  return <UnsubscribePage email={email} token={token} />;
}
