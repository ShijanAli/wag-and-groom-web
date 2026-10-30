"use client";

import { MoreHorizontal, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface RowAction {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  danger?: boolean;
  /** Hide when false — typically `can(PERMISSIONS.X.DELETE)`. */
  visible?: boolean;
  disabled?: boolean;
}

/** "⋯" menu for a table row. Danger actions are grouped at the bottom behind a separator. */
export function RowActions({ actions, label = "Row actions" }: { actions: RowAction[]; label?: string }) {
  const shown = actions.filter((a) => a.visible !== false);
  if (shown.length === 0) return null;
  const normal = shown.filter((a) => !a.danger);
  const danger = shown.filter((a) => a.danger);

  const item = (a: RowAction) => (
    <DropdownMenuItem
      key={a.label}
      disabled={a.disabled}
      onSelect={a.onClick}
      className={cn(a.danger && "text-destructive focus:bg-destructive/10 focus:text-destructive")}
    >
      {a.icon && <a.icon className="mr-2 h-4 w-4" />}
      {a.label}
    </DropdownMenuItem>
  );

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={label} onClick={(e) => e.stopPropagation()}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44" onClick={(e) => e.stopPropagation()}>
        {normal.map(item)}
        {normal.length > 0 && danger.length > 0 && <DropdownMenuSeparator />}
        {danger.map(item)}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
