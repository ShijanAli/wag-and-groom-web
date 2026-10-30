"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useWatch } from "react-hook-form";
import { z } from "zod";
import { AppForm, useZodForm } from "@/components/common/form/AppForm";
import { SegmentedField } from "@/components/common/form/choice-fields";
import { SwitchField, TextareaField } from "@/components/common/form/fields";
import { SubmitButton } from "@/components/common/form/SubmitButton";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/ui/button";
import type { AdoptionApplication, AdoptionPet } from "@/types/models";
import { useApply } from "./api";

const schema = z
  .object({
    homeType: z.enum(["house", "apartment"]),
    hasYard: z.boolean(),
    hasChildren: z.boolean(),
    hasOtherPets: z.boolean(),
    otherPetsDetails: z.string().trim().max(1000),
    experience: z.string().trim().max(2000),
    reason: z.string().trim().min(20, "Tell us a bit more (at least 20 characters)").max(3000),
  })
  .refine((v) => !v.hasOtherPets || v.otherPetsDetails.length > 0, { path: ["otherPetsDetails"], message: "Tell us about your other pets" });

const HOME_OPTIONS = [
  { value: "house", label: "House", hint: "Detached / with own entrance" },
  { value: "apartment", label: "Apartment", hint: "Flat in a building" },
];

/** Adoption application (questions mirror the backend ApplicationValidation.create). */
export function ApplyModal({ pet, open, onOpenChange }: { pet: AdoptionPet; open: boolean; onOpenChange: (o: boolean) => void }) {
  const [submitted, setSubmitted] = useState<AdoptionApplication | null>(null);
  const apply = useApply();
  const form = useZodForm(schema, {
    defaultValues: { homeType: "apartment", hasYard: false, hasChildren: false, hasOtherPets: false, otherPetsDetails: "", experience: "", reason: "" },
  });

  return (
    <Modal open={open} onOpenChange={onOpenChange} size="lg" title={submitted ? "Application sent 🐾" : `Apply to adopt ${pet.name}`} description={submitted ? undefined : "Takes about 3 minutes. We reply within 2–3 working days."}>
      {submitted ? (
        <div className="space-y-5 py-4 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Application number</p>
            <p className="font-mono text-xl font-bold">{submitted.applicationNo}</p>
          </div>
          <p className="text-sm text-muted-foreground">We&apos;ll email you when our team reviews it. You can follow every step in your dashboard.</p>
          <Button asChild>
            <Link href="/dashboard?tab=adoptions">Track my application</Link>
          </Button>
        </div>
      ) : (
        <AppForm
          form={form}
          className="space-y-5"
          onSubmit={async (v) => {
            const res = await apply.mutateAsync({
              adoptionPetId: pet.id,
              ...v,
              otherPetsDetails: v.hasOtherPets ? v.otherPetsDetails : undefined,
              experience: v.experience || undefined,
            });
            setSubmitted(res.data);
          }}
        >
          <SegmentedField name="homeType" label="Where do you live?" options={HOME_OPTIONS} />
          <div className="grid gap-3 sm:grid-cols-3">
            <SwitchField name="hasYard" label="Yard / garden" />
            <SwitchField name="hasChildren" label="Children at home" />
            <SwitchField name="hasOtherPets" label="Other pets" />
          </div>
          <OtherPets />
          <TextareaField name="experience" label="Experience with pets" rows={3} placeholder="Pets you've had, how long, anything relevant" />
          <TextareaField name="reason" label={`Why ${pet.name}?`} rows={4} required placeholder="Your routine, who will care for them, why you'd be a great match…" />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <SubmitButton pendingText="Sending…">Send application</SubmitButton>
          </div>
        </AppForm>
      )}
    </Modal>
  );
}

function OtherPets() {
  const has = useWatch({ name: "hasOtherPets" });
  return has ? <TextareaField name="otherPetsDetails" label="Tell us about your other pets" rows={2} required placeholder="e.g. 1 cat, 3 years, friendly with dogs" /> : null;
}
