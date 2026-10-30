"use client";

import { useState } from "react";
import { useFormContext, type ControllerRenderProps, type FieldValues } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/* ───────────────────────── shared shell ───────────────────────── */

interface BaseFieldProps {
  name: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

type RenderControl = (field: ControllerRenderProps<FieldValues, string>) => React.ReactNode;

/**
 * Label + control + description + error message, wired to the nearest AppForm.
 * Every field below is just this shell with a different control.
 */
function FieldShell({
  name,
  label,
  description,
  required,
  className,
  render,
  composite = false,
}: BaseFieldProps & {
  render: RenderControl;
  /** The control is wrapped (icon, toggle…) → render() places <FormControl> on the real input itself, so the label still targets it. */
  composite?: boolean;
}) {
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
          {composite ? render(field) : <FormControl>{render(field)}</FormControl>}
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/* ───────────────────────── text-like ───────────────────────── */

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "name" | "value" | "onChange" | "defaultValue" | "prefix">;

export interface TextFieldProps extends BaseFieldProps, InputProps {
  /** Text/icon shown inside the input on the left (e.g. "৳", a search icon). */
  leading?: React.ReactNode;
}

export function TextField({ name, label, description, required, className, leading, disabled, ...input }: TextFieldProps) {
  return (
    <FieldShell
      {...{ name, label, description, required, className }}
      composite
      render={(field) => {
        const el = (
          <FormControl>
          <Input
            {...input}
            {...field}
            value={field.value ?? ""}
            disabled={disabled}
            className={leading ? "pl-9" : undefined}
            onChange={(e) =>
              field.onChange(input.type === "number" ? (e.target.value === "" ? undefined : e.target.valueAsNumber) : e.target.value)
            }
          />
          </FormControl>
        );
        if (!leading) return el;
        return (
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{leading}</span>
            {el}
          </div>
        );
      }}
    />
  );
}

export function PasswordField(props: Omit<TextFieldProps, "type">) {
  const [show, setShow] = useState(false);
  const { name, label, description, required, className, disabled, ...input } = props;
  return (
    <FieldShell
      {...{ name, label, description, required, className }}
      composite
      render={(field) => (
        <div className="relative">
          <FormControl>
            <Input {...input} {...field} value={field.value ?? ""} disabled={disabled} type={show ? "text" : "password"} className="pr-10" />
          </FormControl>
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      )}
    />
  );
}

export interface TextareaFieldProps extends BaseFieldProps {
  placeholder?: string;
  rows?: number;
  maxLength?: number;
}

export function TextareaField({ name, label, description, required, className, disabled, ...rest }: TextareaFieldProps) {
  return (
    <FieldShell
      {...{ name, label, description, required, className }}
      render={(field) => <Textarea {...rest} {...field} value={field.value ?? ""} disabled={disabled} />}
    />
  );
}

/* ───────────────────────── choice ───────────────────────── */

export interface Option<V extends string | number = string> {
  label: React.ReactNode;
  value: V;
  disabled?: boolean;
}

export interface SelectFieldProps extends BaseFieldProps {
  options: Option<string | number>[];
  placeholder?: string;
  /** Option values are strings in the DOM; set to cast back to numbers (e.g. ids). */
  numeric?: boolean;
}

export function SelectField({ name, label, description, required, className, options, placeholder, numeric, disabled }: SelectFieldProps) {
  return (
    <FieldShell
      {...{ name, label, description, required, className }}
      composite
      render={(field) => (
        <Select
          value={field.value === undefined || field.value === null ? "" : String(field.value)}
          onValueChange={(v) => field.onChange(numeric ? Number(v) : v)}
          disabled={disabled}
        >
          <FormControl>
            <SelectTrigger ref={field.ref} onBlur={field.onBlur}>
              <SelectValue placeholder={placeholder ?? "Select…"} />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {options.map((o) => (
              <SelectItem key={String(o.value)} value={String(o.value)} disabled={o.disabled}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  );
}

/** Boolean as a switch row: label on the left, toggle on the right. */
export function SwitchField({ name, label, description, className, disabled }: BaseFieldProps) {
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex items-center justify-between gap-4 rounded-lg border p-3", className)}>
          <div className="space-y-0.5">
            {label && <FormLabel className="text-sm">{label}</FormLabel>}
            {description && <FormDescription className="text-xs">{description}</FormDescription>}
          </div>
          <FormControl>
            <Switch checked={!!field.value} onCheckedChange={field.onChange} disabled={disabled} />
          </FormControl>
        </FormItem>
      )}
    />
  );
}

export function CheckboxField({ name, label, description, className, disabled }: BaseFieldProps) {
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-row items-start gap-3 space-y-0", className)}>
          <FormControl>
            <Checkbox checked={!!field.value} onCheckedChange={(v) => field.onChange(v === true)} disabled={disabled} />
          </FormControl>
          <div className="space-y-1 leading-none">
            {label && <FormLabel className="font-normal">{label}</FormLabel>}
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}

/** Responsive grid for side-by-side fields: <FieldRow><TextField/><TextField/></FieldRow> */
export function FieldRow({ children, cols = 2, className }: { children: React.ReactNode; cols?: 2 | 3; className?: string }) {
  return <div className={cn("grid gap-4", cols === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3", className)}>{children}</div>;
}

export { FieldShell };
