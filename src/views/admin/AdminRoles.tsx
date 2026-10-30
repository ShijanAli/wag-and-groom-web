"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Lock, Pencil, Plus, Save, Search, ShieldCheck, Trash2, Undo2, Users } from "lucide-react";
import { z } from "zod";
import { Can } from "@/components/common/Can";
import { EmptyState } from "@/components/common/EmptyState";
import { SelectField, TextareaField, TextField } from "@/components/common/form/fields";
import { FormModal } from "@/components/common/form/FormModal";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useCrudDelete, useCrudEditor } from "@/hooks/use-crud";
import { PERMISSIONS as P } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { STATUS_OPTIONS } from "@/features/catalog/api";
import { moduleLabel, roleHooks, usePermissions, useSetRolePermissions, type RoleInput } from "@/features/system/api";
import type { Permission, Role } from "@/types/models";

const SUPER_ADMIN = "super_admin";

const schema = z.object({
  name: z.string().trim().min(2, "At least 2 characters").max(100),
  description: z.string().trim().max(500),
  status: z.enum(["active", "inactive"]),
});
type Form = z.output<typeof schema>;

export default function AdminRoles() {
  const { can, user, refreshUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const roles = roleHooks.useList({ limit: 100, sortBy: "createdAt", sortOrder: "asc" });
  const list = roles.data?.data ?? [];
  const fromUrl = Number(sp.get("role"));
  // a deleted / unknown ?role falls back to the first editable role
  const selectedId = list.some((r) => r.id === fromUrl) ? fromUrl : (list.find((r) => r.slug !== SUPER_ADMIN)?.id ?? list[0]?.id);
  const select = (id: number) => router.replace(`${pathname}?role=${id}`, { scroll: false });

  const editor = useCrudEditor<Role, Form, RoleInput>({
    hooks: roleHooks,
    entity: "role",
    toForm: (r) => ({ name: r?.name ?? "", description: r?.description ?? "", status: r?.status ?? "active" }),
    toInput: (v) => ({ ...v, description: v.description || null }),
  });
  const remove = useCrudDelete(roleHooks, "role", (r: Role) => r.name);

  return (
    <>
      <PageHeader
        title="Roles & Permissions"
        description="A role is a set of permissions. Every user has exactly one role; the panel menu adapts to it."
        actions={
          <Can permission={P.ROLE.CREATE}>
            <Button onClick={() => editor.open()}>
              <Plus className="mr-2 h-4 w-4" /> New role
            </Button>
          </Can>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <nav aria-label="Roles" className="space-y-2">
          {roles.isPending
            ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
            : list.map((r) => {
                const active = r.id === selectedId;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => select(r.id)}
                    aria-current={active ? "true" : undefined}
                    className={cn("w-full rounded-xl border bg-card p-4 text-left transition", active ? "border-primary ring-1 ring-primary" : "hover:border-primary/40")}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 font-semibold">
                        {r.name}
                        {r.isSystem && <Lock className="h-3.5 w-3.5 text-muted-foreground" aria-label="System role" />}
                      </span>
                      {r.status === "inactive" && <StatusBadge status="inactive" />}
                    </div>
                    <p className="mt-1 flex gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3 w-3" aria-hidden /> {r._count?.users ?? 0} user{r._count?.users === 1 ? "" : "s"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" aria-hidden /> {r.slug === SUPER_ADMIN ? "All" : (r._count?.permissions ?? 0)} permissions
                      </span>
                    </p>
                  </button>
                );
              })}
        </nav>

        {selectedId ? (
          <RoleEditor
            key={selectedId}
            id={selectedId}
            canEdit={can(P.ROLE.UPDATE)}
            canAssign={can(P.ROLE.ASSIGN_PERMISSION)}
            canDelete={can(P.ROLE.DELETE)}
            onEdit={editor.open}
            onDelete={remove}
            onSaved={(role) => role.id === user?.roleId && refreshUser()}
          />
        ) : (
          !roles.isPending && <EmptyState title="No roles" />
        )}
      </div>

      <FormModal schema={schema} {...editor.modalProps}>
        <TextField name="name" label="Name" placeholder="e.g. Receptionist" required autoFocus />
        <TextareaField name="description" label="Description" rows={2} placeholder="What people with this role do" />
        <SelectField name="status" label="Status" options={STATUS_OPTIONS} description="Inactive roles can't sign in to the panel." />
      </FormModal>
    </>
  );
}

function RoleEditor({
  id,
  canEdit,
  canAssign,
  canDelete,
  onEdit,
  onDelete,
  onSaved,
}: {
  id: number;
  canEdit: boolean;
  canAssign: boolean;
  canDelete: boolean;
  onEdit: (r: Role) => void;
  onDelete: (r: Role) => void;
  onSaved: (r: Role) => void;
}) {
  const role = roleHooks.useOne(id);
  const all = usePermissions();
  const save = useSetRolePermissions();
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [query, setQuery] = useState("");
  const r = role.data;
  const isSuper = r?.slug === SUPER_ADMIN;
  const readOnly = !canAssign || isSuper;

  const original = useMemo(() => new Set(r?.permissions?.map((p) => p.id) ?? []), [r]);
  useEffect(() => setChecked(new Set(original)), [original]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const map = new Map<string, Permission[]>();
    for (const p of all.data ?? []) {
      if (q && !`${p.name} ${p.slug} ${p.module}`.toLowerCase().includes(q)) continue;
      map.set(p.module, [...(map.get(p.module) ?? []), p]);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [all.data, query]);

  const dirty = checked.size !== original.size || [...checked].some((x) => !original.has(x));
  const toggle = (ids: number[], on: boolean) =>
    setChecked((prev) => {
      const next = new Set(prev);
      ids.forEach((i) => (on ? next.add(i) : next.delete(i)));
      return next;
    });

  if (!r || all.isPending) return <Skeleton className="h-[480px] rounded-xl" />;

  return (
    <Card>
      <CardHeader className="gap-4 space-y-0 border-b sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-xl">
            {r.name} {r.isSystem && <StatusBadge status="system" label="System role" tone="neutral" />}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{r.description || "No description"}</p>
          <p className="text-xs text-muted-foreground">
            {isSuper ? "Always has every permission." : `${checked.size} of ${all.data?.length ?? 0} permissions`} · {r._count?.users ?? 0} user
            {r._count?.users === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          {canEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(r)}>
              <Pencil className="mr-1.5 h-4 w-4" /> Edit
            </Button>
          )}
          {canDelete && !r.isSystem && (
            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => onDelete(r)}>
              <Trash2 className="mr-1.5 h-4 w-4" /> Delete
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-4 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter permissions…" className="h-9 pl-9" aria-label="Filter permissions" />
          </div>
          {!readOnly && (
            <div className="flex gap-2 text-sm">
              <Button variant="ghost" size="sm" onClick={() => toggle((all.data ?? []).map((p) => p.id), true)}>
                Select all
              </Button>
              <Button variant="ghost" size="sm" onClick={() => toggle((all.data ?? []).map((p) => p.id), false)}>
                Clear all
              </Button>
            </div>
          )}
        </div>

        {isSuper && (
          <p className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
            <Lock className="mr-1.5 inline h-4 w-4" aria-hidden />
            Super admin is locked: it always has every permission, including new ones added later.
          </p>
        )}

        <div className="grid gap-3 md:grid-cols-2">
          {groups.map(([module, perms]) => {
            const ids = perms.map((p) => p.id);
            const n = ids.filter((i) => isSuper || checked.has(i)).length;
            const state = n === ids.length ? true : n === 0 ? false : "indeterminate";
            return (
              <fieldset key={module} className="rounded-xl border p-4">
                <legend className="sr-only">{moduleLabel(module)}</legend>
                <label className="mb-3 flex cursor-pointer items-center justify-between gap-3">
                  <span className="font-medium">{moduleLabel(module)}</span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    {n}/{ids.length}
                    <Checkbox checked={state} disabled={readOnly} onCheckedChange={(v) => toggle(ids, v === true)} aria-label={`All ${moduleLabel(module)} permissions`} />
                  </span>
                </label>
                <ul className="space-y-2">
                  {perms.map((p) => (
                    <li key={p.id}>
                      <label className={cn("flex items-start gap-2.5 text-sm", !readOnly && "cursor-pointer")}>
                        <Checkbox className="mt-0.5" checked={isSuper || checked.has(p.id)} disabled={readOnly} onCheckedChange={(v) => toggle([p.id], v === true)} />
                        <span>
                          {p.name}
                          <span className="block font-mono text-[11px] text-muted-foreground">{p.slug}</span>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </fieldset>
            );
          })}
        </div>
        {!groups.length && <EmptyState title="No permissions match" className="py-8" />}

        {dirty && !readOnly && (
          <div className="sticky bottom-4 flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-background/95 px-4 py-3 shadow-lg backdrop-blur">
            <span className="text-sm">Unsaved permission changes</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setChecked(new Set(original))}>
                <Undo2 className="mr-1.5 h-4 w-4" /> Discard
              </Button>
              <Button size="sm" disabled={save.isPending} onClick={() => save.mutate({ id: r.id, permissionIds: [...checked] }, { onSuccess: () => onSaved(r) })}>
                <Save className="mr-1.5 h-4 w-4" /> Save permissions
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
