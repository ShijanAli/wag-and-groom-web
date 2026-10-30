"use client";

import { BadgeCheck, KeyRound, Mail, Save, ShieldCheck } from "lucide-react";
import type { z } from "zod";
import { AppForm, useZodForm } from "@/components/common/form/AppForm";
import { FieldRow, PasswordField, TextareaField, TextField } from "@/components/common/form/fields";
import { SubmitButton } from "@/components/common/form/SubmitButton";
import { ImageUploadField } from "@/components/common/ImageUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useApiMutation } from "@/lib/api/hooks";
import { fullName } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import type { AuthUser } from "@/types/models";
import { authApi } from "./api";
import { changePasswordSchema, profileSchema } from "./schemas";

/** "" → null so clearing an optional field really clears it in the database. */
const nullIfEmpty = (v: string) => (v.trim() === "" ? null : v.trim());

/** Profile + password screen shared by the admin, staff and customer panels. */
export function ProfileSettings() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <IdentityCard user={user} />
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileForm user={user} />
        </TabsContent>
        <TabsContent value="password">
          <PasswordForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function IdentityCard({ user }: { user: AuthUser }) {
  return (
    <Card className="h-fit">
      <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-primary text-3xl font-bold text-primary-foreground">
          {user.profilePhoto ? (
            // eslint-disable-next-line @next/next/no-img-element -- Cloudinary avatar
            <img src={user.profilePhoto} alt="" className="h-full w-full object-cover" />
          ) : (
            `${user.firstName[0]}${user.lastName[0]}`
          )}
        </div>
        <div>
          <p className="font-display text-lg font-bold">{fullName(user)}</p>
          <p className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <Mail className="h-3.5 w-3.5" /> {user.email}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">
            <ShieldCheck className="h-3.5 w-3.5" /> {user.role.name}
          </span>
          {user.emailVerifiedAt && (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 font-medium text-success">
              <BadgeCheck className="h-3.5 w-3.5" /> Verified
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">Member since {formatDate(user.createdAt, "MMMM yyyy")}</p>
      </CardContent>
    </Card>
  );
}

function ProfileForm({ user }: { user: AuthUser }) {
  const { setUser } = useAuth();
  const form = useZodForm(profileSchema, {
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone ?? "",
      address: user.address ?? "",
      bio: user.bio ?? "",
      profilePhoto: user.profilePhoto,
    },
  });
  const save = useApiMutation(
    (v: z.output<typeof profileSchema>) =>
      authApi.updateMe({ ...v, phone: nullIfEmpty(v.phone), address: nullIfEmpty(v.address), bio: nullIfEmpty(v.bio) }),
    {
      onSuccess: (res) => {
        setUser(res.data);
        form.reset(form.getValues()); // clear the dirty state
      },
    },
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Personal information</CardTitle>
        <CardDescription>Shown on your bookings and adoption applications.</CardDescription>
      </CardHeader>
      <CardContent>
        <AppForm form={form} onSubmit={(v) => save.mutateAsync(v)} className="space-y-4">
          <ImageUploadField name="profilePhoto" label="Photo" folder="users" aspect="square" />
          <FieldRow>
            <TextField name="firstName" label="First name" autoComplete="given-name" required />
            <TextField name="lastName" label="Last name" autoComplete="family-name" required />
          </FieldRow>
          <FieldRow>
            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input id="profile-email" value={user.email} readOnly disabled />
              <p className="text-[0.8rem] text-muted-foreground">Contact support to change your email.</p>
            </div>
            <TextField name="phone" label="Phone" type="tel" autoComplete="tel" placeholder="+8801XXXXXXXXX" />
          </FieldRow>
          <TextField name="address" label="Address" autoComplete="street-address" placeholder="House, road, area, city" />
          <TextareaField name="bio" label="About you" rows={3} placeholder="A few words about you and your pets" maxLength={1000} />
          <div className="flex justify-end">
            <SubmitButton disabled={!form.formState.isDirty} pendingText="Saving…" icon={<Save className="mr-2 h-4 w-4" />}>
              Save changes
            </SubmitButton>
          </div>
        </AppForm>
      </CardContent>
    </Card>
  );
}

function PasswordForm() {
  const form = useZodForm(changePasswordSchema, { defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" } });
  const change = useApiMutation(
    ({ currentPassword, newPassword }: z.output<typeof changePasswordSchema>) => authApi.changePassword({ currentPassword, newPassword }),
    { successMessage: "Password changed. Other devices have been signed out.", onSuccess: () => form.reset() },
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Change password</CardTitle>
        <CardDescription>8+ characters with an uppercase letter, a lowercase letter and a number.</CardDescription>
      </CardHeader>
      <CardContent>
        <AppForm form={form} onSubmit={(v) => change.mutateAsync(v)} className="max-w-md space-y-4">
          <PasswordField name="currentPassword" label="Current password" autoComplete="current-password" required />
          <PasswordField name="newPassword" label="New password" autoComplete="new-password" required />
          <PasswordField name="confirmPassword" label="Confirm new password" autoComplete="new-password" required />
          <SubmitButton pendingText="Updating…" icon={<KeyRound className="mr-2 h-4 w-4" />}>
            Update password
          </SubmitButton>
        </AppForm>
      </CardContent>
    </Card>
  );
}
