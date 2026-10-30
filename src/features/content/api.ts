"use client";

import { createResourceHooks, useApiMutation } from "@/lib/api/hooks";
import { http } from "@/lib/api/client";
import { api, cleanParams, createResource } from "@/lib/api/request";
import type { Id, ListParams } from "@/lib/api/types";
import type { ActiveStatus, ContactMessage, ContactStatus, Faq, NewsletterSubscriber, Testimonial } from "@/types/models";

/* ───── FAQs ───── */
export interface FaqInput {
  question: string;
  answer: string;
  category?: string | null;
  sortOrder?: number;
  status: ActiveStatus;
}
export const faqHooks = createResourceHooks("faqs", createResource<Faq, FaqInput>("/faqs"));

/** Suggested FAQ groups (free text on the backend, these keep it consistent). */
export const FAQ_CATEGORY_OPTIONS = ["general", "booking", "payment", "adoption", "grooming"].map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) }));

/* ───── Testimonials ───── */
export interface TestimonialInput {
  name: string;
  content: string;
  image?: string | null;
  rating: number;
  isFeatured: boolean;
  status: ActiveStatus;
}
export const testimonialHooks = createResourceHooks("testimonials", createResource<Testimonial, TestimonialInput>("/testimonials"));

/* ───── Contact inbox ───── */
export interface ContactInput {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}
const contactResource = createResource<ContactMessage, ContactInput, { status: ContactStatus }>("/contact");
export const contactHooks = createResourceHooks("contact", contactResource);

export const useSetContactStatus = () =>
  useApiMutation(({ id, status }: { id: Id; status: ContactStatus }) => api.patch<ContactMessage>(`/contact/${id}/status`, { status }), {
    invalidate: [contactHooks.keys.all],
    successMessage: false,
  });

export const CONTACT_STATUS_OPTIONS: { label: string; value: ContactStatus }[] = [
  { label: "New", value: "new" },
  { label: "Read", value: "read" },
  { label: "Replied", value: "replied" },
];

/* ───── Newsletter ───── */
export const subscriberHooks = createResourceHooks("newsletter", createResource<NewsletterSubscriber, never, never>("/newsletter/subscribers"));

export const useSubscribe = () => useApiMutation((email: string) => api.post("/newsletter/subscribe", { email }), { successMessage: "You're subscribed — check your inbox 🐾" });

export const useUnsubscribe = () =>
  useApiMutation((body: { email: string; token: string }) => api.post("/newsletter/unsubscribe", body), { successMessage: false, errorToast: false });

/** Authenticated CSV download (the browser can't attach the bearer token to a plain link). */
export async function downloadSubscribersCsv(params?: ListParams) {
  const res = await http.get<Blob>("/newsletter/subscribers/export", { params: cleanParams(params), responseType: "blob" });
  const url = URL.createObjectURL(res.data);
  const a = Object.assign(document.createElement("a"), { href: url, download: `subscribers-${new Date().toISOString().slice(0, 10)}.csv` });
  a.click();
  URL.revokeObjectURL(url);
}

export const SUBSCRIPTION_STATUS_OPTIONS = [
  { label: "Subscribed", value: "subscribed" },
  { label: "Unsubscribed", value: "unsubscribed" },
];
