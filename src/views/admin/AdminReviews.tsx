"use client";

import { useState } from "react";
import { Star, Check, X, Trash2, Eye, EyeOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Review {
  id: string;
  name: string;
  pet: string;
  rating: number;
  text: string;
  date: string;
  status: "Approved" | "Pending" | "Hidden";
  featured: boolean;
}

const initialReviews: Review[] = [
  { id: "r1", name: "Sarah J.", pet: "Buddy", rating: 5, text: "Amazing grooming service! Buddy looks fantastic.", date: "Mar 7, 2026", status: "Approved", featured: true },
  { id: "r2", name: "Mike C.", pet: "Whiskers", rating: 5, text: "Best pet spa in town. Highly recommend!", date: "Mar 6, 2026", status: "Approved", featured: false },
  { id: "r3", name: "Emily D.", pet: "Max", rating: 4, text: "Great dog walking service, Max loved it.", date: "Mar 5, 2026", status: "Pending", featured: false },
  { id: "r4", name: "Tom W.", pet: "Bella", rating: 3, text: "Good service but had to wait a bit.", date: "Mar 4, 2026", status: "Pending", featured: false },
  { id: "r5", name: "Anna L.", pet: "Charlie", rating: 2, text: "Could improve the scheduling system.", date: "Mar 3, 2026", status: "Hidden", featured: false },
];

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [tab, setTab] = useState("all");
  const { toast } = useToast();

  const approve = (id: string) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Approved" as const } : r)));
    toast({ title: "Review approved", description: "The review is now visible to customers." });
  };

  const hide = (id: string) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Hidden" as const } : r)));
    toast({ title: "Review hidden", description: "The review has been hidden from customers." });
  };

  const toggleFeatured = (id: string) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, featured: !r.featured } : r)));
    const review = reviews.find((r) => r.id === id);
    toast({ title: review?.featured ? "Unfeatured" : "Featured", description: `Review has been ${review?.featured ? "removed from" : "added to"} featured.` });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setReviews((prev) => prev.filter((r) => r.id !== deleteTarget));
    setDeleteTarget(null);
    toast({ title: "Review deleted", description: "The review has been permanently removed." });
  };

  const filtered = reviews.filter((r) => {
    if (tab === "pending") return r.status === "Pending";
    if (tab === "approved") return r.status === "Approved";
    if (tab === "hidden") return r.status === "Hidden";
    return true;
  });

  const pendingCount = reviews.filter((r) => r.status === "Pending").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Reviews</h1>
        <p className="text-muted-foreground text-sm">Manage customer reviews and ratings</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All ({reviews.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="hidden">Hidden</TabsTrigger>
        </TabsList>

        {["all", "pending", "approved", "hidden"].map((t) => (
          <TabsContent key={t} value={t} className="space-y-4 mt-4">
            {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No reviews in this category</p>}
            {filtered.map((r) => (
              <Card key={r.id} className="border-border">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {r.name[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-card-foreground">{r.name} — {r.pet}</p>
                            {r.featured && <span className="px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary font-medium">Featured</span>}
                          </div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, j) => (
                              <Star key={j} className={`w-3 h-3 ${j < r.rating ? "fill-primary text-primary" : "text-muted"}`} />
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
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-success" onClick={() => approve(r.id)} title="Approve"><Check className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => hide(r.id)} title="Hide"><EyeOff className="w-4 h-4" /></Button>
                        </>
                      )}
                      {r.status === "Approved" && (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleFeatured(r.id)} title={r.featured ? "Unfeature" : "Feature"}>
                            <Star className={`w-4 h-4 ${r.featured ? "fill-primary text-primary" : ""}`} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => hide(r.id)} title="Hide"><EyeOff className="w-4 h-4" /></Button>
                        </>
                      )}
                      {r.status === "Hidden" && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-success" onClick={() => approve(r.id)} title="Restore"><Eye className="w-4 h-4" /></Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(r.id)} title="Delete"><Trash2 className="w-4 h-4" /></Button>
                      <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        r.status === "Approved" ? "bg-success/10 text-success" :
                        r.status === "Pending" ? "bg-warning/10 text-warning-foreground" :
                        "bg-muted text-muted-foreground"
                      }`}>{r.status}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
            <DialogDescription>Are you sure? This permanently removes the review.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
