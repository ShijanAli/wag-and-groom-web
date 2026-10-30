"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, ChevronRight, ClipboardCheck, HeartPulse, LogIn, PawPrint, Phone, Ruler, ShieldCheck, Sparkles, Syringe } from "lucide-react";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { cdn } from "@/lib/image";
import { cn } from "@/lib/utils";
import { ageLabel, useFavoriteIds, useMyApplications } from "@/features/adoption/api";
import { ApplyModal } from "@/features/adoption/ApplyModal";
import { FavoriteButton, GenderIcon, feeLabel } from "@/features/adoption/components";
import { useContactInfo } from "@/features/settings/api";
import type { AdoptionPet } from "@/types/models";

export default function AdoptionPetPage({ pet }: { pet: AdoptionPet }) {
  const router = useRouter();
  const favorites = useFavoriteIds();
  const images = pet.images?.length ? pet.images : [];
  const [active, setActive] = useState(0);
  const facts = [
    { icon: Calendar, label: "Age", value: ageLabel(pet.ageMonths) },
    { icon: PawPrint, label: "Breed", value: pet.breed ?? pet.petType.name },
    { icon: Ruler, label: "Size", value: pet.size ? pet.size[0].toUpperCase() + pet.size.slice(1) : "—" },
    { icon: Sparkles, label: "Colour", value: pet.color ?? "—" },
    { icon: Syringe, label: "Vaccinated", value: pet.isVaccinated ? "Yes" : "Not yet" },
    { icon: ShieldCheck, label: "Neutered", value: pet.isNeutered ? "Yes" : "No" },
  ];

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <SiteHeader onBook={() => router.push("/services")} />
      <main className="container mx-auto px-4 pb-24 pt-[96px]">
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
            <li>
              <Link href="/adopt" className="hover:text-primary">
                Adopt
              </Link>
            </li>
            <li aria-hidden>
              <ChevronRight className="h-4 w-4" />
            </li>
            <li aria-current="page" className="font-medium text-foreground">
              {pet.name}
            </li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr]">
          {/* gallery */}
          <div className="space-y-3">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-gradient-to-br from-accent to-primary/15 shadow-xl">
              {images[active] ? (
                // eslint-disable-next-line @next/next/no-img-element -- API image, resized by the CDN helper
                <img src={cdn(images[active].imageUrl, 1200, 900)} alt={`${pet.name}, photo ${active + 1}`} className="h-full w-full object-cover" />
              ) : (
                <PawPrint className="absolute inset-0 m-auto h-16 w-16 text-primary/40" />
              )}
              <FavoriteButton petId={pet.id} active={favorites.has(pet.id)} size="lg" className="absolute right-4 top-4" />
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`Show photo ${i + 1}`}
                    aria-current={i === active}
                    className={cn("h-20 w-24 shrink-0 overflow-hidden rounded-xl ring-2 transition", i === active ? "ring-primary" : "ring-transparent opacity-70 hover:opacity-100")}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- thumbnail */}
                    <img src={cdn(img.imageUrl, 200, 160)} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* info */}
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-primary">{pet.petType.name} for adoption</p>
              <h1 className="flex items-center gap-3 font-display text-4xl font-bold sm:text-5xl">
                {pet.name} <GenderIcon gender={pet.gender} className="h-8 w-8 text-3xl" />
              </h1>
              <p className="text-lg text-muted-foreground">
                {[pet.breed, ageLabel(pet.ageMonths), pet.gender === "male" ? "Male" : "Female"].filter(Boolean).join(" · ")}
              </p>
            </div>

            {pet.status === "pending" && (
              <p className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
                <span className="font-semibold">Adoption in progress.</span> {pet.name} has an approved adopter — save them to your favourites in case plans change.
              </p>
            )}

            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {facts.map((f) => (
                <div key={f.label} className="rounded-2xl border bg-card p-3">
                  <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <f.icon className="h-3.5 w-3.5" /> {f.label}
                  </dt>
                  <dd className="mt-1 font-semibold">{f.value}</dd>
                </div>
              ))}
            </dl>

            <div className="flex flex-col gap-4 rounded-3xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Adoption fee</p>
                <p className="font-display text-3xl font-bold">{feeLabel(pet.adoptionFee)}</p>
                <p className="text-xs text-muted-foreground">Covers vaccines, health check and microchip.</p>
              </div>
              <ApplyAction pet={pet} />
            </div>

            <CallLink name={pet.name} />
          </div>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1.15fr_1fr]">
          <section className="space-y-3">
            <h2 className="font-display text-2xl font-bold">About {pet.name}</h2>
            <p className="whitespace-pre-line leading-relaxed text-muted-foreground">{pet.description}</p>
          </section>
          {pet.healthStatus && (
            <section className="space-y-3">
              <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
                <HeartPulse className="h-6 w-6 text-primary" /> Health
              </h2>
              <p className="whitespace-pre-line leading-relaxed text-muted-foreground">{pet.healthStatus}</p>
            </section>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

/** Apply button that knows the user's state: guest, already applied, unavailable, or free to apply. */
function ApplyAction({ pet }: { pet: AdoptionPet }) {
  const { status } = useAuth();
  const [open, setOpen] = useState(false);
  const signedIn = status === "authenticated";
  const mine = useMyApplications({ adoptionPetId: pet.id, limit: 10 }, signedIn);
  const openApp = signedIn ? mine.data?.data.find((a) => ["pending", "under_review", "approved"].includes(a.status)) : undefined;

  if (!signedIn)
    return (
      <Button size="lg" className="rounded-full" asChild>
        <Link href={`/login?from=${encodeURIComponent(`/adopt/${pet.slug}`)}`}>
          <LogIn className="mr-2 h-4 w-4" /> Sign in to apply
        </Link>
      </Button>
    );

  return (
    <>
      {openApp ? (
        <Button size="lg" variant="outline" className="rounded-full" asChild>
          <Link href="/dashboard?tab=adoptions">
            <ClipboardCheck className="mr-2 h-4 w-4" /> Applied · {openApp.applicationNo}
          </Link>
        </Button>
      ) : (
        <Button size="lg" className="rounded-full" disabled={pet.status !== "available"} onClick={() => setOpen(true)}>
          {pet.status === "available" ? `Apply to adopt ${pet.name}` : "Not taking applications"}
        </Button>
      )}
      {/* stays mounted after submit so the success screen isn't torn down when the button flips to "Applied" */}
      <ApplyModal pet={pet} open={open} onOpenChange={setOpen} />
    </>
  );
}

function CallLink({ name }: { name: string }) {
  const c = useContactInfo();
  return (
    <a href={`tel:${c.phoneHref}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
      <Phone className="h-4 w-4" /> Questions about {name}? Call {c.phone}
    </a>
  );
}
