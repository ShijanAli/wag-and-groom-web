import { authClient } from "@/lib/api/client";
import { api } from "@/lib/api/request";
import type { ApiResponse } from "@/lib/api/types";
import type { AuthUser } from "@/types/models";

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
}

export interface UpdateMeInput {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  address?: string | null;
  bio?: string | null;
  profilePhoto?: string | null;
}

export const authApi = {
  login: (body: { email: string; password: string }) =>
    api.post<{ accessToken: string; user: AuthUser }>("/auth/login", body),
  register: (body: RegisterInput) => api.post("/auth/register", body),
  verifyEmail: (token: string) => api.post("/auth/verify-email", { token }),
  resendVerification: (email: string) => api.post("/auth/resend-verification", { email }),
  forgotPassword: (email: string) => api.post("/auth/forgot-password", { email }),
  resetPassword: (body: { token: string; password: string }) => api.post("/auth/reset-password", body),
  changePassword: (body: { currentPassword: string; newPassword: string }) => api.patch("/auth/change-password", body),
  me: () => api.get<AuthUser>("/auth/me"),
  updateMe: (body: UpdateMeInput) => api.patch<AuthUser>("/auth/me", body),
  /** Uses the bare client: logout must work even when the access token is gone. */
  logout: () => authClient.post<ApiResponse<null>>("/auth/logout"),
};
