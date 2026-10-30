"use client";

import Link from "next/link";
import { Dog } from "lucide-react";

interface Props {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: Props) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-primary to-primary/70 text-primary-foreground relative overflow-hidden">
        <Link href="/" className="flex items-center gap-2 relative z-10">
          <div className="w-10 h-10 rounded-full bg-primary-foreground/20 backdrop-blur flex items-center justify-center">
            <Dog className="w-5 h-5" />
          </div>
          <span className="font-display text-2xl font-bold">HappyPaws</span>
        </Link>
        <div className="relative z-10 space-y-3 max-w-md">
          <h2 className="font-display text-4xl font-bold leading-tight">Care your pets deserve, scheduled in seconds.</h2>
          <p className="text-primary-foreground/80">
            Manage bookings, pets, staff and operations — all from one beautiful dashboard tailored to your role.
          </p>
        </div>
        <div className="text-xs text-primary-foreground/60 relative z-10">© {new Date().getFullYear()} HappyPaws. All rights reserved.</div>
        {/* decorative blobs */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-primary-foreground/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-primary-foreground/10 blur-3xl" />
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-6">
          <Link href="/" className="lg:hidden flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
              <Dog className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">HappyPaws</span>
          </Link>
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold text-foreground">{title}</h1>
            {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
          </div>
          {children}
          {footer && <div className="text-center text-sm text-muted-foreground">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
