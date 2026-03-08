import { useState } from "react";
import { User, Mail, Phone, Camera, Lock, Eye, EyeOff, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function AdminProfile() {
  const { toast } = useToast();

  // Profile state
  const [profile, setProfile] = useState({
    firstName: "Ryan",
    lastName: "Cooper",
    email: "admin@happypaws.com",
    phone: "(555) 400-5000",
    bio: "Business owner & manager at HappyPaws. Passionate about providing the best care for pets.",
    avatar: "",
  });

  // Password state
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleProfileSave = () => {
    if (!profile.firstName || !profile.lastName || !profile.email) {
      toast({ title: "Missing fields", description: "First name, last name, and email are required.", variant: "destructive" });
      return;
    }
    toast({ title: "Profile updated", description: "Your profile information has been saved successfully." });
  };

  const handlePasswordChange = () => {
    if (!passwords.current) {
      toast({ title: "Current password required", description: "Please enter your current password.", variant: "destructive" });
      return;
    }
    if (passwords.newPass.length < 8) {
      toast({ title: "Weak password", description: "New password must be at least 8 characters.", variant: "destructive" });
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      toast({ title: "Passwords don't match", description: "New password and confirmation must match.", variant: "destructive" });
      return;
    }
    setPasswords({ current: "", newPass: "", confirm: "" });
    toast({ title: "Password changed", description: "Your password has been updated successfully." });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Profile Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account information and security</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Change Password</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground font-display">Personal Information</CardTitle>
              <CardDescription>Update your profile details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary relative group">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold">{profile.firstName[0]}{profile.lastName[0]}</span>
                  )}
                  <button
                    className="absolute inset-0 rounded-full bg-foreground/0 group-hover:bg-foreground/40 flex items-center justify-center transition-colors"
                    onClick={() => toast({ title: "Upload avatar", description: "Connect Lovable Cloud to enable file uploads." })}
                  >
                    <Camera className="w-5 h-5 text-background opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>
                <div>
                  <p className="font-semibold text-card-foreground">{profile.firstName} {profile.lastName}</p>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                  <p className="text-xs text-primary font-medium mt-1">Admin</p>
                </div>
              </div>

              {/* Form */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>First Name *</Label>
                  <Input value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} />
                </div>
                <div>
                  <Label>Last Name *</Label>
                  <Input value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input className="pl-9" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label>Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input className="pl-9" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                  </div>
                </div>
              </div>

              <div>
                <Label>Bio</Label>
                <Textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="min-h-[80px]"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleProfileSave} className="gap-2"><Save className="w-4 h-4" /> Save Profile</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Tab */}
        <TabsContent value="password" className="mt-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground font-display flex items-center gap-2">
                <Lock className="w-5 h-5" /> Change Password
              </CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div>
                <Label>Current Password *</Label>
                <div className="relative">
                  <Input
                    type={showCurrent ? "text" : "password"}
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowCurrent(!showCurrent)}
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label>New Password *</Label>
                <div className="relative">
                  <Input
                    type={showNew ? "text" : "password"}
                    value={passwords.newPass}
                    onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                    placeholder="Enter new password (min 8 characters)"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowNew(!showNew)}
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwords.newPass && passwords.newPass.length < 8 && (
                  <p className="text-xs text-destructive mt-1">Password must be at least 8 characters</p>
                )}
                {passwords.newPass && passwords.newPass.length >= 8 && (
                  <p className="text-xs text-success mt-1">Password strength: Good</p>
                )}
              </div>

              <div>
                <Label>Confirm New Password *</Label>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwords.confirm && passwords.confirm !== passwords.newPass && (
                  <p className="text-xs text-destructive mt-1">Passwords do not match</p>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={handlePasswordChange} className="gap-2"><Lock className="w-4 h-4" /> Update Password</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
