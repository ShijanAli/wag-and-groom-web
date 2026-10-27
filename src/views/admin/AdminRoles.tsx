"use client";

import { useState } from "react";
import { Plus, Shield, Edit, Trash2, Check, X, Users, Lock, Eye, Pencil, Settings, BarChart3, Image, Tag, CalendarDays, Star as StarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface Permission {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  permissions: string[];
  members: number;
  isSystem: boolean;
}

const allPermissions: Permission[] = [
  { id: "dashboard.view", label: "View Dashboard", description: "Access the admin dashboard overview", icon: BarChart3, category: "Dashboard" },
  { id: "bookings.view", label: "View Bookings", description: "View all bookings", icon: CalendarDays, category: "Bookings" },
  { id: "bookings.manage", label: "Manage Bookings", description: "Create, edit, and cancel bookings", icon: Pencil, category: "Bookings" },
  { id: "services.view", label: "View Services", description: "View service catalog", icon: Eye, category: "Services" },
  { id: "services.manage", label: "Manage Services", description: "Add, edit, and remove services", icon: Settings, category: "Services" },
  { id: "customers.view", label: "View Customers", description: "View customer list and profiles", icon: Users, category: "Customers" },
  { id: "customers.manage", label: "Manage Customers", description: "Add, edit, and remove customers", icon: Pencil, category: "Customers" },
  { id: "staff.view", label: "View Staff", description: "View staff members", icon: Users, category: "Staff" },
  { id: "staff.manage", label: "Manage Staff", description: "Add, edit, and remove staff members", icon: Settings, category: "Staff" },
  { id: "reviews.view", label: "View Reviews", description: "View customer reviews", icon: StarIcon, category: "Reviews" },
  { id: "reviews.manage", label: "Manage Reviews", description: "Approve, hide, and delete reviews", icon: Pencil, category: "Reviews" },
  { id: "gallery.view", label: "View Gallery", description: "View photo gallery", icon: Image, category: "Gallery" },
  { id: "gallery.manage", label: "Manage Gallery", description: "Upload, edit, and delete photos", icon: Pencil, category: "Gallery" },
  { id: "promotions.view", label: "View Promotions", description: "View promo codes", icon: Tag, category: "Promotions" },
  { id: "promotions.manage", label: "Manage Promotions", description: "Create, edit, and delete promos", icon: Pencil, category: "Promotions" },
  { id: "roles.view", label: "View Roles", description: "View roles and permissions", icon: Shield, category: "System" },
  { id: "roles.manage", label: "Manage Roles", description: "Create, edit, and delete roles", icon: Lock, category: "System" },
  { id: "settings.manage", label: "Manage Settings", description: "Access and modify system settings", icon: Settings, category: "System" },
];

const allPermissionIds = allPermissions.map((p) => p.id);

const initialRoles: Role[] = [
  {
    id: "r1", name: "Admin", description: "Full access to all features and settings",
    color: "bg-destructive/10 text-destructive", permissions: [...allPermissionIds], members: 1, isSystem: true,
  },
  {
    id: "r2", name: "Manager", description: "Manage bookings, staff, and daily operations",
    color: "bg-primary/10 text-primary",
    permissions: ["dashboard.view", "bookings.view", "bookings.manage", "services.view", "services.manage", "customers.view", "customers.manage", "staff.view", "staff.manage", "reviews.view", "reviews.manage", "gallery.view", "gallery.manage", "promotions.view", "promotions.manage"],
    members: 1, isSystem: false,
  },
  {
    id: "r3", name: "Staff", description: "View assigned bookings and update service status",
    color: "bg-secondary/80 text-secondary-foreground",
    permissions: ["dashboard.view", "bookings.view", "services.view", "customers.view", "reviews.view", "gallery.view"],
    members: 3, isSystem: false,
  },
  {
    id: "r4", name: "Receptionist", description: "Handle bookings and customer inquiries",
    color: "bg-accent text-accent-foreground",
    permissions: ["dashboard.view", "bookings.view", "bookings.manage", "customers.view", "customers.manage", "services.view"],
    members: 0, isSystem: false,
  },
];

let nextId = 5;

export default function AdminRoles() {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [showAdd, setShowAdd] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [viewRole, setViewRole] = useState<Role | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { toast } = useToast();

  const [form, setForm] = useState({ name: "", description: "", permissions: [] as string[] });

  const togglePermission = (permId: string, perms: string[]) => {
    return perms.includes(permId) ? perms.filter((p) => p !== permId) : [...perms, permId];
  };

  const handleAdd = () => {
    if (!form.name) {
      toast({ title: "Missing name", description: "Role name is required.", variant: "destructive" });
      return;
    }
    setRoles((prev) => [...prev, {
      id: `r${nextId++}`, name: form.name, description: form.description,
      color: "bg-muted text-muted-foreground", permissions: form.permissions, members: 0, isSystem: false,
    }]);
    setShowAdd(false);
    setForm({ name: "", description: "", permissions: [] });
    toast({ title: "Role created", description: `${form.name} role has been created.` });
  };

  const handleEdit = () => {
    if (!editRole) return;
    setRoles((prev) => prev.map((r) => (r.id === editRole.id ? editRole : r)));
    setEditRole(null);
    toast({ title: "Role updated", description: `${editRole.name} role has been updated.` });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const role = roles.find((r) => r.id === deleteTarget);
    setRoles((prev) => prev.filter((r) => r.id !== deleteTarget));
    setDeleteTarget(null);
    toast({ title: "Role deleted", description: `${role?.name} has been removed.` });
  };

  const groupedPermissions = allPermissions.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {} as Record<string, Permission[]>);

  const PermissionCheckboxes = ({ permissions, onChange }: { permissions: string[]; onChange: (perms: string[]) => void }) => (
    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
      {Object.entries(groupedPermissions).map(([category, perms]) => (
        <div key={category}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{category}</p>
            <button
              type="button"
              className="text-[10px] text-primary hover:underline"
              onClick={() => {
                const catIds = perms.map((p) => p.id);
                const allSelected = catIds.every((id) => permissions.includes(id));
                if (allSelected) {
                  onChange(permissions.filter((p) => !catIds.includes(p)));
                } else {
                  onChange([...new Set([...permissions, ...catIds])]);
                }
              }}
            >
              {perms.every((p) => permissions.includes(p.id)) ? "Deselect all" : "Select all"}
            </button>
          </div>
          <div className="space-y-2">
            {perms.map((perm) => (
              <label key={perm.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                <Checkbox
                  checked={permissions.includes(perm.id)}
                  onCheckedChange={() => onChange(togglePermission(perm.id, permissions))}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium text-card-foreground">{perm.label}</p>
                  <p className="text-xs text-muted-foreground">{perm.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Roles & Permissions</h1>
          <p className="text-muted-foreground text-sm">Manage user roles and their access permissions</p>
        </div>
        <Button className="gap-2" onClick={() => { setForm({ name: "", description: "", permissions: [] }); setShowAdd(true); }}>
          <Plus className="w-4 h-4" /> Create Role
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{roles.length}</p>
              <p className="text-xs text-muted-foreground">Total Roles</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center text-success">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{allPermissions.length}</p>
              <p className="text-xs text-muted-foreground">Permissions</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-accent-foreground">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{roles.reduce((a, r) => a + r.members, 0)}</p>
              <p className="text-xs text-muted-foreground">Assigned Users</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{roles.filter((r) => !r.isSystem).length}</p>
              <p className="text-xs text-muted-foreground">Custom Roles</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roles Grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {roles.map((role) => (
          <Card key={role.id} className="border-border hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-card-foreground">{role.name}</h3>
                      {role.isSystem && <Badge variant="outline" className="text-[10px]">System</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{role.description}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewRole(role)} title="View permissions">
                    <Eye className="w-3 h-3" />
                  </Button>
                  {!role.isSystem && (
                    <>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditRole({ ...role })} title="Edit">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(role.id)} title="Delete">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border text-xs">
                <span className="text-muted-foreground">
                  {role.permissions.length} / {allPermissions.length} permissions
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Users className="w-3 h-3" /> {role.members} member{role.members !== 1 ? "s" : ""}
                </span>
              </div>
              {/* Permission preview */}
              <div className="flex flex-wrap gap-1 mt-3">
                {role.permissions.slice(0, 4).map((pId) => {
                  const p = allPermissions.find((ap) => ap.id === pId);
                  return p ? (
                    <span key={pId} className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px]">{p.label}</span>
                  ) : null;
                })}
                {role.permissions.length > 4 && (
                  <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px]">+{role.permissions.length - 4} more</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Role Permissions */}
      <Dialog open={!!viewRole} onOpenChange={(o) => !o && setViewRole(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" /> {viewRole?.name} Permissions
            </DialogTitle>
            <DialogDescription>{viewRole?.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {Object.entries(groupedPermissions).map(([category, perms]) => {
              const catPerms = perms.filter((p) => viewRole?.permissions.includes(p.id));
              if (catPerms.length === 0) return null;
              return (
                <div key={category}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">{category}</p>
                  <div className="space-y-1">
                    {perms.map((perm) => (
                      <div key={perm.id} className="flex items-center gap-2 text-sm py-1">
                        {viewRole?.permissions.includes(perm.id) ? (
                          <Check className="w-4 h-4 text-success shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-muted shrink-0" />
                        )}
                        <span className={viewRole?.permissions.includes(perm.id) ? "text-card-foreground" : "text-muted-foreground line-through"}>
                          {perm.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewRole(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Role */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Role</DialogTitle>
            <DialogDescription>Define a new role with specific permissions.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div><Label>Role Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Supervisor" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What can this role do?" /></div>
            <div>
              <Label>Permissions ({form.permissions.length} selected)</Label>
              <div className="mt-2 border border-border rounded-lg p-3">
                <PermissionCheckboxes permissions={form.permissions} onChange={(p) => setForm({ ...form, permissions: p })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Create Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role */}
      <Dialog open={!!editRole} onOpenChange={(o) => !o && setEditRole(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>Update role details and permissions.</DialogDescription>
          </DialogHeader>
          {editRole && (
            <div className="grid gap-4 py-2">
              <div><Label>Role Name</Label><Input value={editRole.name} onChange={(e) => setEditRole({ ...editRole, name: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={editRole.description} onChange={(e) => setEditRole({ ...editRole, description: e.target.value })} /></div>
              <div>
                <Label>Permissions ({editRole.permissions.length} selected)</Label>
                <div className="mt-2 border border-border rounded-lg p-3">
                  <PermissionCheckboxes permissions={editRole.permissions} onChange={(p) => setEditRole({ ...editRole, permissions: p })} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRole(null)}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>Are you sure? Users assigned to this role will lose their permissions.</DialogDescription>
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
