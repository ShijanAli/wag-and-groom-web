"use client";

import { useCallback, useState } from "react";

/**
 * Open/close state that can carry the row it was opened for.
 *
 * const edit = useDisclosure<Service>();
 * edit.open(row)   // edit
 * edit.open()      // create
 * <FormModal open={edit.isOpen} onOpenChange={edit.setOpen} defaultValues={toForm(edit.item)} />
 */
export function useDisclosure<T = undefined>() {
  const [state, setState] = useState<{ isOpen: boolean; item: T | null }>({ isOpen: false, item: null });

  const open = useCallback((item?: T) => setState({ isOpen: true, item: item ?? null }), []);
  // keep `item` while the close animation runs so the dialog content doesn't flash empty
  const close = useCallback(() => setState((s) => ({ ...s, isOpen: false })), []);
  const setOpen = useCallback((o: boolean) => (o ? setState((s) => ({ ...s, isOpen: true })) : close()), [close]);

  return { isOpen: state.isOpen, item: state.item, open, close, setOpen };
}
