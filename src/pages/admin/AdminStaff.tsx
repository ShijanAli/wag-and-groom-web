import { Plus, UserCog, Mail, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const staff = [
  { name: "Jessica Martinez", role: "Senior Groomer", email: "jessica@happypaws.com", phone: "(555) 100-2000", appointments: 8, status: "Active" },
  { name: "David Park", role: "Dog Walker", email: "david@happypaws.com", phone: "(555) 200-3000", appointments: 5, status: "Active" },
  { name: "Lisa Thompson", role: "Pet Sitter", email: "lisa@happypaws.com", phone: "(555) 300-4000", appointments: 3, status: "Active" },
  { name: "Ryan Cooper", role: "Manager", email: "ryan@happypaws.com", phone: "(555) 400-5000", appointments: 0, status: "Active" },
];

export default function AdminStaff() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Staff</h1>
          <p className="text-muted-foreground text-sm">Manage team members and schedules</p>
        </div>
        <Button className="gap-2"><Plus className="w-4 h-4" /> Add Staff</Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {staff.map((s) => (
          <Card key={s.email} className="border-border">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {s.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-card-foreground">{s.name}</h3>
                    <Badge variant="secondary">{s.role}</Badge>
                  </div>
                  <div className="flex flex-col gap-1 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{s.email}</span>
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{s.phone}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-xs">
                    <span className="text-muted-foreground">{s.appointments} appointments today</span>
                    <span className="px-2 py-0.5 rounded-full bg-success/10 text-success font-medium">{s.status}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
