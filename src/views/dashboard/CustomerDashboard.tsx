"use client";

import { useState } from "react";
import Link from "next/link";
import { Dog, CalendarDays, CreditCard, PawPrint, Plus, Edit, Trash2, X as XIcon, Clock, MoreHorizontal, RotateCcw, Check } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAppState, Pet } from "@/context/AppContext";
import { BookingModal } from "@/components/BookingModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  Pending: "bg-warning/10 text-warning-foreground",
  Confirmed: "bg-primary/10 text-primary",
  Completed: "bg-success/10 text-success",
  Cancelled: "bg-destructive/10 text-destructive",
  Paid: "bg-success/10 text-success",
  Refunded: "bg-muted text-muted-foreground",
};

const TIME_SLOTS = ["8:00 AM","9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM"];

export default function CustomerDashboard() {
  const { pets, bookings, payments, addPet, updatePet, deletePet, updateBooking, cancelBooking } = useAppState();
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [petModalOpen, setPetModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [rescheduleModal, setRescheduleModal] = useState<string | null>(null);

  // Pet form state
  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState<"Dog" | "Cat" | "Other">("Dog");
  const [petBreed, setPetBreed] = useState("");
  const [petAge, setPetAge] = useState("");
  const [petWeight, setPetWeight] = useState("");
  const [petNotes, setPetNotes] = useState("");

  // Reschedule state
  const [rescheduleDate, setRescheduleDate] = useState<Date>();
  const [rescheduleTime, setRescheduleTime] = useState("");

  const upcomingBookings = bookings.filter((b) => b.status === "Confirmed" || b.status === "Pending");
  const pastBookings = bookings.filter((b) => b.status === "Completed" || b.status === "Cancelled");
  const totalSpent = payments.filter((p) => p.status === "Paid").reduce((sum, p) => sum + p.amount, 0);

  const openAddPet = () => {
    setEditingPet(null);
    setPetName(""); setPetType("Dog"); setPetBreed(""); setPetAge(""); setPetWeight(""); setPetNotes("");
    setPetModalOpen(true);
  };

  const openEditPet = (pet: Pet) => {
    setEditingPet(pet);
    setPetName(pet.name); setPetType(pet.type); setPetBreed(pet.breed); setPetAge(pet.age); setPetWeight(pet.weight); setPetNotes(pet.notes);
    setPetModalOpen(true);
  };

  const handleSavePet = () => {
    if (!petName.trim()) { toast({ title: "Pet name is required", variant: "destructive" }); return; }
    const data = { name: petName.trim(), type: petType, breed: petBreed.trim(), age: petAge.trim(), weight: petWeight.trim(), notes: petNotes.trim() };
    if (editingPet) {
      updatePet(editingPet.id, data);
      toast({ title: "Pet updated!", description: `${data.name}'s profile has been updated.` });
    } else {
      addPet(data);
      toast({ title: "Pet added! 🐾", description: `${data.name} has been added to your pets.` });
    }
    setPetModalOpen(false);
  };

  const handleDeletePet = (pet: Pet) => {
    deletePet(pet.id);
    toast({ title: "Pet removed", description: `${pet.name} has been removed from your pets.` });
  };

  const handleCancelBooking = (id: string) => {
    cancelBooking(id);
    toast({ title: "Booking cancelled", description: "Your booking has been cancelled." });
  };

  const handleReschedule = () => {
    if (!rescheduleModal || !rescheduleDate || !rescheduleTime) return;
    updateBooking(rescheduleModal, {
      date: format(rescheduleDate, "yyyy-MM-dd"),
      time: rescheduleTime,
      status: "Pending",
    });
    toast({ title: "Booking rescheduled!", description: `Rescheduled to ${format(rescheduleDate, "PPP")} at ${rescheduleTime}` });
    setRescheduleModal(null);
    setRescheduleDate(undefined);
    setRescheduleTime("");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
              <Dog className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">HappyPaws</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link href="/services" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Services</Link>
            <Link href="/dashboard" className="text-sm font-medium text-foreground transition-colors">Dashboard</Link>
          </div>
          <Button size="sm" onClick={() => setBookingModalOpen(true)}>Book Now</Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">My Dashboard</h1>
            <p className="text-muted-foreground">Manage your pets, bookings, and payments</p>
          </div>
          <Button onClick={() => setBookingModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> New Booking
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-border">
            <CardContent className="p-4 text-center">
              <PawPrint className="w-6 h-6 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{pets.length}</p>
              <p className="text-xs text-muted-foreground">My Pets</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4 text-center">
              <CalendarDays className="w-6 h-6 text-secondary mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{upcomingBookings.length}</p>
              <p className="text-xs text-muted-foreground">Upcoming</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4 text-center">
              <Check className="w-6 h-6 text-success mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{pastBookings.filter(b => b.status === "Completed").length}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4 text-center">
              <CreditCard className="w-6 h-6 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">${totalSpent}</p>
              <p className="text-xs text-muted-foreground">Total Spent</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="pets">My Pets</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            {upcomingBookings.length > 0 && (
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground mb-3">Upcoming Appointments</h2>
                <div className="space-y-3">
                  {upcomingBookings.map((b) => (
                    <Card key={b.id} className="border-border">
                      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0">
                            <Dog className="w-5 h-5 text-accent-foreground" />
                          </div>
                          <div>
                            <p className="font-semibold text-card-foreground">{b.service}</p>
                            <p className="text-sm text-muted-foreground">{b.petName} · {b.date} · {b.time}</p>
                            {b.notes && <p className="text-xs text-muted-foreground mt-1 italic">"{b.notes}"</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-primary font-bold">${b.price}</span>
                          <Badge className={statusColors[b.status]}>{b.status}</Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() => { setRescheduleModal(b.id); setRescheduleDate(undefined); setRescheduleTime(""); }}
                          >
                            <RotateCcw className="w-3 h-3" /> Reschedule
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive gap-1"
                            onClick={() => handleCancelBooking(b.id)}
                          >
                            <XIcon className="w-3 h-3" /> Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {pastBookings.length > 0 && (
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground mb-3">Past Appointments</h2>
                <div className="space-y-3">
                  {pastBookings.map((b) => (
                    <Card key={b.id} className="border-border opacity-80">
                      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                            <Dog className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-semibold text-card-foreground">{b.service}</p>
                            <p className="text-sm text-muted-foreground">{b.petName} · {b.date} · {b.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground font-medium">${b.price}</span>
                          <Badge className={statusColors[b.status]}>{b.status}</Badge>
                          {b.status === "Completed" && (
                            <Button variant="outline" size="sm" onClick={() => setBookingModalOpen(true)}>Book Again</Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {bookings.length === 0 && (
              <div className="text-center py-12">
                <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No bookings yet.</p>
                <Button className="mt-4" onClick={() => setBookingModalOpen(true)}>Book Your First Appointment</Button>
              </div>
            )}
          </TabsContent>

          {/* Pets Tab */}
          <TabsContent value="pets" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-display text-lg font-semibold text-foreground">My Pets</h2>
              <Button size="sm" onClick={openAddPet} className="gap-1"><Plus className="w-4 h-4" /> Add Pet</Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pets.map((pet) => (
                <Card key={pet.id} className="border-border">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                          {pet.type === "Dog" ? "🐕" : pet.type === "Cat" ? "🐈" : "🐾"}
                        </div>
                        <div>
                          <h3 className="font-semibold text-card-foreground">{pet.name}</h3>
                          <p className="text-sm text-muted-foreground">{pet.type} · {pet.breed || "Unknown breed"}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditPet(pet)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeletePet(pet)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-2 text-sm">
                      {pet.age && <div><span className="text-muted-foreground">Age:</span> <span className="text-card-foreground">{pet.age}</span></div>}
                      {pet.weight && <div><span className="text-muted-foreground">Weight:</span> <span className="text-card-foreground">{pet.weight}</span></div>}
                    </div>
                    {pet.notes && <p className="text-xs text-muted-foreground mt-2 italic">"{pet.notes}"</p>}
                  </CardContent>
                </Card>
              ))}
            </div>

            {pets.length === 0 && (
              <div className="text-center py-12">
                <PawPrint className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No pets added yet.</p>
                <Button className="mt-4" onClick={openAddPet}>Add Your First Pet</Button>
              </div>
            )}
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-display text-foreground">Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                {payments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-2 text-muted-foreground font-medium">Service</th>
                          <th className="text-left py-3 px-2 text-muted-foreground font-medium">Amount</th>
                          <th className="text-left py-3 px-2 text-muted-foreground font-medium">Date</th>
                          <th className="text-left py-3 px-2 text-muted-foreground font-medium">Method</th>
                          <th className="text-left py-3 px-2 text-muted-foreground font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((p) => (
                          <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                            <td className="py-3 px-2 font-medium text-card-foreground">{p.service}</td>
                            <td className="py-3 px-2 font-bold text-foreground">${p.amount}</td>
                            <td className="py-3 px-2 text-muted-foreground">{p.date}</td>
                            <td className="py-3 px-2 text-muted-foreground">{p.method}</td>
                            <td className="py-3 px-2">
                              <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusColors[p.status])}>{p.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No payments yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Booking Modal */}
      <BookingModal open={bookingModalOpen} onOpenChange={setBookingModalOpen} />

      {/* Pet Add/Edit Modal */}
      <Dialog open={petModalOpen} onOpenChange={setPetModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">{editingPet ? "Edit Pet" : "Add New Pet"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Pet Name *</Label>
              <Input value={petName} onChange={(e) => setPetName(e.target.value)} placeholder="e.g. Buddy" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Pet Type</Label>
                <Select value={petType} onValueChange={(v) => setPetType(v as "Dog" | "Cat" | "Other")}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dog">Dog</SelectItem>
                    <SelectItem value="Cat">Cat</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Breed</Label>
                <Input value={petBreed} onChange={(e) => setPetBreed(e.target.value)} placeholder="e.g. Golden Retriever" className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Age</Label>
                <Input value={petAge} onChange={(e) => setPetAge(e.target.value)} placeholder="e.g. 4 years" className="mt-1" />
              </div>
              <div>
                <Label>Weight</Label>
                <Input value={petWeight} onChange={(e) => setPetWeight(e.target.value)} placeholder="e.g. 30 kg" className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Special Notes</Label>
              <Textarea value={petNotes} onChange={(e) => setPetNotes(e.target.value)} placeholder="Any allergies, preferences..." className="mt-1" rows={3} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPetModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSavePet}>{editingPet ? "Save Changes" : "Add Pet"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reschedule Modal */}
      <Dialog open={!!rescheduleModal} onOpenChange={(open) => { if (!open) setRescheduleModal(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Reschedule Appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>New Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal mt-1", !rescheduleDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {rescheduleDate ? format(rescheduleDate, "PPP") : "Pick a new date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={rescheduleDate}
                    onSelect={setRescheduleDate}
                    disabled={(d) => d < new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>New Time</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {TIME_SLOTS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setRescheduleTime(t)}
                    className={cn(
                      "p-2 rounded-lg border text-sm font-medium transition-all",
                      rescheduleTime === t ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/30 text-foreground"
                    )}
                  >{t}</button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRescheduleModal(null)}>Cancel</Button>
              <Button onClick={handleReschedule} disabled={!rescheduleDate || !rescheduleTime}>Confirm Reschedule</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
