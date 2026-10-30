"use client";

import { useCallback } from "react";
import type { DefaultValues, FieldValues } from "react-hook-form";
import { useConfirm } from "@/components/common/ConfirmDialog";
import type { createResourceHooks } from "@/lib/api/hooks";
import type { Id } from "@/lib/api/types";
import { useDisclosure } from "./use-disclosure";

type AnyHooks<T, C, U> = ReturnType<typeof createResourceHooks<T, C, U>>;

interface EditorConfig<T extends { id: Id }, TForm extends FieldValues, TCreate, TUpdate> {
  hooks: AnyHooks<T, TCreate, TUpdate>;
  /** Singular, lower case: "service", "pet type" */
  entity: string;
  /** Row (or null for "create") → form default values */
  toForm: (item: T | null) => DefaultValues<TForm>;
  /** Validated form values → API body */
  toInput: (values: TForm, item: T | null) => TCreate;
}

/**
 * Create + edit in one modal: wires a FormModal to the resource's create/update mutations.
 *
 * const editor = useCrudEditor({ hooks: petTypeHooks, entity: "pet type", toForm, toInput });
 * <Button onClick={() => editor.open()}>New</Button>     // create
 * editor.open(row)                                       // edit
 * <FormModal schema={schema} {...editor.modalProps}>…</FormModal>
 */
export function useCrudEditor<T extends { id: Id }, TForm extends FieldValues, TCreate, TUpdate = Partial<TCreate>>({
  hooks,
  entity,
  toForm,
  toInput,
}: EditorConfig<T, TForm, TCreate, TUpdate>) {
  const modal = useDisclosure<T>();
  const create = hooks.useCreate();
  const update = hooks.useUpdate();
  const item = modal.item;

  return {
    open: modal.open,
    item,
    modalProps: {
      open: modal.isOpen,
      onOpenChange: modal.setOpen,
      title: item ? `Edit ${entity}` : `New ${entity}`,
      submitText: item ? "Save changes" : `Create ${entity}`,
      defaultValues: toForm(item),
      onSubmit: (values: TForm) => {
        const body = toInput(values, item);
        return item ? update.mutateAsync({ id: item.id, data: body as unknown as TUpdate }) : create.mutateAsync(body);
      },
    },
  };
}

/** `remove(row)` → "Delete <entity>?" confirm → DELETE → list refresh. */
export function useCrudDelete<T extends { id: Id }>(hooks: { useRemove: AnyHooks<T, unknown, unknown>["useRemove"] }, entity: string, getName: (row: T) => string) {
  const { confirmDelete } = useConfirm();
  const remove = hooks.useRemove();
  const { mutateAsync } = remove;
  return useCallback(
    (row: T) => confirmDelete({ entity, name: getName(row), onConfirm: () => mutateAsync(row.id) }),
    // getName is usually an inline arrow — the entity name is what matters
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [confirmDelete, entity, mutateAsync],
  );
}
