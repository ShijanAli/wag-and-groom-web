import { CalendarCheck, HeartHandshake, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { SITE } from "@/lib/site";

interface Props {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const HIGHLIGHTS = [
  { icon: CalendarCheck, text: "Book grooming, walking & spa in under a minute" },
  { icon: HeartHandshake, text: "Adopt a pet and follow every step of the process" },
  { icon: ShieldCheck, text: "Easy online booking" },
];

export function AuthLayout({ title, subtitle, children, footer }: Props) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary to-primary/70 p-10 text-primary-foreground lg:flex">
        <Logo variant="light" className="relative z-10" />
        <div className="relative z-10 max-w-md space-y-6">
          <h2 className="font-display text-4xl font-bold leading-tight">Care your pets deserve, scheduled in seconds.</h2>
          <ul className="space-y-3">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-primary-foreground/90">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground/15">
                  <Icon className="h-4 w-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative z-10 text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} {SITE.name}. All rights reserved.
        </p>
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary-foreground/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-primary-foreground/10 blur-3xl" />
      </aside>

      <main className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-6">
          <Logo className="mb-4 lg:hidden" />
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold text-foreground">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {children}
          {footer && <div className="text-center text-sm text-muted-foreground">{footer}</div>}
        </div>
      </main>
    </div>
  );
}

/** Success / error screen used by verify-email, forgot / reset password and post-register. */
export function AuthResult({
  icon,
  tone = "primary",
  title,
  children,
  actions,
}: {
  icon: React.ReactNode;
  tone?: "primary" | "success" | "danger";
  title: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const toneCls = { primary: "bg-primary/10 text-primary", success: "bg-success/15 text-success", danger: "bg-destructive/10 text-destructive" }[tone];
  return (
    <div className="space-y-5 rounded-2xl border bg-card p-6 text-center shadow-sm">
      <span className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${toneCls}`}>{icon}</span>
      <div className="space-y-2">
        <h2 className="font-display text-xl font-bold">{title}</h2>
        {children && <div className="text-sm text-muted-foreground">{children}</div>}
      </div>
      {actions && <div className="flex flex-col gap-2">{actions}</div>}
    </div>
  );
}
