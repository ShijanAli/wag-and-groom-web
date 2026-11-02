import { DEFAULT_OPENING_HOURS, groupHours } from "@/lib/hours";
import type { OpeningDay, PublicSettings } from "@/types/models";

export const SITE = {
  name: "PetPlex",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.petplex.com",
  tagline: "Professional Pet Grooming, Walking, Sitting & Spa",
  description:
    "PetPlex is a pet care and adoption studio: professional grooming, spa, walking, sitting and daycare for dogs and cats, plus rescue pets looking for a home. Book online in a minute.",
  /** Fallbacks only — the live values come from the admin's settings (contact_* keys). */
  phone: "+880 1000-000000",
  email: "hello@petplex.com",
  address: "Dhaka, Bangladesh",
  country: "BD",
};

export interface ContactInfo {
  phone: string;
  /** For tel: links — digits and a leading + only */
  phoneHref: string;
  email: string;
  address: string;
  mapsUrl: string;
  /** grouped for display, e.g. [{ label: "Sat–Thu", value: "8 AM – 7 PM" }, { label: "Fri", value: "Closed" }] */
  hours: { label: string; value: string }[];
  /** raw week (settings or default) for "open now" and JSON-LD */
  week: OpeningDay[];
  socials: { name: string; url: string }[];
}

const SOCIAL_ORDER = ["facebook", "instagram", "youtube", "tiktok", "twitter", "x", "linkedin", "whatsapp"];

/** Business contact details from public settings, falling back to SITE. Pure → usable on the server and the client. */
export function contactInfo(settings?: Pick<PublicSettings, "contact_phone" | "contact_email" | "contact_address" | "social_links" | "opening_hours"> | null): ContactInfo {
  const phone = settings?.contact_phone || SITE.phone;
  const address = settings?.contact_address || SITE.address;
  return {
    phone,
    phoneHref: phone.replace(/[^\d+]/g, ""),
    email: settings?.contact_email || SITE.email,
    address,
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
    hours: groupHours(settings?.opening_hours),
    week: settings?.opening_hours?.length === 7 ? settings.opening_hours : DEFAULT_OPENING_HOURS,
    socials: Object.entries(settings?.social_links ?? {})
      .filter(([, url]) => /^https?:\/\//.test(url))
      .sort(([a], [b]) => (SOCIAL_ORDER.indexOf(a) + 1 || 99) - (SOCIAL_ORDER.indexOf(b) + 1 || 99))
      .map(([name, url]) => ({ name: name[0].toUpperCase() + name.slice(1), url })),
  };
}
