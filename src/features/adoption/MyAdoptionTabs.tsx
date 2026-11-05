"use client";

import Link from "next/link";
import { FileText, Heart, PawPrint, X } from "lucide-react";
import { useConfirm } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatDay } from "@/lib/format";
import { cdn } from "@/lib/image";
import type { AdoptionApplication, AdoptionPetSummary } from "@/types/models";
import { useMyAdoptions, useMyApplications, useMyFavorites, useWithdrawApplication } from "./api";
import { AdoptionPetCard, feeLabel } from "./components";

const APP_LABEL: Record<string, string> = { cancelled: "Withdrawn" };

function PetThumb({ pet }: { pet: AdoptionPetSummary }) {
  const img = pet.images[0]?.imageUrl;
  return img ? (
    // eslint-disable-next-line @next/next/no-img-element -- API image
    <img src={cdn(img, 160, 160)} alt="" loading="lazy" className="h-16 w-16 shrink-0 rounded-2xl object-cover" />
  ) : (
    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary">
      <PawPrint className="h-7 w-7" />
    </span>
  );
}

/** Customer dashboard → Adoptions: applications + completed adoptions. */
export function MyAdoptionsTab() {
  const apps = useMyApplications({ limit: 50, sortBy: "createdAt", sortOrder: "desc" });
  const adoptions = useMyAdoptions({ limit: 50, sortBy: "createdAt", sortOrder: "desc" });
  const withdraw = useWithdrawApplication();
  const { confirm } = useConfirm();

  if (apps.isPending) return <div className="space-y-3">{Array.from({ length: 2 }, (_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>;
  const rows = apps.data?.data ?? [];
  if (!rows.length)
    return (
      <EmptyState
        icon={Heart}
        title="No adoption applications yet"
        description="Meet the pets waiting for a home and apply online."
        action={
          <Button asChild>
            <Link href="/adopt">Browse pets</Link>
          </Button>
        }
        className="bg-card"
      />
    );

  const adoptionById = new Map((adoptions.data?.data ?? []).map((a) => [a.id, a]));

  return (
    <div className="space-y-3">
      {rows.map((app: AdoptionApplication) => {
        const ad = app.adoption;
        const full = ad ? adoptionById.get(ad.id) : undefined;

        const open = ["pending", "under_review"].includes(app.status);
        return (
          <Card key={app.id}>
            <CardContent className="space-y-4 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <PetThumb pet={app.adoptionPet} />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/adopt/${app.adoptionPet.slug}`} className="font-semibold hover:text-primary">
                      {app.adoptionPet.name}
                    </Link>
                    <StatusBadge status={app.status} label={APP_LABEL[app.status]} tone={app.status === "cancelled" ? "neutral" : undefined} />
                    {ad && <StatusBadge status={ad.status} label={`Adoption ${ad.status.replace("_", " ")}`} />}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-mono">{app.applicationNo}</span> · applied {formatDate(app.createdAt)}
                  </p>
                  {app.adminNote && app.status !== "cancelled" && <p className="text-sm">Note from our team: “{app.adminNote}”</p>}
                </div>
                {open && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() =>
                      confirm({
                        title: "Withdraw this application?",
                        description: `Your application for ${app.adoptionPet.name} will be withdrawn. You can apply again later.`,
                        confirmText: "Withdraw",
                        cancelText: "Keep it",
                        tone: "danger",
                        onConfirm: () => withdraw.mutateAsync({ idOrNo: app.applicationNo }),
                      })
                    }
                  >
                    <X className="mr-1.5 h-4 w-4" /> Withdraw
                  </Button>
                )}
              </div>

              {ad && ad.status !== "cancelled" && (
                <div className="flex flex-col gap-3 rounded-xl bg-muted/50 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-0.5">
                    <p>
                      Adoption fee <span className="font-semibold">{feeLabel(ad.feeAmount)}</span>
                    </p>
                    {full && (
                      <p className="text-muted-foreground">
                        {ad.status === "completed" ? `Welcome home! Handover on ${formatDay(full.adoptionDate, "d MMM yyyy")}` : `Handover planned for ${formatDay(full.adoptionDate, "d MMM yyyy")}`}
                        {full.followUpDate && ` · follow-up visit ${formatDay(full.followUpDate, "d MMM")}`}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {full?.contractFile && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={full.contractFile} target="_blank" rel="noreferrer">
                          <FileText className="mr-1.5 h-4 w-4" /> Contract
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/** Customer dashboard → Favourites. */
export function MyFavoritesTab() {
  const q = useMyFavorites({ limit: 50, sortBy: "createdAt", sortOrder: "desc" });
  if (q.isPending) return <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-3xl" />)}</div>;
  const rows = q.data?.data ?? [];
  if (!rows.length)
    return (
      <EmptyState
        icon={Heart}
        title="No favourites yet"
        description="Tap the heart on any pet to keep them here."
        action={
          <Button asChild>
            <Link href="/adopt">Browse pets</Link>
          </Button>
        }
        className="bg-card"
      />
    );
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((p) => (
        <AdoptionPetCard key={p.id} pet={p} favorite />
      ))}
    </div>
  );
}
