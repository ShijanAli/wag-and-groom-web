"use client";

import { useState } from "react";
import { ChevronRight, HeartHandshake, Home as HomeIcon, ShieldCheck, SlidersHorizontal, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DataTablePagination, TableFilter, TableSearch } from "@/components/common/data-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { useListParams } from "@/hooks/use-list-params";
import type { ListParams, Paginated } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { AGE_FILTERS, FEE_FILTERS, useFavoriteIds, usePublicAdoptionPets } from "@/features/adoption/api";
import { AdoptEmpty, AdoptionPetCard } from "@/features/adoption/components";
import type { AdoptionPet } from "@/types/models";
import { useRouter } from "next/navigation";

export const ADOPT_PAGE_SIZE = 12;
export const ADOPT_DEFAULTS = { limit: ADOPT_PAGE_SIZE, sortBy: "createdAt", sortOrder: "desc" } as const;

const SORTS = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "ageMonths:asc", label: "Youngest first" },
  { value: "ageMonths:desc", label: "Oldest first" },
  { value: "adoptionFee:asc", label: "Lowest fee" },
];

const STEPS = [
  { icon: HeartHandshake, title: "Find your match", text: "Browse pets and save favourites." },
  { icon: HomeIcon, title: "Apply online", text: "Tell us about your home — takes 3 minutes." },
  { icon: Stethoscope, title: "Meet & greet", text: "We review, call you and arrange a visit." },
  { icon: ShieldCheck, title: "Welcome home", text: "Pay the fee, sign the contract, take them home." },
];

/** UI-only params (`age`, `fee`, `sort`) → API params. */
function toApiParams(p: ListParams): ListParams {
  const { age, fee, sort, ...rest } = p;
  const out: ListParams = { ...rest };
  if (typeof age === "string") {
    const [min, max] = age.split("-").map(Number);
    out.minAgeMonths = min;
    out.maxAgeMonths = max;
  }
  if (fee !== undefined && fee !== "") out.maxFee = Number(fee);
  if (typeof sort === "string") [out.sortBy, out.sortOrder] = sort.split(":") as [string, "asc" | "desc"];
  return out;
}

export default function AdoptPage({ initial, petTypes }: { initial: Paginated<AdoptionPet> | null; petTypes: { value: number; label: string }[] }) {
  const router = useRouter();
  const list = useListParams({ defaults: { ...ADOPT_DEFAULTS } });
  const apiParams = toApiParams(list.params);
  const isDefault = Object.keys(list.params).every((k) => k in ADOPT_DEFAULTS || k === "page") && (list.params.page ?? 1) === 1;
  const query = usePublicAdoptionPets(apiParams, isDefault ? initial ?? undefined : undefined);
  const favorites = useFavoriteIds();
  const rows = query.data?.data ?? [];
  const sort = (list.params.sort as string) ?? "createdAt:desc";
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <SiteHeader onBook={() => router.push("/services")} />
      <main>
        <section className="relative overflow-hidden pt-[72px]">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/70 via-background to-background" />
          <div className="container mx-auto px-4 pb-12 pt-10">
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <li>
                  <Link href="/" className="hover:text-primary">
                    Home
                  </Link>
                </li>
                <li aria-hidden>
                  <ChevronRight className="h-4 w-4" />
                </li>
                <li aria-current="page" className="font-medium text-foreground">
                  Adopt
                </li>
              </ol>
            </nav>
            <div className="max-w-2xl space-y-4">
              <h1 className="font-display text-4xl font-bold leading-tight sm:text-6xl">
                Adopt a <span className="text-primary">best friend</span>
              </h1>
              <p className="text-lg text-muted-foreground">Every pet here is vaccinated, health-checked and waiting for a family. Find yours and apply online.</p>
            </div>
            <ol className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex flex-col gap-2 rounded-2xl border bg-card/70 p-3 sm:flex-row sm:gap-3 sm:p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">
                      {i + 1}. {s.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="container mx-auto space-y-6 px-4 pb-24">
          <div className="-mx-4 flex flex-col gap-2 border-b bg-background/90 px-4 py-3 backdrop-blur lg:sticky lg:top-[72px] lg:z-30 lg:flex-row lg:flex-wrap lg:items-center">
            <div className="flex gap-2">
              <TableSearch list={list} placeholder="Search name or breed…" />
              <Button variant="outline" className="h-9 shrink-0 sm:hidden" onClick={() => setShowFilters((s) => !s)} aria-expanded={showFilters}>
                <SlidersHorizontal className="mr-1.5 h-4 w-4" /> Filters
              </Button>
            </div>
            <div className={cn("grid-cols-2 gap-2 sm:flex sm:flex-wrap", showFilters ? "grid" : "hidden")}>
              <TableFilter list={list} param="petTypeId" options={petTypes} allLabel="All animals" placeholder="Animal" className="sm:w-36" />
              <TableFilter list={list} param="gender" options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }]} allLabel="Any gender" placeholder="Gender" className="sm:w-36" />
              <TableFilter list={list} param="size" options={[{ value: "small", label: "Small" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }]} allLabel="Any size" placeholder="Size" className="sm:w-32" />
              <TableFilter list={list} param="age" options={AGE_FILTERS} allLabel="Any age" placeholder="Age" className="sm:w-36" />
              <TableFilter list={list} param="fee" options={FEE_FILTERS} allLabel="Any fee" placeholder="Fee" className="sm:w-36" />
              <Select value={sort} onValueChange={(v) => list.setParams({ sort: v === "createdAt:desc" ? undefined : v })}>
                <SelectTrigger className="h-9 sm:w-40" aria-label="Sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORTS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {query.data && <p className="text-sm text-muted-foreground lg:ml-auto">{query.data.meta.total} pets</p>}
          </div>

          {query.isPending ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => (
                <Skeleton key={i} className="aspect-[4/5] rounded-3xl" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <AdoptEmpty onReset={list.reset} />
          ) : (
            <div className={cn("grid gap-6 transition-opacity sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", query.isFetching && "opacity-60")}>
              {rows.map((p) => (
                <AdoptionPetCard key={p.id} pet={p} favorite={favorites.has(p.id)} />
              ))}
            </div>
          )}

          {query.data && query.data.meta.totalPages > 1 && (
            <div className="overflow-hidden rounded-2xl border bg-card">
              <DataTablePagination meta={query.data.meta} onChange={list.setParams} />
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
