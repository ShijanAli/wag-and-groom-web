"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { NotificationsCenter } from "@/features/notifications/NotificationsCenter";

export default function AdminNotifications() {
  return (
    <div className="max-w-3xl">
      <PageHeader title="Notifications" description="Your personal updates. The bell at the top shows the latest." />
      <NotificationsCenter />
    </div>
  );
}
