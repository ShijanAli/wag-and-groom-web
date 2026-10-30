"use client";

import { useState } from "react";
import { Plus, Scissors, Dog, Heart, Shield, Sparkles, Edit, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface Service {
  id: string;
  icon: string;
  name: string;
  price: string;
  duration: string;
  status: "Active" | "Inactive";
  bookings: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Scissors, Dog, Heart, Shield, Sparkles,
};

const initialServices: Service[] = [
  { id: "s1", icon: "Scissors", name: "Dog Grooming", price: "$40", duration: "60 min", status: "Active", bookings: 142 },
  { id: "s2", icon: "Dog", name: "Dog Walking", price: "$20", duration: "30 min", status: "Active", bookings: 98 },
  { id: "s3", icon: "Heart", name: "Pet Sitting", price: "$35", duration: "Full Day", status: "Active", bookings: 56 },
  { id: "s4", icon: "Shield", name: "Pet Daycare", price: "$30", duration: "Full Day", status: "Active", bookings: 74 },
  { id: "s5", icon: "Sparkles", name: "Pet Spa Treatment", price: "$60", duration: "90 min", status: "Active", bookings: 38 },
];

let nextId = 6;

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [showAdd, setShowAdd] = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { toast } = useToast();

  const [form, setForm] = useState({ name: "", price: "", duration: "", icon: "Scissors" });

  const resetForm = () => setForm({ name: "", price: "", duration: "", icon: "Scissors" });

  const handleAdd = () => {
    if (!form.name || !form.price || !form.duration) {
      toast({ title: "Missing fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    setServices((prev) => [...prev, { id: `s${nextId++}`, ...form, status: "Active", bookings: 0 }]);
    setShowAdd(false);
    resetForm();
    toast({ title: "Service added", description: `${form.name} has been added to your catalog.` });
  };

  const handleEdit = () => {
    if (!editService) return;
    setServices((prev) => prev.map((s) => (s.id === editService.id ? editService : s)));
    setEditService(null);
    toast({ title: "Service updated", description: `${editService.name} has been updated.` });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const svc = services.find((s) => s.id === deleteTarget);
    setServices((prev) => prev.filter((s) => s.id !== deleteTarget));
    setDeleteTarget(null);
    toast({ title: "Service deleted", description: `${svc?.name} has been removed.` });
  };

  const toggleStatus = (id: string) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, status: s.status === "Active" ? "Inactive" as const : "Active" as const } : s)));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Services</h1>
          <p className="text-muted-foreground text-sm">Manage your service catalog and pricing</p>
        </div>
        <Button className="gap-2" onClick={() => { resetForm(); setShowAdd(true); }}><Plus className="w-4 h-4" /> Add Service</Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s) => {
          const Icon = iconMap[s.icon] || Scissors;
          return (
            <Card key={s.id} className={`border-border hover:shadow-md transition-shadow ${s.status === "Inactive" ? "opacity-60" : ""}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                    <Icon className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditService({ ...s })}><Edit className="w-3 h-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(s.id)}><Trash2 className="w-3 h-3" /></Button>
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
                  <div className="flex items-center gap-2">
                    <Switch checked={s.status === "Active"} onCheckedChange={() => toggleStatus(s.id)} />
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.status === "Active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>{s.status}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Service Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
            <DialogDescription>Create a new service for your catalog.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div><Label>Service Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Dog Grooming" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Price *</Label><Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="$40" /></div>
              <div><Label>Duration *</Label><Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="60 min" /></div>
            </div>
            <div><Label>Icon</Label>
              <Select value={form.icon} onValueChange={(v) => setForm({ ...form, icon: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(iconMap).map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Service</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Service Dialog */}
      <Dialog open={!!editService} onOpenChange={(o) => !o && setEditService(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>Update service details and pricing.</DialogDescription>
          </DialogHeader>
          {editService && (
            <div className="grid gap-4 py-2">
              <div><Label>Service Name</Label><Input value={editService.name} onChange={(e) => setEditService({ ...editService, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Price</Label><Input value={editService.price} onChange={(e) => setEditService({ ...editService, price: e.target.value })} /></div>
                <div><Label>Duration</Label><Input value={editService.duration} onChange={(e) => setEditService({ ...editService, duration: e.target.value })} /></div>
              </div>
              <div><Label>Icon</Label>
                <Select value={editService.icon} onValueChange={(v) => setEditService({ ...editService, icon: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(iconMap).map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditService(null)}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>Are you sure? This will remove the service from your catalog.</DialogDescription>
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
