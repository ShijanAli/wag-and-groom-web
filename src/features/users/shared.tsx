"use client";

import { useCallback } from "react";
import { Ban, CircleCheck, CirclePause } from "lucide-react";
import { z } from "zod";
import type { RowAction } from "@/components/common/data-table";
import { useConfirm } from "@/components/common/ConfirmDialog";
import { useAuth } from "@/context/AuthContext";
import { fullName } from "@/lib/auth";
import { PERMISSIONS as P } from "@/lib/permissions";
import { emailSchema, passwordSchema, phoneSchema } from "@/features/auth/schemas";
import type { User, UserStatus } from "@/types/models";
import { useUpdateUserStatus } from "./api";

/* ───── schemas shared by every "user" form (customers, staff, team) ───── */
export const userProfileFields = {
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  phone: z.union([phoneSchema, z.literal("")]),
};
/** Empty password → the API sets a random one and the person uses "Forgot password". */
export const userCreateFields = { ...userProfileFields, email: emailSchema, password: z.union([passwordSchema, z.literal("")]) };

const STATUS_ACTIONS: { status: UserStatus; label: string; icon: typeof Ban; danger?: boolean }[] = [
  { status: "active", label: "Activate", icon: CircleCheck },
  { status: "inactive", label: "Deactivate", icon: CirclePause },
  { status: "blocked", label: "Block", icon: Ban, danger: true },
];

/**
 * Row-menu entries to activate / deactivate / block an account, each behind a confirm.
 * `self` = the signed-in user → no status actions on your own account.
 */
export function useUserStatusActions() {
  const { can, user: me } = useAuth();
  const { confirm } = useConfirm();
  const setStatus = useUpdateUserStatus();
  const { mutateAsync } = setStatus;
  const allowed = can(P.USER.UPDATE);

  return useCallback(
    (u: Pick<User, "id" | "firstName" | "lastName" | "status">): RowAction[] =>
      STATUS_ACTIONS.filter((a) => a.status !== u.status).map((a) => ({
        label: a.label,
        icon: a.icon,
        danger: a.danger,
        visible: allowed && u.id !== me?.id,
        onClick: () =>
          confirm({
            title: `${a.label} ${fullName(u)}?`,
            description: a.status === "active" ? "They will be able to sign in again." : "They will be signed out and can't sign in until reactivated.",
            confirmText: a.label,
            tone: a.danger ? "danger" : "default",
            onConfirm: () => mutateAsync({ id: u.id, status: a.status }),
          }),
      })),
    [allowed, me?.id, confirm, mutateAsync],
  );
}
