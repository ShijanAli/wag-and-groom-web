"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConfirmProvider } from "@/components/common/ConfirmDialog";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import { getStatus } from "@/lib/api/errors";

const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // 4xx won't fix itself on retry; only retry network / 5xx errors, once.
        retry: (count, err) => {
          const status = getStatus(err);
          return count < 1 && (!status || status >= 500);
        },
      },
      mutations: { retry: false },
    },
  });

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
        <TooltipProvider delayDuration={200}>
          <AuthProvider>
            <ConfirmProvider>
              {/* AppProvider = legacy mock store; removed as modules move to the API (F3). */}
              <AppProvider>
                {children}
                <Toaster richColors closeButton position="top-right" />
              </AppProvider>
            </ConfirmProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
