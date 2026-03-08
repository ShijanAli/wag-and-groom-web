import { Plus, Scissors, Dog, Heart, Shield, Sparkles, Edit, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const services = [
  { icon: Scissors, name: "Dog Grooming", price: "$40", duration: "60 min", status: "Active", bookings: 142 },
  { icon: Dog, name: "Dog Walking", price: "$20", duration: "30 min", status: "Active", bookings: 98 },
  { icon: Heart, name: "Pet Sitting", price: "$35", duration: "Full Day", status: "Active", bookings: 56 },
  { icon: Shield, name: "Pet Daycare", price: "$30", duration: "Full Day", status: "Active", bookings: 74 },
  { icon: Sparkles, name: "Pet Spa Treatment", price: "$60", duration: "90 min", status: "Active", bookings: 38 },
];

export default function AdminServices() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Services</h1>
          <p className="text-muted-foreground text-sm">Manage your service catalog and pricing</p>
        </div>
        <Button className="gap-2"><Plus className="w-4 h-4" /> Add Service</Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s) => (
          <Card key={s.name} className="border-border hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                  <s.icon className="w-5 h-5 text-accent-foreground" />
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="w-3 h-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="w-3 h-3" /></Button>
                </div>
              </div>
              <h3 className="font-display font-semibold text-card-foreground mt-3">{s.name}</h3>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="font-bold text-primary text-lg">{s.price}</span>
                <span>·</span>
                <span>{s.duration}</span>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
                <span>{s.bookings} bookings</span>
                <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium">{s.status}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
