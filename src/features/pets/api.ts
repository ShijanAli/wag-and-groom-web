"use client";

import type { Option } from "@/components/common/form/fields";
import { createResourceHooks } from "@/lib/api/hooks";
import { createResource } from "@/lib/api/request";
import type { Pet, PetGender, PetSize } from "@/types/models";

export interface PetInput {
  petTypeId: number;
  name: string;
  breed?: string | null;
  gender?: PetGender | null;
  size?: PetSize | null;
  dateOfBirth?: string | null;
  weightKg?: number | null;
  isVaccinated?: boolean;
  photo?: string | null;
  notes?: string | null;
}

/** The signed-in customer's pets. */
export const myPetsApi = createResource<Pet, PetInput>("/me/pets");
export const myPetHooks = createResourceHooks("my-pets", myPetsApi);

export const GENDER_OPTIONS: Option<PetGender>[] = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
];

export const SIZE_OPTIONS: Option<PetSize>[] = [
  { label: "Small", value: "small" },
  { label: "Medium", value: "medium" },
  { label: "Large", value: "large" },
];

/** "2 yrs" / "7 mos" from a date of birth */
export function petAge(dateOfBirth: string | null): string | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  const months = (new Date().getFullYear() - dob.getFullYear()) * 12 + new Date().getMonth() - dob.getMonth();
  if (months < 1) return "< 1 mo";
  return months < 12 ? `${months} mo${months === 1 ? "" : "s"}` : `${Math.floor(months / 12)} yr${months < 24 ? "" : "s"}`;
}
