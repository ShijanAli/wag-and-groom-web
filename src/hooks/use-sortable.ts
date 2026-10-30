"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Dependency-free drag & drop reordering (HTML5 DnD + keyboard ← → on a focused item).
 *
 * const sort = useSortable(items, (i) => i.id);
 * sort.items          → current (locally reordered) order
 * sort.itemProps(id)  → spread on each draggable element
 * sort.dirty / sort.reset()
 */
export function useSortable<T>(source: T[], getId: (item: T) => number) {
  const [items, setItems] = useState(source);
  const [dragId, setDragId] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const getIdRef = useRef(getId);
  getIdRef.current = getId;

  // server data changed (refetch / page change) → drop local order
  useEffect(() => {
    setItems(source);
    setDirty(false);
  }, [source]);

  const move = useCallback((from: number, to: number) => {
    if (from === to || to < 0) return;
    setItems((prev) => {
      if (to >= prev.length) return prev;
      const next = [...prev];
      const [m] = next.splice(from, 1);
      next.splice(to, 0, m);
      return next;
    });
    setDirty(true);
  }, []);

  const indexOf = (id: number) => items.findIndex((i) => getIdRef.current(i) === id);

  const itemProps = (id: number) => ({
    draggable: true,
    "data-dragging": dragId === id || undefined,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.effectAllowed = "move";
      setDragId(id);
    },
    onDragEnter: (e: React.DragEvent) => {
      e.preventDefault();
      if (dragId !== null && dragId !== id) move(indexOf(dragId), indexOf(id));
    },
    onDragOver: (e: React.DragEvent) => e.preventDefault(),
    onDragEnd: () => setDragId(null),
    onKeyDown: (e: React.KeyboardEvent) => {
      const delta = e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : 0;
      if (!delta || !e.altKey) return;
      e.preventDefault();
      const i = indexOf(id);
      move(i, i + delta);
    },
  });

  return { items, itemProps, dirty, dragging: dragId !== null, reset: () => (setItems(source), setDirty(false)) };
}
