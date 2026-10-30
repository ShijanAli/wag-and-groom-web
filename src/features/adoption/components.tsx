"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, PawPrint, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { formatMoney } from "@/lib/format";
import { cdn } from "@/lib/image";
import { cn } from "@/lib/utils";
import type { AdoptionPet, FavoritePet } from "@/types/models";
import { ageLabel, coverOf, useToggleFavorite } from "./api";

export const feeLabel = (fee: string | number) => (Number(fee) === 0 ? "Free" : formatMoney(fee));

/** Heart toggle. Guests are pointed to sign-in instead. */
export function FavoriteButton({ petId, active, className, size = "md" }: { petId: number; active: boolean; className?: string; size?: "md" | "lg" }) {
  const { status } = useAuth();
  const pathname = usePathname();
  const toggle = useToggleFavorite();
  const pending = toggle.isPending && toggle.variables?.id === petId;

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (status !== "authenticated") {
      toast("Sign in to save favourites", { action: { label: "Sign in", onClick: () => (window.location.href = `/login?from=${encodeURIComponent(pathname)}`) } });
      return;
    }
    toggle.mutate({ id: petId, on: !active });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={active}
      aria-label={active ? "Remove from favourites" : "Save to favourites"}
      className={cn(
        "flex items-center justify-center rounded-full bg-background/90 shadow-md backdrop-blur transition-transform hover:scale-110 disabled:opacity-60",
        size === "lg" ? "h-11 w-11" : "h-9 w-9",
        className,
      )}
    >
      <Heart className={cn(size === "lg" ? "h-5 w-5" : "h-4 w-4", active ? "fill-destructive text-destructive" : "text-foreground")} />
    </button>
  );
}

export function GenderIcon({ gender, className }: { gender: "male" | "female"; className?: string }) {
  const male = gender === "male";
  return (
    <span role="img" aria-label={male ? "Male" : "Female"} className={cn("inline-flex h-4 w-4 items-center justify-center text-base font-bold leading-none", male ? "text-sky-600" : "text-pink-600", className)}>
      {male ? "♂" : "♀"}
    </span>
  );
}

/** Card used on /adopt and in the customer's favourites. */
export function AdoptionPetCard({ pet, favorite }: { pet: AdoptionPet | FavoritePet; favorite: boolean }) {
  const cover = coverOf(pet);
  const inProgress = pet.status === "pending";
  return (
    <Link href={`/adopt/${pet.slug}`} className="group flex flex-col overflow-hidden rounded-3xl border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-accent to-primary/15">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element -- API image, resized by the CDN helper
          <img src={cdn(cover, 640, 480)} alt={`${pet.name}, ${pet.breed ?? pet.petType.name}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <PawPrint className="absolute inset-0 m-auto h-12 w-12 text-primary/40" />
        )}
        <FavoriteButton petId={pet.id} active={favorite} className="absolute right-3 top-3" />
        {pet.isFeatured && !inProgress && <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow">Featured</span>}
        {inProgress && <span className="absolute left-3 top-3 rounded-full bg-warning px-3 py-1 text-xs font-bold text-foreground shadow">Adoption in progress</span>}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-1.5 font-display text-xl font-semibold">
            {pet.name} <GenderIcon gender={pet.gender} />
          </h3>
          <span className="font-semibold text-primary">{feeLabel(pet.adoptionFee)}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {[pet.breed ?? pet.petType.name, ageLabel(pet.ageMonths), pet.size && `${pet.size[0].toUpperCase()}${pet.size.slice(1)}`].filter(Boolean).join(" · ")}
        </p>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-2 text-xs">
          {pet.isVaccinated && <Tag>Vaccinated</Tag>}
          {pet.isNeutered && <Tag>Neutered</Tag>}
          <Tag muted>{pet.petType.name}</Tag>
        </div>
      </div>
    </Link>
  );
}

function Tag({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-medium", muted ? "bg-muted text-muted-foreground" : "bg-success/10 text-success")}>
      {!muted && <ShieldCheck className="h-3 w-3" />}
      {children}
    </span>
  );
}

export function AdoptEmpty({ onReset }: { onReset?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed bg-card px-6 py-16 text-center">
      <PawPrint className="h-8 w-8 text-muted-foreground" />
      <p className="font-medium">No pets match these filters</p>
      <p className="max-w-sm text-sm text-muted-foreground">New friends arrive every week — try widening your search.</p>
      {onReset && (
        <Button variant="outline" onClick={onReset}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
