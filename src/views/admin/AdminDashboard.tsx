"use client";

import { CalendarDays, Users, DollarSign, TrendingUp, ArrowUpRight, Clock, Scissors, Dog } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const stats = [
  { title: "Total Bookings", value: "1,247", change: "+12%", icon: CalendarDays, color: "text-primary" },
  { title: "Total Customers", value: "856", change: "+8%", icon: Users, color: "text-secondary" },
  { title: "Revenue", value: "$48,350", change: "+23%", icon: DollarSign, color: "text-success" },
  { title: "This Week", value: "89", change: "+5%", icon: TrendingUp, color: "text-chart-4" },
];

const weeklyData = [
  { day: "Mon", bookings: 12 }, { day: "Tue", bookings: 19 }, { day: "Wed", bookings: 15 },
  { day: "Thu", bookings: 22 }, { day: "Fri", bookings: 28 }, { day: "Sat", bookings: 35 }, { day: "Sun", bookings: 18 },
];

const serviceData = [
  { name: "Grooming", value: 40 }, { name: "Walking", value: 25 },
  { name: "Sitting", value: 15 }, { name: "Daycare", value: 12 }, { name: "Spa", value: 8 },
];
const COLORS = ["hsl(25,85%,55%)", "hsl(168,45%,45%)", "hsl(45,90%,55%)", "hsl(340,65%,55%)", "hsl(200,60%,50%)"];

const recentBookings = [
  { pet: "Buddy", owner: "Sarah J.", service: "Full Grooming", time: "10:00 AM", status: "Confirmed" },
  { pet: "Whiskers", owner: "Mike C.", service: "Pet Spa", time: "11:30 AM", status: "In Progress" },
  { pet: "Max", owner: "Emily D.", service: "Dog Walking", time: "2:00 PM", status: "Pending" },
  { pet: "Luna", owner: "James K.", service: "Pet Daycare", time: "8:00 AM", status: "Completed" },
  { pet: "Charlie", owner: "Anna L.", service: "Basic Grooming", time: "3:30 PM", status: "Confirmed" },
];

const statusColors: Record<string, string> = {
  Confirmed: "bg-primary/10 text-primary",
  "In Progress": "bg-warning/10 text-warning-foreground",
  Pending: "bg-muted text-muted-foreground",
  Completed: "bg-success/10 text-success",
};

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.title} className="border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.title}</p>
                  <p className="text-2xl font-bold text-card-foreground mt-1">{s.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-accent flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-success">
                <ArrowUpRight className="w-3 h-3" /> {s.change} from last month
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground font-display">Bookings This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(30,15%,88%)" />
                <XAxis dataKey="day" stroke="hsl(20,10%,45%)" fontSize={12} />
                <YAxis stroke="hsl(20,10%,45%)" fontSize={12} />
                <Tooltip />
                <Bar dataKey="bookings" fill="hsl(25,85%,55%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground font-display">Popular Services</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={serviceData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                  {serviceData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-2">
              {serviceData.map((s, i) => (
                <span key={s.name} className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                  {s.name}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground font-display">Today's Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Pet</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Owner</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Service</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Time</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-2 font-medium text-card-foreground flex items-center gap-2">
                      <Dog className="w-4 h-4 text-primary" /> {b.pet}
                    </td>
                    <td className="py-3 px-2 text-muted-foreground">{b.owner}</td>
                    <td className="py-3 px-2 text-card-foreground">{b.service}</td>
                    <td className="py-3 px-2 text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {b.time}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[b.status]}`}>{b.status}</span>
                    </td>
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
