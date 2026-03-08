import { useState } from "react";
import { CalendarDays, Search, Filter, Dog, Clock, MoreHorizontal, Check, X, Trash2, Edit, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Booking {
  id: string;
  pet: string;
  owner: string;
  service: string;
  date: string;
  time: string;
  status: "Confirmed" | "In Progress" | "Pending" | "Completed" | "Cancelled";
  price: string;
  notes: string;
}

const initialBookings: Booking[] = [
  { id: "#B001", pet: "Buddy", owner: "Sarah Johnson", service: "Full Grooming", date: "Mar 8, 2026", time: "10:00 AM", status: "Confirmed", price: "$40", notes: "" },
  { id: "#B002", pet: "Whiskers", owner: "Mike Chen", service: "Pet Spa", date: "Mar 8, 2026", time: "11:30 AM", status: "In Progress", price: "$60", notes: "" },
  { id: "#B003", pet: "Max", owner: "Emily Davis", service: "Dog Walking", date: "Mar 8, 2026", time: "2:00 PM", status: "Pending", price: "$20", notes: "" },
  { id: "#B004", pet: "Luna", owner: "James Kim", service: "Pet Daycare", date: "Mar 8, 2026", time: "8:00 AM", status: "Completed", price: "$30", notes: "" },
  { id: "#B005", pet: "Charlie", owner: "Anna Lee", service: "Basic Grooming", date: "Mar 9, 2026", time: "9:00 AM", status: "Confirmed", price: "$25", notes: "" },
  { id: "#B006", pet: "Bella", owner: "Tom Wilson", service: "Dog Walking", date: "Mar 9, 2026", time: "3:00 PM", status: "Pending", price: "$20", notes: "" },
];

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Confirmed: "default",
  "In Progress": "secondary",
  Pending: "outline",
  Completed: "default",
  Cancelled: "destructive",
};

const statusOptions: Booking["status"][] = ["Pending", "Confirmed", "In Progress", "Completed", "Cancelled"];
const serviceOptions = ["Full Grooming", "Basic Grooming", "Pet Spa", "Dog Walking", "Pet Daycare", "Pet Sitting"];

