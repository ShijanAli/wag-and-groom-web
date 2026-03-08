import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, X, Dog, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppState } from "@/context/AppContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

const SERVICES = [
  { name: "Dog Grooming", price: 40 },
  { name: "Dog Walking", price: 20 },
  { name: "Pet Sitting", price: 35 },
  { name: "Pet Daycare", price: 30 },
  { name: "Pet Spa Treatment", price: 60 },
  { name: "Basic Grooming", price: 25 },
  { name: "Full Grooming", price: 40 },
  { name: "Premium Spa", price: 75 },
];

const TIME_SLOTS = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
];

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preSelectedService?: string;
}

export function BookingModal({ open, onOpenChange, preSelectedService }: BookingModalProps) {
  const { pets, addBooking, addPet } = useAppState();
  const [step, setStep] = useState(1);
  const [service, setService] = useState(preSelectedService || "");
  const [petId, setPetId] = useState("");
  const [useNewPet, setUseNewPet] = useState(false);
  const [newPetName, setNewPetName] = useState("");
  const [newPetType, setNewPetType] = useState<"Dog" | "Cat" | "Other">("Dog");
  const [newPetBreed, setNewPetBreed] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const selectedService = SERVICES.find((s) => s.name === service);

  const reset = () => {
    setStep(1);
    setService(preSelectedService || "");
    setPetId("");
    setUseNewPet(false);
    setNewPetName("");
    setNewPetType("Dog");
    setNewPetBreed("");
    setDate(undefined);
    setTime("");
    setNotes("");
    setConfirmed(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(reset, 300);
  };

  const canProceedStep1 = service.length > 0;
  const canProceedStep2 = useNewPet ? newPetName.trim().length > 0 : petId.length > 0;
  const canProceedStep3 = date && time.length > 0;

  const handleSubmit = () => {
    let finalPetId = petId;
    let finalPetName = pets.find((p) => p.id === petId)?.name || "";

    if (useNewPet) {
      const newId = `pnew${Date.now()}`;
      addPet({
        name: newPetName.trim(),
        type: newPetType,
        breed: newPetBreed.trim(),
        age: "",
        weight: "",
        notes: "",
      });
      finalPetId = newId;
      finalPetName = newPetName.trim();
    }

    addBooking({
      petId: finalPetId,
      petName: finalPetName,
      service,
      date: date ? format(date, "yyyy-MM-dd") : "",
      time,
      status: "Pending",
      price: selectedService?.price || 0,
      notes: notes.trim(),
    });

    setConfirmed(true);
    toast({
      title: "Booking Confirmed! 🎉",
      description: `${service} for ${finalPetName} on ${date ? format(date, "PPP") : ""} at ${time}`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {confirmed ? "Booking Confirmed!" : `Book an Appointment — Step ${step} of 3`}
          </DialogTitle>
        </DialogHeader>

        {confirmed ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-success" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Your appointment has been booked!</h3>
            <div className="bg-muted rounded-xl p-4 text-sm space-y-1 text-left">
              <p><span className="text-muted-foreground">Service:</span> <span className="font-medium text-foreground">{service}</span></p>
              <p><span className="text-muted-foreground">Pet:</span> <span className="font-medium text-foreground">{useNewPet ? newPetName : pets.find(p => p.id === petId)?.name}</span></p>
              <p><span className="text-muted-foreground">Date:</span> <span className="font-medium text-foreground">{date ? format(date, "PPP") : ""}</span></p>
              <p><span className="text-muted-foreground">Time:</span> <span className="font-medium text-foreground">{time}</span></p>
              <p><span className="text-muted-foreground">Price:</span> <span className="font-medium text-primary">${selectedService?.price}</span></p>
            </div>
            <Button onClick={handleClose} className="w-full">Done</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progress */}
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className={cn("h-1.5 flex-1 rounded-full transition-colors", s <= step ? "bg-primary" : "bg-muted")} />
              ))}
            </div>

            {/* Step 1: Service */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Select Service</Label>
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    {SERVICES.map((s) => (
                      <button
                        key={s.name}
                        onClick={() => setService(s.name)}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border text-left text-sm transition-all",
                          service === s.name
                            ? "border-primary bg-accent text-foreground"
                            : "border-border hover:border-primary/30 text-card-foreground"
                        )}
                      >
                        <span className="font-medium">{s.name}</span>
                        <span className="text-primary font-bold">${s.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setStep(2)} disabled={!canProceedStep1}>Next</Button>
                </div>
              </div>
            )}

            {/* Step 2: Pet Info */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Select Your Pet</Label>
                  {pets.length > 0 && !useNewPet && (
                    <div className="grid gap-2 mt-2">
                      {pets.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setPetId(p.id)}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border text-left text-sm transition-all",
                            petId === p.id
                              ? "border-primary bg-accent"
                              : "border-border hover:border-primary/30"
                          )}
                        >
                          <Dog className="w-5 h-5 text-primary shrink-0" />
                          <div>
                            <p className="font-medium text-foreground">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.type} · {p.breed}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => { setUseNewPet(!useNewPet); setPetId(""); }}
                  >
                    {useNewPet ? "Select existing pet" : "+ Add new pet"}
                  </Button>
                </div>

                {useNewPet && (
                  <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                    <div>
                      <Label>Pet Name *</Label>
                      <Input value={newPetName} onChange={(e) => setNewPetName(e.target.value)} placeholder="e.g. Buddy" className="mt-1" />
                    </div>
                    <div>
                      <Label>Pet Type</Label>
                      <Select value={newPetType} onValueChange={(v) => setNewPetType(v as "Dog" | "Cat" | "Other")}>
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
                      <Input value={newPetBreed} onChange={(e) => setNewPetBreed(e.target.value)} placeholder="e.g. Golden Retriever" className="mt-1" />
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button onClick={() => setStep(3)} disabled={!canProceedStep2}>Next</Button>
                </div>
              </div>
            )}

            {/* Step 3: Date & Time */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Select Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal mt-1", !date && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(d) => d < new Date()}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label className="text-sm font-medium">Select Time</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {TIME_SLOTS.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTime(t)}
                        className={cn(
                          "p-2 rounded-lg border text-sm font-medium transition-all",
                          time === t
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary/30 text-foreground"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Special Notes (optional)</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special requests or notes..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                {/* Summary */}
                <div className="bg-muted rounded-xl p-4 text-sm space-y-1">
                  <p className="font-semibold text-foreground mb-2">Booking Summary</p>
                  <p><span className="text-muted-foreground">Service:</span> <span className="font-medium text-foreground">{service}</span></p>
                  <p><span className="text-muted-foreground">Pet:</span> <span className="font-medium text-foreground">{useNewPet ? newPetName : pets.find(p => p.id === petId)?.name}</span></p>
                  {date && <p><span className="text-muted-foreground">Date:</span> <span className="font-medium text-foreground">{format(date, "PPP")}</span></p>}
                  {time && <p><span className="text-muted-foreground">Time:</span> <span className="font-medium text-foreground">{time}</span></p>}
                  <p><span className="text-muted-foreground">Total:</span> <span className="font-bold text-primary">${selectedService?.price}</span></p>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                  <Button onClick={handleSubmit} disabled={!canProceedStep3}>Confirm Booking</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
