import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Eye, EyeOff, UserPlus, Heart, Briefcase, ShieldCheck, Crown } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, roleHomePath, UserRole } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
  confirm: z.string(),
  role: z.enum(["customer", "staff", "manager", "admin"]),
}).refine((d) => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });

const roles: { value: UserRole; label: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "customer", label: "Customer", desc: "Book services for your pets", icon: Heart },
  { value: "staff", label: "Staff", desc: "Manage assigned appointments", icon: Briefcase },
  { value: "manager", label: "Manager", desc: "Oversee operations & team", icon: ShieldCheck },
  { value: "admin", label: "Admin", desc: "Full system access", icon: Crown },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState<UserRole>("customer");
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const parsed = schema.safeParse({ name, email, password, confirm, role });
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { fe[i.path[0] as string] = i.message; });
      setErrors(fe);
      return;
    }
    setSubmitting(true);
    const res = await register({ name: parsed.data.name, email: parsed.data.email, password: parsed.data.password, role: parsed.data.role });
    setSubmitting(false);
    if (!res.ok || !res.user) {
      toast({ title: "Registration failed", description: res.error, variant: "destructive" });
      return;
    }
    toast({ title: "Account created!", description: `Welcome to HappyPaws, ${res.user.name.split(" ")[0]}.` });
    navigate(roleHomePath[res.user.role], { replace: true });
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Choose your role to get a tailored experience"
      footer={<>Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>I am a…</Label>
          <div className="grid grid-cols-2 gap-2">
            {roles.map((r) => {
              const Icon = r.icon;
              const active = role === r.value;
              return (
                <button key={r.value} type="button" onClick={() => setRole(r.value)}
                  className={`text-left p-3 rounded-lg border transition-all ${active ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:border-primary/40"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-4 h-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-sm font-medium ${active ? "text-foreground" : "text-foreground"}`}>{r.label}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{r.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input id="password" type={showPwd ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              <button type="button" onClick={() => setShowPwd((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm</Label>
            <Input id="confirm" type={showPwd ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" />
            {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          <UserPlus className="w-4 h-4 mr-2" />
          {submitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthLayout>
  );
}
