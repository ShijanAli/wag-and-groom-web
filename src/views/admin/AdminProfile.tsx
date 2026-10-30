"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { ProfileSettings } from "@/features/auth/ProfileSettings";

export default function AdminProfile() {
  return (
    <>
      <PageHeader title="Profile" description="Your personal details, photo and password." />
      <ProfileSettings />
    </>
  );
}
