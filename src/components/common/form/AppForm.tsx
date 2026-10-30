"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type DefaultValues, type FieldValues, type UseFormProps, type UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import { Form } from "@/components/ui/form";
import { applyFieldErrors } from "@/lib/api/errors";

/** `useForm` pre-wired with a zod schema. Types are inferred from the schema. */
export function useZodForm<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  options?: Omit<UseFormProps<z.input<TSchema>>, "resolver"> & { defaultValues?: DefaultValues<z.input<TSchema>> },
) {
  return useForm<z.input<TSchema>, unknown, z.output<TSchema>>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    ...options,
  });
}

interface AppFormProps<TIn extends FieldValues, TOut extends FieldValues> {
  form: UseFormReturn<TIn, unknown, TOut>;
  /** Throw (or let a mutation reject) to keep the form; backend field errors are mapped onto inputs. */
  onSubmit: (values: TOut) => Promise<unknown> | unknown;
  className?: string;
  id?: string;
  children: React.ReactNode;
}

/**
 * `<form>` + react-hook-form provider + server-error mapping.
 * Every form in the app (page or modal) is an AppForm, so validation UX is identical everywhere.
 */
export function AppForm<TIn extends FieldValues, TOut extends FieldValues>({
  form,
  onSubmit,
  className,
  id,
  children,
}: AppFormProps<TIn, TOut>) {
  const submit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(values);
    } catch (err) {
      // field-level 422s land under the inputs; anything else was already toasted by useApiMutation
      applyFieldErrors(err, form.setError);
    }
  });

  return (
    <Form {...form}>
      <form id={id} onSubmit={submit} className={className} noValidate>
        {children}
      </form>
    </Form>
  );
}
