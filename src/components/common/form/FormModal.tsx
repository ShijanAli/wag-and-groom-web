"use client";

import { Loader2 } from "lucide-react";
import type { DefaultValues, UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Modal, modalBodyClass, modalFooterClass, type ModalSize } from "@/components/common/Modal";
import { AppForm, useZodForm } from "./AppForm";

export interface FormModalProps<TSchema extends z.ZodTypeAny> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  size?: ModalSize;
  schema: TSchema;
  defaultValues: DefaultValues<z.input<TSchema>>;
  /** Resolve → modal closes. Reject → stays open, server field errors show under the inputs. */
  onSubmit: (values: z.output<TSchema>) => Promise<unknown>;
  submitText?: string;
  children: React.ReactNode | ((form: UseFormReturn<z.input<TSchema>, unknown, z.output<TSchema>>) => React.ReactNode);
}

/**
 * Create + edit modal for every entity:
 *
 * <FormModal open={...} title={editing ? "Edit service" : "New service"} schema={serviceSchema}
 *   defaultValues={toFormValues(editing)} onSubmit={(v) => save.mutateAsync(v)}>
 *   <TextField name="name" label="Name" required />
 * </FormModal>
 *
 * The form lives inside the dialog content, which unmounts on close —
 * so every open starts from fresh `defaultValues` with no reset() juggling.
 */
export function FormModal<TSchema extends z.ZodTypeAny>({ open, onOpenChange, title, description, size, ...rest }: FormModalProps<TSchema>) {
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title} description={description} size={size} bare>
      {open && <FormModalBody {...rest} onClose={() => onOpenChange(false)} />}
    </Modal>
  );
}

function FormModalBody<TSchema extends z.ZodTypeAny>({
  schema,
  defaultValues,
  onSubmit,
  submitText = "Save",
  children,
  onClose,
}: Omit<FormModalProps<TSchema>, "open" | "onOpenChange" | "title" | "description" | "size"> & { onClose: () => void }) {
  const form = useZodForm(schema, { defaultValues });
  const submitting = form.formState.isSubmitting;

  return (
    <AppForm
      form={form}
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={async (values) => {
        await onSubmit(values);
        onClose();
      }}
    >
      <div className={`${modalBodyClass} space-y-4`}>{typeof children === "function" ? children(form) : children}</div>
      <div className={modalFooterClass}>
        <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitText}
        </Button>
      </div>
    </AppForm>
  );
}
