import { useState } from "react";
import { Plus, Tag, Calendar, Edit, Trash2, Power, PowerOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Promo {
  id: string;
  code: string;
  discount: string;
  desc: string;
  expires: string;
  uses: number;
  status: "Active" | "Inactive" | "Expiring Soon";
}

const initialPromos: Promo[] = [
  { id: "pr1", code: "SPRING10", discount: "10% OFF", desc: "Spring grooming special", expires: "2026-04-30", uses: 45, status: "Active" },
  { id: "pr2", code: "NEWPET20", discount: "20% OFF", desc: "New customer first booking", expires: "2026-12-31", uses: 128, status: "Active" },
  { id: "pr3", code: "SPADAY15", discount: "15% OFF", desc: "Premium spa treatment", expires: "2026-03-31", uses: 22, status: "Expiring Soon" },
];

let nextId = 4;

export default function AdminPromotions() {
  const [promos, setPromos] = useState<Promo[]>(initialPromos);
  const [showAdd, setShowAdd] = useState(false);
  const [editPromo, setEditPromo] = useState<Promo | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { toast } = useToast();

  const [form, setForm] = useState({ code: "", discount: "", desc: "", expires: "" });

  const handleAdd = () => {
    if (!form.code || !form.discount || !form.expires) {
      toast({ title: "Missing fields", description: "Code, discount, and expiry are required.", variant: "destructive" });
      return;
    }
    setPromos((prev) => [...prev, { id: `pr${nextId++}`, ...form, uses: 0, status: "Active" }]);
    setShowAdd(false);
    setForm({ code: "", discount: "", desc: "", expires: "" });
    toast({ title: "Promo created", description: `${form.code} has been created.` });
  };

  const handleEdit = () => {
    if (!editPromo) return;
    setPromos((prev) => prev.map((p) => (p.id === editPromo.id ? editPromo : p)));
    setEditPromo(null);
    toast({ title: "Promo updated", description: `${editPromo.code} has been updated.` });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const promo = promos.find((p) => p.id === deleteTarget);
    setPromos((prev) => prev.filter((p) => p.id !== deleteTarget));
    setDeleteTarget(null);
    toast({ title: "Promo deleted", description: `${promo?.code} has been removed.` });
  };

  const toggleStatus = (id: string) => {
    setPromos((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      return { ...p, status: p.status === "Active" || p.status === "Expiring Soon" ? "Inactive" as const : "Active" as const };
    }));
  };

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
    catch { return d; }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Promotions</h1>
          <p className="text-muted-foreground text-sm">Manage promo codes and discounts</p>
        </div>
        <Button className="gap-2" onClick={() => { setForm({ code: "", discount: "", desc: "", expires: "" }); setShowAdd(true); }}><Plus className="w-4 h-4" /> Create Promo</Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {promos.map((p) => (
          <Card key={p.id} className={`border-border ${p.status === "Inactive" ? "opacity-60" : ""}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                    <Tag className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="font-mono font-bold text-card-foreground">{p.code}</p>
                    <p className="text-primary font-bold text-lg">{p.discount}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditPromo({ ...p })}><Edit className="w-3 h-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleStatus(p.id)} title={p.status === "Inactive" ? "Activate" : "Deactivate"}>
                    {p.status === "Inactive" ? <Power className="w-3 h-3 text-success" /> : <PowerOff className="w-3 h-3 text-muted-foreground" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(p.id)}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3">{p.desc}</p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Expires {formatDate(p.expires)}</span>
                <span>{p.uses} uses</span>
              </div>
              <div className="mt-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  p.status === "Active" ? "bg-success/10 text-success" :
                  p.status === "Expiring Soon" ? "bg-warning/10 text-warning-foreground" :
                  "bg-muted text-muted-foreground"
                }`}>{p.status}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Promo */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Promotion</DialogTitle>
            <DialogDescription>Create a new promo code.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Code *</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SPRING10" /></div>
              <div><Label>Discount *</Label><Input value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} placeholder="10% OFF" /></div>
            </div>
            <div><Label>Description</Label><Input value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="Spring grooming special" /></div>
            <div><Label>Expiry Date *</Label><Input type="date" value={form.expires} onChange={(e) => setForm({ ...form, expires: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Promo */}
      <Dialog open={!!editPromo} onOpenChange={(o) => !o && setEditPromo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Promotion</DialogTitle>
            <DialogDescription>Update promo code details.</DialogDescription>
          </DialogHeader>
          {editPromo && (
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Code</Label><Input value={editPromo.code} onChange={(e) => setEditPromo({ ...editPromo, code: e.target.value.toUpperCase() })} /></div>
                <div><Label>Discount</Label><Input value={editPromo.discount} onChange={(e) => setEditPromo({ ...editPromo, discount: e.target.value })} /></div>
              </div>
              <div><Label>Description</Label><Input value={editPromo.desc} onChange={(e) => setEditPromo({ ...editPromo, desc: e.target.value })} /></div>
              <div><Label>Expiry Date</Label><Input type="date" value={editPromo.expires} onChange={(e) => setEditPromo({ ...editPromo, expires: e.target.value })} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPromo(null)}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Promotion</DialogTitle>
            <DialogDescription>Are you sure? This will remove the promo code.</DialogDescription>
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
