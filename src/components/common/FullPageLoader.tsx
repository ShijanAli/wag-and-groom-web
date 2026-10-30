import { PawPrint } from "lucide-react";

export function FullPageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background" role="status" aria-live="polite">
      <span className="flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-primary/15">
        <PawPrint className="h-6 w-6 text-primary" />
      </span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}
