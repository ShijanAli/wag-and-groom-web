"use client";

import { useState } from "react";
import { Search, Users, Mail, Phone, MoreHorizontal, Plus, Edit, Trash2, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  pets: number;
  bookings: number;
  spent: string;
}

const initialCustomers: Customer[] = [
  { id: "c1", name: "Sarah Johnson", email: "sarah@email.com", phone: "(555) 111-2233", pets: 2, bookings: 12, spent: "$480" },
  { id: "c2", name: "Mike Chen", email: "mike@email.com", phone: "(555) 222-3344", pets: 1, bookings: 8, spent: "$320" },
  { id: "c3", name: "Emily Davis", email: "emily@email.com", phone: "(555) 333-4455", pets: 3, bookings: 15, spent: "$600" },
  { id: "c4", name: "James Kim", email: "james@email.com", phone: "(555) 444-5566", pets: 1, bookings: 5, spent: "$150" },
  { id: "c5", name: "Anna Lee", email: "anna@email.com", phone: "(555) 555-6677", pets: 2, bookings: 10, spent: "$400" },
];

let nextId = 6;

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { toast } = useToast();

  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  const filtered = customers.filter((c) =>
    !search || [c.name, c.email, c.phone].some((f) => f.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAdd = () => {
    if (!form.name || !form.email) {
      toast({ title: "Missing fields", description: "Name and email are required.", variant: "destructive" });
      return;
    }
    setCustomers((prev) => [...prev, { id: `c${nextId++}`, ...form, pets: 0, bookings: 0, spent: "$0" }]);
    setShowAdd(false);
    setForm({ name: "", email: "", phone: "" });
    toast({ title: "Customer added", description: `${form.name} has been added.` });
  };

  const handleEdit = () => {
    if (!editCustomer) return;
    setCustomers((prev) => prev.map((c) => (c.id === editCustomer.id ? editCustomer : c)));
    setEditCustomer(null);
    toast({ title: "Customer updated", description: `${editCustomer.name} has been updated.` });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const cust = customers.find((c) => c.id === deleteTarget);
    setCustomers((prev) => prev.filter((c) => c.id !== deleteTarget));
    setDeleteTarget(null);
    toast({ title: "Customer deleted", description: `${cust?.name} has been removed.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground text-sm">Manage customer accounts and pet profiles</p>
        </div>
        <Button className="gap-2" onClick={() => { setForm({ name: "", email: "", phone: "" }); setShowAdd(true); }}><Plus className="w-4 h-4" /> Add Customer</Button>
      </div>

      <Card className="border-border">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-card-foreground font-display">All Customers ({filtered.length})</CardTitle>
          <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers..."
              className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground w-40"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Name</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Contact</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Pets</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Bookings</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Total Spent</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No customers found</td></tr>
                )}
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {c.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <span className="font-medium text-card-foreground">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>
                        <span className="text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-card-foreground">{c.pets}</td>
                    <td className="py-3 px-2 text-card-foreground">{c.bookings}</td>
                    <td className="py-3 px-2 font-medium text-card-foreground">{c.spent}</td>
                    <td className="py-3 px-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewCustomer(c)}><Eye className="w-3 h-3 mr-2" />View</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditCustomer({ ...c })}><Edit className="w-3 h-3 mr-2" />Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget(c.id)}><Trash2 className="w-3 h-3 mr-2" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Customer */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
            <DialogDescription>Add a new customer to the system.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Customer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Customer */}
      <Dialog open={!!editCustomer} onOpenChange={(o) => !o && setEditCustomer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>Update customer information.</DialogDescription>
          </DialogHeader>
          {editCustomer && (
            <div className="grid gap-4 py-2">
              <div><Label>Name</Label><Input value={editCustomer.name} onChange={(e) => setEditCustomer({ ...editCustomer, name: e.target.value })} /></div>
              <div><Label>Email</Label><Input type="email" value={editCustomer.email} onChange={(e) => setEditCustomer({ ...editCustomer, email: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={editCustomer.phone} onChange={(e) => setEditCustomer({ ...editCustomer, phone: e.target.value })} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCustomer(null)}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Customer */}
      <Dialog open={!!viewCustomer} onOpenChange={(o) => !o && setViewCustomer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewCustomer?.name}</DialogTitle>
            <DialogDescription>Customer details</DialogDescription>
          </DialogHeader>
          {viewCustomer && (
            <div className="grid gap-3 py-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="text-card-foreground">{viewCustomer.email}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span className="text-card-foreground">{viewCustomer.phone}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Pets</span><span className="text-card-foreground">{viewCustomer.pets}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total Bookings</span><span className="text-card-foreground">{viewCustomer.bookings}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total Spent</span><span className="font-bold text-card-foreground">{viewCustomer.spent}</span></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewCustomer(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>Are you sure? This will remove the customer and their data.</DialogDescription>
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
