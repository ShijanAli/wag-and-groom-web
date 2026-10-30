"use client";

import { z } from "zod";
import { DateField } from "@/components/common/form/choice-fields";
import { FieldRow, SelectField, SwitchField, TextareaField, TextField, type Option } from "@/components/common/form/fields";
import { ImageUploadField } from "@/components/common/ImageUpload";
import type { Pet } from "@/types/models";
import { GENDER_OPTIONS, SIZE_OPTIONS, type PetInput } from "./api";

const NONE = "";

export const petSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  petTypeId: z.number({ required_error: "Choose a type", invalid_type_error: "Choose a type" }).int().positive("Choose a type"),
  breed: z.string().trim().max(100),
  gender: z.enum(["male", "female", NONE]),
  size: z.enum(["small", "medium", "large", NONE]),
  dateOfBirth: z.string(),
  weightKg: z.number().positive("Must be more than 0").max(500).optional(),
  isVaccinated: z.boolean(),
  photo: z.string().url().nullable(),
  notes: z.string().trim().max(2000),
});
export type PetForm = z.output<typeof petSchema>;

export const toPetForm = (p?: Pet | null, defaults?: Partial<PetForm>): z.input<typeof petSchema> => ({
  name: p?.name ?? "",
  petTypeId: p?.petTypeId ?? (undefined as unknown as number),
  breed: p?.breed ?? "",
  gender: p?.gender ?? NONE,
  size: p?.size ?? NONE,
  dateOfBirth: p?.dateOfBirth?.slice(0, 10) ?? "",
  weightKg: p?.weightKg ? Number(p.weightKg) : undefined,
  isVaccinated: p?.isVaccinated ?? false,
  photo: p?.photo ?? null,
  notes: p?.notes ?? "",
  ...defaults,
});

/** Empty optional fields → null so they are really cleared in the database. */
export const toPetInput = (v: PetForm): PetInput => ({
  ...v,
  breed: v.breed || null,
  gender: v.gender || null,
  size: v.size || null,
  dateOfBirth: v.dateOfBirth || null,
  weightKg: v.weightKg ?? null,
  notes: v.notes || null,
});

/**
 * Pet form fields shared by the dashboard pet modal and the quick "add pet" step of booking.
 * `compact` hides the optional details for the in-booking quick add.
 */
export function PetFields({ typeOptions, compact = false }: { typeOptions: Option<number>[]; compact?: boolean }) {
  return (
    <>
      <FieldRow>
        <TextField name="name" label="Pet name" placeholder="e.g. Buddy" required autoFocus />
        <SelectField name="petTypeId" label="Type" options={typeOptions} numeric required placeholder="Dog, cat…" />
      </FieldRow>
      <FieldRow>
        <TextField name="breed" label="Breed" placeholder="e.g. Golden Retriever" />
        <SelectField name="size" label="Size" options={SIZE_OPTIONS} placeholder="Select size" />
      </FieldRow>
      <SwitchField name="isVaccinated" label="Vaccinated" description="Up-to-date core vaccines (required for some services)." />
      {!compact && (
        <>
          <FieldRow cols={3}>
            <SelectField name="gender" label="Gender" options={GENDER_OPTIONS} placeholder="Select" />
            <DateField name="dateOfBirth" label="Date of birth" placeholder="Pick date" toDate={new Date()} yearPicker />
            <TextField name="weightKg" label="Weight (kg)" type="number" min={0} step="0.1" />
          </FieldRow>
          <ImageUploadField name="photo" label="Photo" folder="pets" aspect="square" />
          <TextareaField name="notes" label="Notes for our team" rows={3} placeholder="Allergies, temperament, medication…" />
        </>
      )}
    </>
  );
}