let nextId = 7;

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showNew, setShowNew] = useState(false);
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { toast } = useToast();

  const [form, setForm] = useState({ pet: "", owner: "", service: "Full Grooming", date: "", time: "", price: "", notes: "" });

  const filtered = bookings.filter((b) => {
    const matchSearch = !search || [b.pet, b.owner, b.service, b.id].some((f) => f.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = filterStatus === "all" || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const resetForm = () => setForm({ pet: "", owner: "", service: "Full Grooming", date: "", time: "", price: "", notes: "" });

  const handleAdd = () => {
    if (!form.pet || !form.owner || !form.date || !form.time || !form.price) {
      toast({ title: "Missing fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    const newBooking: Booking = {
      id: `#B${String(nextId++).padStart(3, "0")}`,
      ...form,
      status: "Pending",
    };
    setBookings((prev) => [newBooking, ...prev]);
    setShowNew(false);
    resetForm();
    toast({ title: "Booking created", description: `Booking for ${form.pet} has been created.` });
  };

  const handleEdit = () => {
    if (!editBooking) return;
    setBookings((prev) => prev.map((b) => (b.id === editBooking.id ? editBooking : b)));
    setEditBooking(null);
    toast({ title: "Booking updated", description: `Booking ${editBooking.id} has been updated.` });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setBookings((prev) => prev.filter((b) => b.id !== deleteTarget));
    setDeleteTarget(null);
    toast({ title: "Booking deleted", description: "The booking has been removed." });
  };

  const handleStatusChange = (id: string, status: Booking["status"]) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    toast({ title: "Status updated", description: `Booking ${id} is now ${status}.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Bookings</h1>
          <p className="text-muted-foreground text-sm">Manage all appointments and bookings</p>
        </div>
        <Button className="gap-2" onClick={() => { resetForm(); setShowNew(true); }}><CalendarDays className="w-4 h-4" /> New Booking</Button>
      </div>

      <Card className="border-border">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-card-foreground font-display">All Bookings ({filtered.length})</CardTitle>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search bookings..."
                className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground w-40"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="w-4 h-4" />
                  {filterStatus === "all" ? "All" : filterStatus}
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus("all")}>All</DropdownMenuItem>
                {statusOptions.map((s) => (
                  <DropdownMenuItem key={s} onClick={() => setFilterStatus(s)}>{s}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">ID</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Pet</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Owner</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Service</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Date</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Time</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Price</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Status</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="text-center py-8 text-muted-foreground">No bookings found</td></tr>
                )}
                {filtered.map((b) => (
                  <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-2 text-muted-foreground font-mono text-xs">{b.id}</td>
                    <td className="py-3 px-2 font-medium text-card-foreground"><span className="flex items-center gap-2"><Dog className="w-4 h-4 text-primary" />{b.pet}</span></td>
                    <td className="py-3 px-2 text-muted-foreground">{b.owner}</td>
                    <td className="py-3 px-2 text-card-foreground">{b.service}</td>
                    <td className="py-3 px-2 text-muted-foreground">{b.date}</td>
                    <td className="py-3 px-2 text-muted-foreground"><span className="flex items-center gap-1"><Clock className="w-3 h-3" />{b.time}</span></td>
                    <td className="py-3 px-2 font-medium text-card-foreground">{b.price}</td>
                    <td className="py-3 px-2"><Badge variant={statusVariant[b.status]}>{b.status}</Badge></td>
                    <td className="py-3 px-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditBooking({ ...b })}><Edit className="w-3 h-3 mr-2" />Edit</DropdownMenuItem>
                          {b.status === "Pending" && <DropdownMenuItem onClick={() => handleStatusChange(b.id, "Confirmed")}><Check className="w-3 h-3 mr-2" />Approve</DropdownMenuItem>}
                          {(b.status === "Confirmed" || b.status === "Pending") && <DropdownMenuItem onClick={() => handleStatusChange(b.id, "Cancelled")}><X className="w-3 h-3 mr-2" />Cancel</DropdownMenuItem>}
                          {b.status === "In Progress" && <DropdownMenuItem onClick={() => handleStatusChange(b.id, "Completed")}><Check className="w-3 h-3 mr-2" />Complete</DropdownMenuItem>}
                          <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget(b.id)}><Trash2 className="w-3 h-3 mr-2" />Delete</DropdownMenuItem>
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

      {/* New Booking Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Booking</DialogTitle>
            <DialogDescription>Create a new appointment booking.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Pet Name *</Label><Input value={form.pet} onChange={(e) => setForm({ ...form, pet: e.target.value })} /></div>
              <div><Label>Owner *</Label><Input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} /></div>
            </div>
            <div><Label>Service</Label>
              <Select value={form.service} onValueChange={(v) => setForm({ ...form, service: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{serviceOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Date *</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <div><Label>Time *</Label><Input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="10:00 AM" /></div>
              <div><Label>Price *</Label><Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="$40" /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Create Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Booking Dialog */}
      <Dialog open={!!editBooking} onOpenChange={(o) => !o && setEditBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Booking {editBooking?.id}</DialogTitle>
            <DialogDescription>Update booking details.</DialogDescription>
          </DialogHeader>
          {editBooking && (
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Pet Name</Label><Input value={editBooking.pet} onChange={(e) => setEditBooking({ ...editBooking, pet: e.target.value })} /></div>
                <div><Label>Owner</Label><Input value={editBooking.owner} onChange={(e) => setEditBooking({ ...editBooking, owner: e.target.value })} /></div>
              </div>
              <div><Label>Service</Label>
                <Select value={editBooking.service} onValueChange={(v) => setEditBooking({ ...editBooking, service: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{serviceOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Date</Label><Input value={editBooking.date} onChange={(e) => setEditBooking({ ...editBooking, date: e.target.value })} /></div>
                <div><Label>Time</Label><Input value={editBooking.time} onChange={(e) => setEditBooking({ ...editBooking, time: e.target.value })} /></div>
                <div><Label>Price</Label><Input value={editBooking.price} onChange={(e) => setEditBooking({ ...editBooking, price: e.target.value })} /></div>
              </div>
              <div><Label>Status</Label>
                <Select value={editBooking.status} onValueChange={(v) => setEditBooking({ ...editBooking, status: v as Booking["status"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{statusOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Notes</Label><Textarea value={editBooking.notes} onChange={(e) => setEditBooking({ ...editBooking, notes: e.target.value })} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditBooking(null)}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Booking</DialogTitle>
            <DialogDescription>Are you sure you want to delete this booking? This action cannot be undone.</DialogDescription>
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
