import { cn } from "@/lib/utils";

/** Eyebrow + title + intro used at the top of every public page section. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  as: Tag = "h2",
  className,
  children,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "center" | "left";
  as?: "h1" | "h2";
  className?: string;
  /** Right-aligned action (e.g. "View all") when align="left" */
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("mb-12", align === "center" ? "mx-auto max-w-2xl text-center" : "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className={align === "left" ? "max-w-2xl" : undefined}>
        {eyebrow && <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</span>}
        <Tag className={cn("mt-3 font-display font-bold leading-tight", Tag === "h1" ? "text-4xl md:text-6xl" : "text-3xl md:text-5xl")}>{title}</Tag>
        {description && <p className="mt-4 text-lg text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}
