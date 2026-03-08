import { useState } from "react";
import { Plus, Mail, Phone, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  appointments: number;
  status: "Active" | "Inactive";
}

const roles = ["Senior Groomer", "Groomer", "Dog Walker", "Pet Sitter", "Manager", "Receptionist"];

const initialStaff: StaffMember[] = [
  { id: "st1", name: "Jessica Martinez", role: "Senior Groomer", email: "jessica@happypaws.com", phone: "(555) 100-2000", appointments: 8, status: "Active" },
  { id: "st2", name: "David Park", role: "Dog Walker", email: "david@happypaws.com", phone: "(555) 200-3000", appointments: 5, status: "Active" },
  { id: "st3", name: "Lisa Thompson", role: "Pet Sitter", email: "lisa@happypaws.com", phone: "(555) 300-4000", appointments: 3, status: "Active" },
  { id: "st4", name: "Ryan Cooper", role: "Manager", email: "ryan@happypaws.com", phone: "(555) 400-5000", appointments: 0, status: "Active" },
];

let nextId = 5;

export default function AdminStaff() {
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
  const [showAdd, setShowAdd] = useState(false);
  const [editMember, setEditMember] = useState<StaffMember | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { toast } = useToast();

  const [form, setForm] = useState({ name: "", role: "Groomer", email: "", phone: "" });

  const handleAdd = () => {
    if (!form.name || !form.email) {
      toast({ title: "Missing fields", description: "Name and email are required.", variant: "destructive" });
      return;
    }
    setStaff((prev) => [...prev, { id: `st${nextId++}`, ...form, appointments: 0, status: "Active" }]);
    setShowAdd(false);
    setForm({ name: "", role: "Groomer", email: "", phone: "" });
    toast({ title: "Staff added", description: `${form.name} has been added to the team.` });
  };

  const handleEdit = () => {
    if (!editMember) return;
    setStaff((prev) => prev.map((s) => (s.id === editMember.id ? editMember : s)));
    setEditMember(null);
    toast({ title: "Staff updated", description: `${editMember.name} has been updated.` });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const member = staff.find((s) => s.id === deleteTarget);
    setStaff((prev) => prev.filter((s) => s.id !== deleteTarget));
    setDeleteTarget(null);
    toast({ title: "Staff removed", description: `${member?.name} has been removed.` });
  };

  const toggleStatus = (id: string) => {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, status: s.status === "Active" ? "Inactive" as const : "Active" as const } : s)));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Staff</h1>
          <p className="text-muted-foreground text-sm">Manage team members and schedules</p>
        </div>
        <Button className="gap-2" onClick={() => { setForm({ name: "", role: "Groomer", email: "", phone: "" }); setShowAdd(true); }}><Plus className="w-4 h-4" /> Add Staff</Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {staff.map((s) => (
          <Card key={s.id} className={`border-border ${s.status === "Inactive" ? "opacity-60" : ""}`}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {s.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-card-foreground">{s.name}</h3>
                      <Badge variant="secondary">{s.role}</Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditMember({ ...s })}><Edit className="w-3 h-3 mr-2" />Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget(s.id)}><Trash2 className="w-3 h-3 mr-2" />Remove</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex flex-col gap-1 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{s.email}</span>
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{s.phone}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-xs">
                    <span className="text-muted-foreground">{s.appointments} appointments today</span>
                    <div className="flex items-center gap-2">
                      <Switch checked={s.status === "Active"} onCheckedChange={() => toggleStatus(s.id)} />
                      <span className={`px-2 py-0.5 rounded-full font-medium ${s.status === "Active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>{s.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Staff */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
            <DialogDescription>Add a new team member.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{roles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Staff</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Staff */}
      <Dialog open={!!editMember} onOpenChange={(o) => !o && setEditMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>Update team member details.</DialogDescription>
          </DialogHeader>
          {editMember && (
            <div className="grid gap-4 py-2">
              <div><Label>Name</Label><Input value={editMember.name} onChange={(e) => setEditMember({ ...editMember, name: e.target.value })} /></div>
              <div><Label>Role</Label>
                <Select value={editMember.role} onValueChange={(v) => setEditMember({ ...editMember, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{roles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Email</Label><Input type="email" value={editMember.email} onChange={(e) => setEditMember({ ...editMember, email: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={editMember.phone} onChange={(e) => setEditMember({ ...editMember, phone: e.target.value })} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMember(null)}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Staff Member</DialogTitle>
            <DialogDescription>Are you sure? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
