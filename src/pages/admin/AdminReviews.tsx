import { Star, Check, X, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const reviews = [
  { name: "Sarah J.", pet: "Buddy", rating: 5, text: "Amazing grooming service! Buddy looks fantastic.", date: "Mar 7, 2026", status: "Approved" },
  { name: "Mike C.", pet: "Whiskers", rating: 5, text: "Best pet spa in town. Highly recommend!", date: "Mar 6, 2026", status: "Approved" },
  { name: "Emily D.", pet: "Max", rating: 4, text: "Great dog walking service, Max loved it.", date: "Mar 5, 2026", status: "Pending" },
  { name: "Tom W.", pet: "Bella", rating: 3, text: "Good service but had to wait a bit.", date: "Mar 4, 2026", status: "Pending" },
];

export default function AdminReviews() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Reviews</h1>
        <p className="text-muted-foreground text-sm">Manage customer reviews and ratings</p>
      </div>

      <div className="space-y-4">
        {reviews.map((r, i) => (
          <Card key={i} className="border-border">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {r.name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{r.name} — {r.pet}</p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: r.rating }).map((_, j) => (
                          <Star key={j} className="w-3 h-3 fill-primary text-primary" />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">{r.date}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 ml-11">"{r.text}"</p>
                </div>
                <div className="flex items-center gap-1">
                  {r.status === "Pending" && (
                    <>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-success"><Check className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><X className="w-4 h-4" /></Button>
                    </>
                  )}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.status === "Approved" ? "bg-success/10 text-success" : "bg-warning/10 text-warning-foreground"}`}>
                    {r.status}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
