import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, roleHomePath } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
});

const demoAccounts = [
  { role: "Customer", email: "customer@demo.com" },
  { role: "Staff", email: "staff@demo.com" },
  { role: "Manager", email: "manager@demo.com" },
  { role: "Admin", email: "admin@demo.com" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      const fieldErr: typeof errors = {};
      parsed.error.issues.forEach((i) => { fieldErr[i.path[0] as "email" | "password"] = i.message; });
      setErrors(fieldErr);
      return;
    }
    setSubmitting(true);
    const res = await login(parsed.data.email, parsed.data.password);
    setSubmitting(false);
    if (!res.ok || !res.user) {
      toast({ title: "Sign in failed", description: res.error, variant: "destructive" });
      return;
    }
    toast({ title: `Welcome back, ${res.user.name.split(" ")[0]}!`, description: `Signed in as ${res.user.role}.` });
    const from = (location.state as { from?: string } | null)?.from;
    navigate(from || roleHomePath[res.user.role], { replace: true });
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("demo1234");
    setErrors({});
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your HappyPaws account"
      footer={<>Don't have an account? <Link to="/register" className="text-primary font-medium hover:underline">Create one</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <button type="button" className="text-xs text-muted-foreground hover:text-foreground">Forgot?</button>
          </div>
          <div className="relative">
            <Input id="password" type={showPwd ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            <button type="button" onClick={() => setShowPwd((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          <LogIn className="w-4 h-4 mr-2" />
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-2">
        <p className="text-xs font-semibold text-foreground">Try a demo account (password: <span className="font-mono">demo1234</span>)</p>
        <div className="grid grid-cols-2 gap-2">
          {demoAccounts.map((d) => (
            <button key={d.email} type="button" onClick={() => fillDemo(d.email)}
              className="text-left px-2 py-1.5 rounded-md bg-card hover:bg-card/70 border border-border transition-colors">
              <p className="text-xs font-medium text-foreground">{d.role}</p>
              <p className="text-[10px] text-muted-foreground truncate">{d.email}</p>
            </button>
          ))}
        </div>
      </div>
    </AuthLayout>
  );
}
