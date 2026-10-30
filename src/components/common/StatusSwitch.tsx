"use client";

import { Switch } from "@/components/ui/switch";

/**
 * Inline active/inactive toggle for table rows. Shows the pending state
 * while the mutation runs; disabled when the user lacks permission.
 */
export function StatusSwitch({
  active,
  onToggle,
  pending,
  disabled,
  label,
}: {
  active: boolean;
  onToggle: (next: boolean) => void;
  pending?: boolean;
  disabled?: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <Switch checked={active} onCheckedChange={onToggle} disabled={disabled || pending} aria-label={label} className={pending ? "opacity-60" : undefined} />
      <span className={active ? "text-xs font-medium text-success" : "text-xs text-muted-foreground"}>{active ? "Active" : "Inactive"}</span>
    </div>
  );
}
