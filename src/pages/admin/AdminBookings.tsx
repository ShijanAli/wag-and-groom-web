import { CalendarDays, Search, Filter, Dog, Clock, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const bookings = [
  { id: "#B001", pet: "Buddy", owner: "Sarah Johnson", service: "Full Grooming", date: "Mar 8, 2026", time: "10:00 AM", status: "Confirmed", price: "$40" },
  { id: "#B002", pet: "Whiskers", owner: "Mike Chen", service: "Pet Spa", date: "Mar 8, 2026", time: "11:30 AM", status: "In Progress", price: "$60" },
  { id: "#B003", pet: "Max", owner: "Emily Davis", service: "Dog Walking", date: "Mar 8, 2026", time: "2:00 PM", status: "Pending", price: "$20" },
  { id: "#B004", pet: "Luna", owner: "James Kim", service: "Pet Daycare", date: "Mar 8, 2026", time: "8:00 AM", status: "Completed", price: "$30" },
  { id: "#B005", pet: "Charlie", owner: "Anna Lee", service: "Basic Grooming", date: "Mar 9, 2026", time: "9:00 AM", status: "Confirmed", price: "$25" },
  { id: "#B006", pet: "Bella", owner: "Tom Wilson", service: "Dog Walking", date: "Mar 9, 2026", time: "3:00 PM", status: "Pending", price: "$20" },
];

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Confirmed: "default",
  "In Progress": "secondary",
  Pending: "outline",
  Completed: "default",
};

export default function AdminBookings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Bookings</h1>
          <p className="text-muted-foreground text-sm">Manage all appointments and bookings</p>
        </div>
        <Button className="gap-2"><CalendarDays className="w-4 h-4" /> New Booking</Button>
      </div>

      <Card className="border-border">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-card-foreground font-display">All Bookings</CardTitle>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input placeholder="Search bookings..." className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground w-40" />
            </div>
            <Button variant="outline" size="icon"><Filter className="w-4 h-4" /></Button>
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
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-2 text-muted-foreground font-mono text-xs">{b.id}</td>
                    <td className="py-3 px-2 font-medium text-card-foreground flex items-center gap-2"><Dog className="w-4 h-4 text-primary" />{b.pet}</td>
                    <td className="py-3 px-2 text-muted-foreground">{b.owner}</td>
                    <td className="py-3 px-2 text-card-foreground">{b.service}</td>
                    <td className="py-3 px-2 text-muted-foreground">{b.date}</td>
                    <td className="py-3 px-2 text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{b.time}</td>
                    <td className="py-3 px-2 font-medium text-card-foreground">{b.price}</td>
                    <td className="py-3 px-2"><Badge variant={statusVariant[b.status]}>{b.status}</Badge></td>
                    <td className="py-3 px-2"><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
