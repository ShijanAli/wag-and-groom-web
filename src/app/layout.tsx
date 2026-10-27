import type { Metadata } from "next";
import "@/index.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "HappyPaws",
  description: "This is HappyPaws Website",
  openGraph: { title: "HappyPaws", description: "This is HappyPaws Website", type: "website" },
  twitter: { card: "summary_large_image", title: "HappyPaws", description: "This is HappyPaws Website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
