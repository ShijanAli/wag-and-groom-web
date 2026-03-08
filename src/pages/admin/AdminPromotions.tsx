import { Plus, Tag, Percent, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const promos = [
  { code: "SPRING10", discount: "10% OFF", desc: "Spring grooming special", expires: "Apr 30, 2026", uses: 45, status: "Active" },
  { code: "NEWPET20", discount: "20% OFF", desc: "New customer first booking", expires: "Dec 31, 2026", uses: 128, status: "Active" },
  { code: "SPADAY15", discount: "15% OFF", desc: "Premium spa treatment", expires: "Mar 31, 2026", uses: 22, status: "Expiring Soon" },
];

export default function AdminPromotions() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Promotions</h1>
          <p className="text-muted-foreground text-sm">Manage promo codes and discounts</p>
        </div>
        <Button className="gap-2"><Plus className="w-4 h-4" /> Create Promo</Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {promos.map((p) => (
          <Card key={p.code} className="border-border">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                  <Tag className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-mono font-bold text-card-foreground">{p.code}</p>
                  <p className="text-primary font-bold text-lg">{p.discount}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{p.desc}</p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Expires {p.expires}</span>
                <span>{p.uses} uses</span>
              </div>
              <div className="mt-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  p.status === "Active" ? "bg-success/10 text-success" : "bg-warning/10 text-warning-foreground"
                }`}>{p.status}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
