"use client";

import { useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { format, parseISO } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toApiDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Option } from "./fields";

interface BaseProps {
  name: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

/** Label/description/message wrapper shared by the choice fields below. */
export function ChoiceShell({
  name,
  label,
  description,
  required,
  className,
  children,
}: BaseProps & { children: (value: unknown, onChange: (v: unknown) => void, onBlur: () => void) => React.ReactNode }) {
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel>
              {label}
              {required && (
                <span className="ml-0.5 text-destructive" aria-hidden>
                  *
                </span>
              )}
            </FormLabel>
          )}
          {children(field.value, field.onChange, field.onBlur)}
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/* ───────────────────────── chips: small option sets ───────────────────────── */

/** Toggle chips for a handful of options (pet types, weekdays). Value: array of option values. */
export function ChipsField({ options, ...props }: BaseProps & { options: Option<number | string>[] }) {
  return (
    <ChoiceShell {...props}>
      {(value, onChange) => {
        const selected = new Set((value as (number | string)[] | undefined) ?? []);
        const toggle = (v: number | string) => {
          const next = new Set(selected);
          if (next.has(v)) next.delete(v);
          else next.add(v);
          onChange(options.map((o) => o.value).filter((x) => next.has(x)));
        };
        return (
          <FormControl>
            <div role="group" className="flex flex-wrap gap-2">
              {options.map((o) => {
                const on = selected.has(o.value);
                return (
                  <button
                    key={String(o.value)}
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    disabled={props.disabled || o.disabled}
                    onClick={() => toggle(o.value)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors disabled:opacity-50",
                      on ? "border-primary bg-primary/10 font-medium text-primary" : "hover:border-primary/50 hover:bg-muted",
                    )}
                  >
                    {on && <Check className="h-3.5 w-3.5" />}
                    {o.label}
                  </button>
                );
              })}
            </div>
          </FormControl>
        );
      }}
    </ChoiceShell>
  );
}

/* ───────────────────────── searchable multi-select ───────────────────────── */

/** Searchable multi-select for longer lists (staff, services, categories). Value: array of ids. */
export function MultiSelectField({
  options,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyText = "Nothing found",
  ...props
}: BaseProps & { options: Option<number>[]; placeholder?: string; searchPlaceholder?: string; emptyText?: string }) {
  const [open, setOpen] = useState(false);
  const byValue = useMemo(() => new Map(options.map((o) => [o.value, o])), [options]);

  return (
    <ChoiceShell {...props}>
      {(value, onChange, onBlur) => {
        const selected = (value as number[] | undefined) ?? [];
        const toggle = (v: number) => onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
        return (
          <div className="space-y-2">
            <Popover open={open} onOpenChange={(o) => (setOpen(o), !o && onBlur())}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button type="button" variant="outline" role="combobox" aria-expanded={open} disabled={props.disabled} className="w-full justify-between font-normal">
                    <span className={cn("truncate", !selected.length && "text-muted-foreground")}>
                      {selected.length ? `${selected.length} selected` : placeholder}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder={searchPlaceholder} />
                  <CommandList>
                    <CommandEmpty>{emptyText}</CommandEmpty>
                    <CommandGroup>
                      {options.map((o) => (
                        <CommandItem key={o.value} value={`${o.value}-${String(o.label)}`} onSelect={() => toggle(o.value)} disabled={o.disabled}>
                          <span
                            className={cn(
                              "mr-2 flex h-4 w-4 items-center justify-center rounded border",
                              selected.includes(o.value) ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40",
                            )}
                          >
                            {selected.includes(o.value) && <Check className="h-3 w-3" />}
                          </span>
                          {o.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {selected.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selected.map((v) => (
                  <span key={v} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs">
                    {byValue.get(v)?.label ?? `#${v}`}
                    <button type="button" onClick={() => toggle(v)} aria-label="Remove" className="text-muted-foreground hover:text-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      }}
    </ChoiceShell>
  );
}

/* ───────────────────────── segmented choice ───────────────────────── */

/** Mutually exclusive cards/buttons — good for 2–4 options (discount type, scope). */
export function SegmentedField({ options, ...props }: BaseProps & { options: (Option<string> & { hint?: string })[] }) {
  return (
    <ChoiceShell {...props}>
      {(value, onChange) => (
        <FormControl>
          <div role="radiogroup" className={cn("grid gap-2", options.length === 2 ? "grid-cols-2" : "sm:grid-cols-3")}>
            {options.map((o) => {
              const on = value === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  disabled={props.disabled}
                  onClick={() => onChange(o.value)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                    on ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "hover:border-primary/50",
                  )}
                >
                  <span className="block font-medium">{o.label}</span>
                  {o.hint && <span className="block text-xs text-muted-foreground">{o.hint}</span>}
                </button>
              );
            })}
          </div>
        </FormControl>
      )}
    </ChoiceShell>
  );
}

/* ───────────────────────── date ───────────────────────── */

/** Date picker. Value is an API date string "YYYY-MM-DD". */
export function DateField({
  fromDate,
  toDate,
  yearPicker = false,
  placeholder = "Pick a date",
  ...props
}: BaseProps & {
  fromDate?: Date;
  toDate?: Date;
  /** Month + year dropdowns (birthdays and other far-away dates). */
  yearPicker?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <ChoiceShell {...props}>
      {(value, onChange) => {
        const date = typeof value === "string" && value ? parseISO(value) : undefined;
        return (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button type="button" variant="outline" disabled={props.disabled} className={cn("w-full justify-start font-normal", !date && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "EEE, d MMM yyyy") : placeholder}
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                defaultMonth={date}
                fromDate={fromDate}
                toDate={toDate}
                {...(yearPicker && { captionLayout: "dropdown-buttons" as const, fromYear: 1990, toYear: (toDate ?? new Date()).getFullYear() })}
                onSelect={(d) => {
                  onChange(d ? toApiDate(d) : "");
                  setOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );
      }}
    </ChoiceShell>
  );
}
