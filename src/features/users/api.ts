import { createResourceHooks, useApiMutation } from "@/lib/api/hooks";
import { api, createResource } from "@/lib/api/request";
import type { Id } from "@/lib/api/types";
import type { User, UserStatus } from "@/types/models";

export interface UserCreateInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password?: string;
  roleId: number;
  status?: UserStatus;
}

export interface UserUpdateInput {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  address?: string | null;
  bio?: string | null;
  profilePhoto?: string | null;
}

export const usersApi = {
  ...createResource<User, UserCreateInput, UserUpdateInput>("/users"),
  updateStatus: (id: Id, status: UserStatus) => api.patch<User>(`/users/${id}/status`, { status }),
  updateRole: (id: Id, roleId: number) => api.patch<User>(`/users/${id}/role`, { roleId }),
};

export const userHooks = createResourceHooks("users", usersApi);

export const useUpdateUserStatus = () =>
  useApiMutation(({ id, status }: { id: Id; status: UserStatus }) => usersApi.updateStatus(id, status), {
    invalidate: [userHooks.keys.all],
  });

export const USER_STATUS_OPTIONS: { label: string; value: UserStatus }[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Blocked", value: "blocked" },
];

export const useUpdateUserRole = () =>
  useApiMutation(({ id, roleId }: { id: Id; roleId: number }) => usersApi.updateRole(id, roleId), {
    invalidate: [userHooks.keys.all, ["roles"]],
    successMessage: "Role changed — it applies right away",
  });
