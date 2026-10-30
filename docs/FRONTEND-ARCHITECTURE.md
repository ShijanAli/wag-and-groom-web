# PetPlex Frontend — API integration architecture

## Setup

```bash
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
npm install
npm run dev                  # http://localhost:8080
```

In the backend `.env`, set `CLIENT_URLS=http://localhost:8080` (for CORS and cookies) and
`CLIENT_URL=http://localhost:8080` (for email links and payment redirects).

## Folder layout

```
src/
  lib/api/            client.ts   axios + in-memory access token + single-flight refresh on 401
                      request.ts  api.get/list/post/patch/put/delete/upload + createResource(path)
                      hooks.ts    useApiMutation, createKeys, createResourceHooks
                      errors.ts   getErrorMessage, applyFieldErrors (422 → form fields)
                      types.ts    ApiResponse, Paginated, ListParams
  lib/                auth.ts (homePathFor, hasPermission, postLoginPath), permissions.ts (mirror of backend),
                      admin-nav.ts (sidebar + menu search + route permissions), format.ts (money/date/time)
  features/<module>/  api.ts (resource + hooks), schemas.ts, module-specific components
  components/common/  DataTable, FormModal, Modal, ConfirmDialog, form fields, ImageUpload,
                      StatusBadge, PageHeader, EmptyState, DetailList, Can, UserMenu, NotificationBell
  hooks/              use-list-params (URL ↔ table state), use-disclosure (modal + row), use-debounce
  types/models.ts     backend models
```

## Auth

- The **access token is kept in memory only**. The **refresh token** is the backend's httpOnly cookie.
- On a 401, the client makes **one** refresh call (single-flight) and retries the request once. If refresh
  fails, the user becomes a guest and the cache is cleared.
- After login, a `petplex.has-session` flag is saved in localStorage. On page load, a session restore runs
  only when this flag is present, so guests never trigger a pointless refresh request.
- Panels:
  - `customer` → `/dashboard`
  - `staff` → `/staff`
  - every other role (super_admin, admin, custom roles) → `/admin`
- Each admin page's permission comes from `lib/admin-nav.ts`. The sidebar, the "/" menu search and the
  route guard all read that one list.
- `<Can permission={PERMISSIONS.X.Y}>` hides UI the user isn't allowed to use. **The backend still
  enforces every permission.**

## Recipe: a new CRUD admin page

```ts
// features/services/api.ts
export const servicesApi = createResource<Service, ServiceInput>("/services");
export const serviceHooks = createResourceHooks("services", servicesApi);
```

```tsx
const list = useListParams({ defaults: { sortBy: "createdAt" } });
const query = serviceHooks.useList(list.params);
const edit = useDisclosure<Service>();
const save = serviceHooks.useUpdate();
const { confirmDelete } = useConfirm();

<DataTable columns={columns} query={query} list={list}
  toolbar={<DataTableToolbar list={list} filters={<TableFilter list={list} param="status" options={...} />} />} />

<FormModal open={edit.isOpen} onOpenChange={edit.setOpen} title="Edit service" schema={schema}
  defaultValues={toForm(edit.item)} onSubmit={(v) => save.mutateAsync({ id: edit.item!.id, data: v })}>
  <TextField name="name" label="Name" required />
</FormModal>
```

What you get with no extra code:

- Server-side pagination, search, sort and filters, kept in sync with the URL.
- Loading skeletons and empty/error states.
- Success and error toasts, with backend 422 errors shown under the matching inputs.
- Cache invalidation after mutations.
- A confirm dialog with a spinner that stays open if the request fails.
