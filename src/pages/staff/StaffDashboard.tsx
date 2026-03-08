import { useState } from "react";
import { Dog, Clock, CheckCircle2, Play, Camera, Upload, Calendar, User, FileText, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Appointment {
  id: string;
  pet: string;
  breed: string;
  owner: string;
  service: string;
  time: string;
  status: "Scheduled" | "In Progress" | "Completed";
  notes: string;
  photos: string[];
}

const initialAppointments: Appointment[] = [
  { id: "a1", pet: "Buddy", breed: "Golden Retriever", owner: "Sarah Johnson", service: "Full Grooming", time: "10:00 AM", status: "Scheduled", notes: "", photos: [] },
  { id: "a2", pet: "Luna", breed: "Siberian Husky", owner: "James Kim", service: "Pet Spa Treatment", time: "11:30 AM", status: "Scheduled", notes: "", photos: [] },
  { id: "a3", pet: "Max", breed: "Labrador", owner: "Emily Davis", service: "Basic Grooming", time: "1:00 PM", status: "Scheduled", notes: "", photos: [] },
  { id: "a4", pet: "Bella", breed: "Poodle", owner: "Tom Wilson", service: "Full Grooming", time: "2:30 PM", status: "Scheduled", notes: "", photos: [] },
  { id: "a5", pet: "Charlie", breed: "Beagle", owner: "Anna Lee", service: "Dog Walking", time: "9:00 AM", status: "Completed", notes: "Great walk, very energetic today!", photos: [] },
];

const statusColors: Record<string, string> = {
  Scheduled: "bg-accent/10 text-accent border-accent/20",
  "In Progress": "bg-warning/10 text-warning border-warning/20",
  Completed: "bg-success/10 text-success border-success/20",
};

const statusIcon: Record<string, React.ReactNode> = {
  Scheduled: <Clock className="w-3.5 h-3.5" />,
  "In Progress": <Play className="w-3.5 h-3.5" />,
  Completed: <CheckCircle2 className="w-3.5 h-3.5" />,
};

export default function StaffDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const todayDate = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const scheduled = appointments.filter((a) => a.status === "Scheduled");
  const inProgress = appointments.filter((a) => a.status === "In Progress");
  const completed = appointments.filter((a) => a.status === "Completed");

  const updateStatus = (id: string, status: Appointment["status"]) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
    toast({ title: `Status updated to ${status}`, description: `Appointment has been marked as ${status.toLowerCase()}.` });
  };

  const saveNotes = (id: string) => {
    const note = noteInputs[id];
    if (!note?.trim()) return;
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, notes: note } : a))
    );
    toast({ title: "Notes saved", description: "Grooming notes have been updated." });
  };

  const handlePhotoUpload = (id: string) => {
    // Simulate photo upload
    const fakeUrl = `https://placehold.co/300x300/f5f0eb/d4a853?text=Pet+Photo+${Date.now() % 100}`;
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, photos: [...a.photos, fakeUrl] } : a))
    );
    toast({ title: "Photo uploaded", description: "Pet photo has been added to this appointment." });
  };

  const selected = appointments.find((a) => a.id === selectedAppointment);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Dog className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">Staff Panel</h1>
              <p className="text-xs text-muted-foreground">{todayDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Jessica Martinez</span>
            </div>
            <Badge variant="secondary" className="text-xs">Senior Groomer</Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Scheduled", count: scheduled.length, icon: Clock, color: "text-accent" },
            { label: "In Progress", count: inProgress.length, icon: Play, color: "text-warning" },
            { label: "Completed", count: completed.length, icon: CheckCircle2, color: "text-success" },
            { label: "Total Today", count: appointments.length, icon: Calendar, color: "text-primary" },
          ].map((s) => (
            <Card key={s.label} className="border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">{s.count}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Appointment List */}
          <div className="lg:col-span-2 space-y-4">
            <Tabs defaultValue="all">
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1">All ({appointments.length})</TabsTrigger>
                <TabsTrigger value="scheduled" className="flex-1">Queue ({scheduled.length})</TabsTrigger>
                <TabsTrigger value="done" className="flex-1">Done ({completed.length})</TabsTrigger>
              </TabsList>

              {["all", "scheduled", "done"].map((tab) => {
                const list = tab === "all" ? appointments : tab === "scheduled" ? [...scheduled, ...inProgress] : completed;
                return (
                  <TabsContent key={tab} value={tab} className="space-y-2 mt-3">
                    {list.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        No appointments in this category
                      </div>
                    )}
                    {list.map((appt) => (
                      <Card
                        key={appt.id}
                        className={`cursor-pointer transition-all border-border hover:border-primary/40 hover:shadow-sm ${selectedAppointment === appt.id ? "border-primary ring-1 ring-primary/20" : ""}`}
                        onClick={() => setSelectedAppointment(appt.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                {appt.pet[0]}
                              </div>
                              <div>
                                <p className="font-semibold text-card-foreground text-sm">{appt.pet}</p>
                                <p className="text-xs text-muted-foreground">{appt.breed}</p>
                              </div>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[appt.status]}`}>
                              {statusIcon[appt.status]}
                              {appt.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{appt.service}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{appt.time}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Owner: {appt.owner}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-3">
            {!selected ? (
              <Card className="border-border h-full flex items-center justify-center min-h-[400px]">
                <div className="text-center text-muted-foreground">
                  <Dog className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Select an appointment</p>
                  <p className="text-sm">Click on an appointment to view details and manage it</p>
                </div>
              </Card>
            ) : (
              <Card className="border-border">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-card-foreground font-display flex items-center gap-2">
                        <Dog className="w-5 h-5 text-primary" />
                        {selected.pet}
                      </CardTitle>
                      <CardDescription>{selected.breed} • Owner: {selected.owner}</CardDescription>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${statusColors[selected.status]}`}>
                      {statusIcon[selected.status]}
                      {selected.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Service Info */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Service</p>
                      <p className="font-medium text-card-foreground text-sm">{selected.service}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Time</p>
                      <p className="font-medium text-card-foreground text-sm">{selected.time}</p>
                    </div>
                  </div>

                  {/* Status Actions */}
                  <div>
                    <p className="text-sm font-medium text-card-foreground mb-2">Update Status</p>
                    <div className="flex flex-wrap gap-2">
                      {selected.status === "Scheduled" && (
                        <Button size="sm" onClick={() => updateStatus(selected.id, "In Progress")} className="gap-1.5">
                          <Play className="w-3.5 h-3.5" /> Start Service
                        </Button>
                      )}
                      {selected.status === "In Progress" && (
                        <Button size="sm" onClick={() => updateStatus(selected.id, "Completed")} className="gap-1.5 bg-success hover:bg-success/90 text-success-foreground">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mark Complete
                        </Button>
                      )}
                      {selected.status === "Completed" && (
                        <Badge variant="secondary" className="text-success py-1.5 px-3">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Service completed
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <p className="text-sm font-medium text-card-foreground mb-2 flex items-center gap-1.5">
                      <FileText className="w-4 h-4" /> Grooming Notes
                    </p>
                    <Textarea
                      placeholder="Add grooming notes, special observations, product used..."
                      value={noteInputs[selected.id] ?? selected.notes}
                      onChange={(e) => setNoteInputs((prev) => ({ ...prev, [selected.id]: e.target.value }))}
                      className="min-h-[80px] bg-background"
                    />
                    <Button size="sm" variant="outline" className="mt-2" onClick={() => saveNotes(selected.id)}>
                      Save Notes
                    </Button>
                  </div>

                  {/* Photos */}
                  <div>
                    <p className="text-sm font-medium text-card-foreground mb-2 flex items-center gap-1.5">
                      <Camera className="w-4 h-4" /> Pet Photos
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                      {selected.photos.map((url, i) => (
                        <div key={i} className="aspect-square rounded-lg overflow-hidden border border-border">
                          <img src={url} alt={`Pet photo ${i + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                      <button
                        onClick={() => handlePhotoUpload(selected.id)}
                        className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
                      >
                        <Upload className="w-5 h-5 mb-1" />
                        <span className="text-[10px]">Upload</span>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
