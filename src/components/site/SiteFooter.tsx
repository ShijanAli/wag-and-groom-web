import Link from "next/link";
import { Heart, PawPrint } from "lucide-react";

const columns: { title: string; links: [string, string][] }[] = [
  { title: "Services", links: [["Dog Grooming", "/services#dog-grooming"], ["Dog Walking", "/services#dog-walking"], ["Pet Sitting", "/services#pet-sitting"], ["Pet Spa", "/services#pet-spa"]] },
  { title: "Company", links: [["About", "/#about"], ["Gallery", "/#gallery"], ["Reviews", "/#testimonials"], ["FAQ", "/#faq"]] },
  { title: "Account", links: [["Sign in", "/login"], ["Create account", "/register"], ["Contact", "/#contact"]] },
];

export function SiteFooter() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="grid md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center"><PawPrint className="w-5 h-5 text-primary-foreground" /></span>
              <span className="font-display text-xl font-bold">HappyPaws</span>
            </div>
            <p className="text-background/60 text-sm max-w-xs leading-relaxed">Professional grooming, spa, walking and sitting for dogs and cats in San Francisco.</p>
          </div>
          {columns.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <h3 className="font-semibold mb-4">{c.title}</h3>
              <ul className="space-y-2.5 text-sm text-background/60">
                {c.links.map(([label, href]) => (
                  <li key={label}><Link href={href} className="hover:text-primary transition-colors">{label}</Link></li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 pt-6 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-background/50">
          <p>© {new Date().getFullYear()} HappyPaws. All rights reserved.</p>
          <p className="flex items-center gap-1.5">Made with <Heart className="w-3.5 h-3.5 fill-primary text-primary" /> for pets everywhere</p>
        </div>
      </div>
    </footer>
  );
}
