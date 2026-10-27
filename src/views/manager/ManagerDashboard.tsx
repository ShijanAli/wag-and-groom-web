"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, Users, DollarSign, TrendingUp, UserCog, Star, LogOut, Dog, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useAppState } from "@/context/AppContext";

const stats = [
  { label: "Today's Bookings", value: 12, icon: CalendarDays, change: "+8%" },
  { label: "Active Staff", value: 9, icon: UserCog, change: "+1" },
  { label: "Revenue (Week)", value: "$4,820", icon: DollarSign, change: "+12%" },
  { label: "Avg. Rating", value: "4.9", icon: Star, change: "+0.1" },
];

export default function ManagerDashboard() {
  const { user, logout } = useAuth();
  const { bookings } = useAppState();
  const router = useRouter();

  const handleLogout = () => { logout(); router.replace("/login"); };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Dog className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">HappyPaws</span>
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-medium">Manager</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.name}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Manager overview</h1>
          <p className="text-muted-foreground">Operations, staff, and revenue at a glance.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label}>
                <CardContent className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-emerald-600 font-medium flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" /> {s.change}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Recent bookings</CardTitle>
              <Link href="/admin/bookings"><Button variant="ghost" size="sm">View all <ArrowUpRight className="w-3 h-3 ml-1" /></Button></Link>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {bookings.slice(0, 5).map((b) => (
                  <div key={b.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{b.petName} — {b.service}</p>
                      <p className="text-xs text-muted-foreground">{b.date} at {b.time}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      b.status === "Confirmed" ? "bg-emerald-100 text-emerald-700" :
                      b.status === "Pending" ? "bg-amber-100 text-amber-700" :
                      b.status === "Completed" ? "bg-blue-100 text-blue-700" :
                      "bg-rose-100 text-rose-700"
                    }`}>{b.status}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Quick actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/staff" className="block"><Button variant="outline" className="w-full justify-start"><UserCog className="w-4 h-4 mr-2" /> Manage staff</Button></Link>
              <Link href="/admin/bookings" className="block"><Button variant="outline" className="w-full justify-start"><CalendarDays className="w-4 h-4 mr-2" /> All bookings</Button></Link>
              <Link href="/admin/customers" className="block"><Button variant="outline" className="w-full justify-start"><Users className="w-4 h-4 mr-2" /> Customers</Button></Link>
              <Link href="/admin/reviews" className="block"><Button variant="outline" className="w-full justify-start"><Star className="w-4 h-4 mr-2" /> Reviews</Button></Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
