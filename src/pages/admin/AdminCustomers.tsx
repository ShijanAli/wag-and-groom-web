import { Search, Users, Mail, Phone, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const customers = [
  { name: "Sarah Johnson", email: "sarah@email.com", phone: "(555) 111-2233", pets: 2, bookings: 12, spent: "$480" },
  { name: "Mike Chen", email: "mike@email.com", phone: "(555) 222-3344", pets: 1, bookings: 8, spent: "$320" },
  { name: "Emily Davis", email: "emily@email.com", phone: "(555) 333-4455", pets: 3, bookings: 15, spent: "$600" },
  { name: "James Kim", email: "james@email.com", phone: "(555) 444-5566", pets: 1, bookings: 5, spent: "$150" },
  { name: "Anna Lee", email: "anna@email.com", phone: "(555) 555-6677", pets: 2, bookings: 10, spent: "$400" },
];

export default function AdminCustomers() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground text-sm">Manage customer accounts and pet profiles</p>
        </div>
        <Button className="gap-2"><Users className="w-4 h-4" /> Add Customer</Button>
      </div>

      <Card className="border-border">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-card-foreground font-display">All Customers</CardTitle>
          <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input placeholder="Search customers..." className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground w-40" />
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
                {customers.map((c) => (
                  <tr key={c.email} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
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
