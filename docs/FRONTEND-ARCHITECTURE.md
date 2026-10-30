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

The shortest version uses `useCrudEditor` (one modal for create and edit) and `useCrudDelete`:

```tsx
const editor = useCrudEditor<PetType, Form, PetTypeInput>({ hooks: petTypeHooks, entity: "pet type", toForm, toInput });
const remove = useCrudDelete(petTypeHooks, "pet type", (t) => t.name);

<Button onClick={() => editor.open()}>New pet type</Button>          // create
{ label: "Edit", onClick: () => editor.open(row) }                  // edit
{ label: "Delete", danger: true, onClick: () => remove(row) }       // confirm + delete
<FormModal schema={schema} {...editor.modalProps}>…fields…</FormModal>
```

Field set:

- `TextField`, `PasswordField`, `TextareaField`, `SelectField`, `SwitchField`, `CheckboxField` (in `fields.tsx`)
- `ChipsField`, `MultiSelectField` (searchable), `SegmentedField`, `DateField` (in `choice-fields.tsx`)
- `ImageUploadField`
- Layout helpers: `FieldRow` and `FormSection`

The manual version:

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

## Bookings & payments (F3)

- **Services page** (`/services`) is rendered on the server from the API, with ISR every 5 minutes. That
  makes it good for SEO (JSON-LD offers in BDT), and it falls back to an empty state if the API is down.
- **BookingModal** (`features/bookings/BookingModal.tsx`) runs in 4 steps:
  1. Service
  2. Pet — incompatible pets are disabled, and you can quick-add a pet without leaving the modal
  3. Date & time — live `/services/:id/availability`, with an optional staff choice
  4. Confirm — promo code is checked with `/promotions/validate`

  After confirming, it creates the booking and the customer chooses **Pay now** (SSLCommerz) or **Pay later**.
- **SSLCommerz flow:**
  1. `POST /payments/init` returns `gatewayUrl`, and the browser goes to that hosted page.
  2. The gateway posts back to the backend, which verifies the payment server-side.
  3. The backend redirects with 303 to `/payment/success|failed|cancelled?tranId&bookingNo`.
  4. That page only *shows* the result (and "Try again" when allowed).
- **Status changes** use `StatusActions`, which follows the same `STATUS_TRANSITIONS` as the backend.
  Cancel and no-show ask for a reason first. The same component is used by staff (`/staff`) and admins
  (`/admin/bookings`).
- **Counter payments and refunds** use `RecordPaymentModal` and `RefundModal` (`features/payments`). The
  amount defaults to what is due or what can still be refunded.
- **Cache scope:** one `["bookings"]` scope covers every booking list. Any booking or payment change refreshes
  the customer, staff and admin views together.

## Adoption (F4)

- **`/adopt`**: the first page is rendered on the server (ISR 60s). Filters run on the client:
  - animal, gender, size, age, fee, sort and search
  - the UI params `age`, `fee` and `sort` are mapped to `minAgeMonths/maxAgeMonths`, `maxFee` and `sortBy/sortOrder`
  - the filter state lives in the URL
- **`/adopt/[slug]`**: ISR, generated on the first request. It has SEO metadata, OG image, a breadcrumb in
  JSON-LD, a photo gallery, a favourite toggle and an apply button that changes with state:
  - guest → sign in
  - already applied → link to the application
  - pet not available → disabled
- **Favourites:** public pages are rendered for anonymous visitors, so the hearts come from one cached
  `GET /me/favorites` request (`useFavoriteIds`).
- **Flow:**
  1. Customer applies.
  2. Admin moves it to Under review, then Approves or Rejects. Approving creates the adoption and rejects the
     other open applications.
  3. Fee is paid at the counter (`RecordPaymentModal` with `adoptionId`) or online (`usePayOnline({ adoptionId })`).
     The online result comes back to `/payment/success?applicationNo=…`.
  4. Admin completes the handover. The API refuses until the fee is fully paid, so the button stays disabled.
- **Photos:** a new pet takes photos in the create form (`MultiImageUploadField`, first = cover). For an
  existing pet, use the Photos dialog (add, make cover, remove).
- **API images** use plain `<img loading="lazy">` with `cdn(url, w, h)`, which asks Cloudinary for a resized
  `f_auto,q_auto` version.
