import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Faq } from "@/types/models";

/** CMS FAQs as the site's card-style accordion (first one open). */
export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  if (!faqs.length) return null;
  return (
    <Accordion type="single" collapsible defaultValue={`faq-${faqs[0].id}`} className="space-y-3">
      {faqs.map((f) => (
        <AccordionItem key={f.id} value={`faq-${f.id}`} className="rounded-2xl border border-border bg-card px-6 transition-all data-[state=open]:border-primary/40 data-[state=open]:shadow-lg">
          <AccordionTrigger className="py-5 text-left font-semibold hover:no-underline">{f.question}</AccordionTrigger>
          <AccordionContent className="whitespace-pre-line leading-relaxed text-muted-foreground">{f.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

/** schema.org FAQPage node for JSON-LD (null when there are none). */
export const faqJsonLd = (faqs: Faq[]) =>
  faqs.length ? { "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) } : null;
