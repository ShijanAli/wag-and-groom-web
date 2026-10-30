"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { AlertTriangle, Info, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ConfirmOptions {
  title: React.ReactNode;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  tone?: "default" | "danger";
  /**
   * Optional async action. The dialog stays open with a spinner until it settles:
   * resolves → closes and returns true; throws → stays open (the mutation already toasted).
   */
  onConfirm?: () => Promise<unknown> | unknown;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

interface ConfirmApi {
  confirm: ConfirmFn;
  /** Shortcut for the most common case: "Delete <name>?" */
  confirmDelete: (opts: { entity: string; name?: string; onConfirm: ConfirmOptions["onConfirm"] }) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmApi | null>(null);

/**
 * One dialog instance for the whole app, driven imperatively:
 *   const { confirm, confirmDelete } = useConfirm();
 *   await confirmDelete({ entity: "service", name: s.name, onConfirm: () => remove.mutateAsync(s.id) });
 */
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [busy, setBusy] = useState(false);
  const resolver = useRef<(ok: boolean) => void>();

  const close = (ok: boolean) => {
    resolver.current?.(ok);
    resolver.current = undefined;
    setOptions(null);
  };

  const confirm = useCallback<ConfirmFn>(
    (opts) =>
      new Promise<boolean>((resolve) => {
        resolver.current?.(false);
        resolver.current = resolve;
        setOptions(opts);
      }),
    [],
  );

  const api = useMemo<ConfirmApi>(
    () => ({
      confirm,
      confirmDelete: ({ entity, name, onConfirm }) =>
        confirm({
          title: `Delete ${entity}?`,
          description: (
            <>
              {name ? (
                <>
                  <span className="font-medium text-foreground">{name}</span> will be removed.{" "}
                </>
              ) : null}
              This action can&apos;t be undone.
            </>
          ),
          confirmText: "Delete",
          tone: "danger",
          onConfirm,
        }),
    }),
    [confirm],
  );

  const handleConfirm = async () => {
    if (!options?.onConfirm) return close(true);
    setBusy(true);
    try {
      await options.onConfirm();
      close(true);
    } catch {
      /* error already surfaced by useApiMutation — keep the dialog open */
    } finally {
      setBusy(false);
    }
  };

  const danger = options?.tone === "danger";
  const Icon = danger ? AlertTriangle : Info;

  return (
    <ConfirmContext.Provider value={api}>
      {children}
      <AlertDialog open={!!options} onOpenChange={(open) => !open && !busy && close(false)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="flex-row items-start gap-4 space-y-0 text-left">
            <span
              className={cn(
                "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                danger ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary",
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
            <div className="space-y-1.5">
              <AlertDialogTitle>{options?.title}</AlertDialogTitle>
              {options?.description && <AlertDialogDescription>{options.description}</AlertDialogDescription>}
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>{options?.cancelText ?? "Cancel"}</AlertDialogCancel>
            {/* Plain Button (not AlertDialogAction) so the dialog doesn't auto-close while the action runs */}
            <Button variant={danger ? "destructive" : "default"} onClick={handleConfirm} disabled={busy}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {options?.confirmText ?? "Confirm"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx;
}
